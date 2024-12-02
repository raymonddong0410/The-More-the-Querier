const express = require('express');
const verifyToken = require('../middleware/verifyToken')

module.exports = (pool) => {
    const router = express.Router();

    // Fetch paginated list of leagues
    router.get('/', (req, res) => {
        pool.query('SELECT * FROM league', (err, results) => {
            if (err) {
                console.error('Error fetching leagues:', err);
                return res.status(500).json({ error: 'Failed to fetch leagues.' });
            }
            res.status(200).json(results);
        });
    });
    

    // Fetch details of a specific league
    router.get('/:leagueID', (req, res) => {
        const { leagueID } = req.params;
        console.log(leagueID)

        pool.query('SELECT * FROM league WHERE leagueID = ?', [leagueID], (err, results) => {
            if (err) {
                console.error('Error fetching league:', err);
                return res.status(500).json({ error: 'Failed to fetch league details.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'League not found.' });
            }

            res.status(200).json(results[0]);
        });
    });

    router.get('/:leagueID/teams', (req, res) => {
        const {leagueID} = req.params;

        const query = `
        SELECT 
            t.teamID, 
            t.teamName, 
            t.totalPoints, 
            t.ranking
        FROM team t
        WHERE t.leagueID = ?`;

        pool.query(query, [leagueID], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch teams.' });
            }

            res.status(200).json({ teams: results });
        });
    });

    // Create a new league
    router.post('/', verifyToken, (req, res) => {
        const { leagueName, leagueType, maxTeams, draftDate } = req.body;

        if (!leagueName || !leagueType || !maxTeams) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const commissioner = req.user.userID;

        const query = `
            INSERT INTO league (leagueName, leagueType, commissioner, maxTeams, draftDate)
            VALUES (?, ?, ?, ?, ?)
        `;
        pool.query(
            query,
            [leagueName, leagueType, commissioner, maxTeams, draftDate || null],
            (err, result) => {
                if (err) {
                    console.error('Error creating league:', err);
                    return res.status(500).json({ error: 'Failed to create league.' });
                }
                res.status(201).json({ message: 'League created successfully', leagueID: result.insertId });
            }
        );
    });

    router.post('/:leagueID/createTeam', verifyToken, (req, res) => {
        const { teamName, totalPoints, ranking, status } = req.body;

        const owner = req.user.userID;
        const leagueID = req.params.leagueID;

        const query = `
            INSERT INTO team (teamName, leagueID, owner, totalPoints, ranking, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        pool.query(
            query,
            [teamName, leagueID, owner, totalPoints, ranking, status],
            (err, result) => {
                if (err) {
                    console.error('Error creating team:', err);
                    return res.status(500).json({ error: 'Failed to create team.' });
                }
                res.status(201).json({ message: 'Team created successfully', teamID: result.insertId });
            }
        );
    })

    return router;
};
