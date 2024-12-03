const express = require('express');
const verifyToken = require('../middleware/verifyToken');

module.exports = (pool) => {
    const router = express.Router();

    // Create a new league (with optional commissioner team)
    router.post('/', verifyToken, async (req, res) => {
        const { leagueName, leagueType, maxTeams, draftDate, createTeam, teamName } = req.body;

        if (!leagueName || !leagueType || !maxTeams) {
            return res.status(400).json({ error: 'Missing required fields: leagueName, leagueType, or maxTeams.' });
        }

        if (createTeam && (!teamName || teamName.length > 25)) {
            return res.status(400).json({ error: 'Invalid team name. Ensure it is not empty and within 25 characters.' });
        }

        const commissioner = req.user.userID;

        const connection = await pool.promise().getConnection();
        try {
            await connection.beginTransaction();

            const [leagueResult] = await connection.query(
                `INSERT INTO league (leagueName, leagueType, commissioner, maxTeams, draftDate)
                VALUES (?, ?, ?, ?, ?)`,
                [leagueName, leagueType, commissioner, maxTeams, draftDate || null]
            );

            const leagueID = leagueResult.insertId;

            if (createTeam) {
                await connection.query(
                    `INSERT INTO team (teamName, leagueID, owner, totalPoints, ranking, status)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [teamName, leagueID, commissioner, 0, null, 'A']
                );
            }

            await connection.commit();
            res.status(201).json({ message: 'League created successfully', leagueID });
        } catch (error) {
            console.error('Error creating league or team:', error);
            await connection.rollback();
            res.status(500).json({ error: 'Failed to create league or team.' });
        } finally {
            connection.release();
        }
    });

     // Fetch all leagues
     router.get('/', async (req, res) => {
        try {
            const [leagues] = await pool.promise().query('SELECT * FROM league');
            res.status(200).json(leagues);
        } catch (error) {
            console.error('Error fetching leagues:', error);
            res.status(500).json({ error: 'Failed to fetch leagues.' });
        }
    });

    // Fetch specific league by ID (include commissioner username)
    router.get('/:leagueID', async (req, res) => {
        const { leagueID } = req.params;

        try {
            const [league] = await pool.promise().query(
                `SELECT l.*, u.username AS commissionerUsername
                 FROM league l
                 JOIN users u ON l.commissioner = u.userID
                 WHERE l.leagueID = ?`,
                [leagueID]
            );

            if (league.length === 0) {
                return res.status(404).json({ error: 'League not found.' });
            }

            res.status(200).json(league[0]);
        } catch (error) {
            console.error('Error fetching league:', error);
            res.status(500).json({ error: 'Failed to fetch league.' });
        }
    });

    // Fetch teams for a league (include owner username)
    router.get('/:leagueID/teams', async (req, res) => {
        const { leagueID } = req.params;
    
        try {
            const [teams] = await pool.promise().query(
                `SELECT t.teamID, t.teamName, t.totalPoints, t.ranking, t.owner, u.username AS ownerUsername
                 FROM team t
                 JOIN users u ON t.owner = u.userID
                 WHERE t.leagueID = ?`,
                [leagueID]
            );
    
            res.status(200).json({ teams });
        } catch (error) {
            console.error('Error fetching teams:', error);
            res.status(500).json({ error: 'Failed to fetch teams.' });
        }
    });
    

    // Join a league and create a team
    router.post('/:leagueID/join', verifyToken, async (req, res) => {
        const { leagueID } = req.params;
        const { teamName } = req.body;
        const userID = req.user.userID;

        if (!teamName || teamName.length > 25) {
            return res.status(400).json({ error: 'Invalid team name.' });
        }

        const connection = await pool.promise().getConnection();
        try {
            await connection.beginTransaction();

            // Check if league exists
            const [league] = await connection.query(
                `SELECT * FROM league WHERE leagueID = ?`,
                [leagueID]
            );

            if (!league.length) {
                throw new Error('League not found.');
            }

            if (league[0].leagueType === 'R') {
                throw new Error('Joining private leagues is not supported in this version.');
            }

            // Check if league is full
            const [teams] = await connection.query(
                `SELECT COUNT(*) AS teamCount FROM team WHERE leagueID = ?`,
                [leagueID]
            );

            if (teams[0].teamCount >= league[0].maxTeams) {
                throw new Error('League is full.');
            }

            // Create the user's team
            await connection.query(
                `INSERT INTO team (teamName, leagueID, owner, totalPoints, ranking, status)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [teamName, leagueID, userID, 0, null, 'A']
            );

            await connection.commit();
            res.status(201).json({ message: 'Successfully joined the league and created your team.' });
        } catch (error) {
            console.error('Error joining league:', error);
            await connection.rollback();
            res.status(500).json({ error: error.message || 'Failed to join league.' });
        } finally {
            connection.release();
        }
    });

    return router;
};
