const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

const { startDraftTimer } = require('../utils/draftTimer');

module.exports = (pool) => {
    // Create a draft
    router.post('/create', verifyToken, async (req, res) => {
        const { leagueID, draftDate, draftOrder, sport } = req.body;
        const commissioner = req.user.userID;

        if (!draftDate || !['S', 'R'].includes(draftOrder) || !sport) {
            return res.status(400).json({ error: 'Invalid draft data' });
        }

        try {
            const [league] = await pool.promise().query('SELECT * FROM league WHERE leagueID = ?', [leagueID]);

            if (!league.length) {
                return res.status(404).json({ error: 'League not found' });
            }

            if (league[0].commissioner !== commissioner) {
                return res.status(403).json({ error: 'Only the commissioner can create a draft' });
            }

            const [existingDraft] = await pool.promise().query(
                'SELECT * FROM draft WHERE leagueID = ? AND sport = ?',
                [leagueID, sport]
            );

            if (existingDraft.length) {
                return res.status(400).json({ error: `A draft for ${sport} already exists in this league.` });
            }

            const [result] = await pool.promise().query(
                'INSERT INTO draft (leagueID, draftDate, draftOrder, sport, draftStatus) VALUES (?, ?, ?, ?, ?)',
                [leagueID, draftDate, draftOrder, sport, 'P'] // 'P' for Pending
            );

            res.status(201).json({ message: 'Draft created successfully', draftID: result.insertId });
        } catch (error) {
            console.error('Error creating draft:', error);
            res.status(500).json({ error: 'Failed to create draft' });
        }
    });

    // Fetch draft details
    router.get('/:draftID', verifyToken, async (req, res) => {
        const { draftID } = req.params;

        try {
            const [draft] = await pool.promise().query('SELECT * FROM draft WHERE draftID = ?', [draftID]);
            if (!draft.length) {
                return res.status(404).json({ error: 'Draft not found' });
            }

            const [players] = await pool.promise().query(
                `SELECT 
                    p.playerID, 
                    p.fullname, 
                    p.position, 
                    p.realLifeTeam, 
                    d.playerID AS drafted 
                FROM player p 
                LEFT JOIN draftedPlayers d ON p.playerID = d.playerID AND d.draftID = ?
                WHERE p.sport = ? AND p.availabilityStatus = "A"`,
                [draftID, draft[0].sport]
            );

            res.status(200).json({ draft: draft[0], players });
        } catch (error) {
            console.error('Error fetching draft details:', error);
            res.status(500).json({ error: 'Failed to fetch draft details' });
        }
    });

    // Fetch current turn for a draft
    router.get('/:draftID/currentTurn', verifyToken, async (req, res) => {
        const { draftID } = req.params;
    
        try {
            const [[draft]] = await pool.promise().query('SELECT * FROM draft WHERE draftID = ?', [draftID]);
            if (!draft || draft.draftStatus !== 'A') {
                return res.status(400).json({ error: 'Draft has not started yet or is inactive.' });
            }
    
            const [order] = await pool.promise().query(
                'SELECT teamID FROM draftOrder WHERE draftID = ? ORDER BY pickOrder',
                [draftID]
            );
    
            if (!order.length) return res.status(400).json({ error: 'No teams found for the draft.' });
    
            const numTeams = order.length;
            const round = Math.floor(draft.picksMade / numTeams);
            const pickIndex = draft.picksMade % numTeams;
    
            let currentTurnTeamID;
            if (draft.draftOrder === 'S') {
                // Snake draft logic
                currentTurnTeamID = round % 2 === 0
                    ? order[pickIndex].teamID
                    : order[numTeams - 1 - pickIndex].teamID;
            } else {
                // Round robin logic
                currentTurnTeamID = order[pickIndex].teamID;
            }
    
            res.status(200).json({ teamID: currentTurnTeamID });
        } catch (error) {
            console.error('Error fetching current turn:', error);
            res.status(500).json({ error: 'Failed to fetch current turn.' });
        }
    });
    


    // Make a draft pick
    router.post('/:draftID/pick', verifyToken, async (req, res) => {
        const { draftID } = req.params;
        const { playerID } = req.body;
        const userID = req.user.userID;

        try {
            // Fetch the draft
            const [[draft]] = await pool.promise().query('SELECT * FROM draft WHERE draftID = ?', [draftID]);
            if (!draft) return res.status(404).json({ error: 'Draft not found' });

            // Verify the current turn
            const [currentTurnData] = await pool.promise().query(
                `SELECT o.teamID 
                FROM draftOrder o 
                JOIN draft d ON o.draftID = d.draftID 
                WHERE d.draftID = ? 
                ORDER BY o.pickOrder ASC 
                LIMIT 1 OFFSET ?`,
                [draftID, draft.picksMade]
            );

            const currentTurnTeamID = currentTurnData && currentTurnData[0] ? currentTurnData[0].teamID : null;
            if (!currentTurnTeamID) return res.status(400).json({ error: 'No valid draft turn found' });

            const [[team]] = await pool.promise().query('SELECT * FROM team WHERE teamID = ?', [currentTurnTeamID]);
            if (!team || team.owner !== userID) {
                return res.status(403).json({ error: 'Not your turn to draft' });
            }

            // Verify player sport and availability
            const [[player]] = await pool.promise().query(
                'SELECT * FROM player WHERE playerID = ? AND sport = ? AND availabilityStatus = "1"',
                [playerID, draft.sport]
            );
            if (!player) return res.status(400).json({ error: 'Invalid player for this draft or player not available' });

            // Check if the player has already been drafted
            const [[drafted]] = await pool.promise().query(
                'SELECT * FROM draftedPlayers WHERE draftID = ? AND playerID = ?',
                [draftID, playerID]
            );
            if (drafted) return res.status(400).json({ error: 'Player already drafted' });

            // Insert draft pick and update picksMade
            await pool.promise().query(
                'INSERT INTO draftedPlayers (draftID, playerID, teamID) VALUES (?, ?, ?)',
                [draftID, playerID, currentTurnTeamID]
            );
            await pool.promise().query(
                'UPDATE draft SET picksMade = picksMade + 1 WHERE draftID = ?',
                [draftID]
            );

            res.status(200).json({ message: 'Draft pick successful' });
        } catch (error) {
            console.error('Error making draft pick:', error);
            res.status(500).json({ error: 'Failed to make draft pick' });
        }
    });

    // Start the draft (includes initializing the draft order)
    router.post('/:draftID/start', verifyToken, async (req, res) => {
        const { draftID } = req.params;

        try {
            // Fetch draft details
            const [draft] = await pool.promise().query('SELECT * FROM draft WHERE draftID = ?', [draftID]);
            if (!draft.length || draft[0].draftStatus !== 'P') {
                return res.status(400).json({ error: 'Draft cannot be started.' });
            }

            // Initialize draft order
            console.log(`Initializing draft order for draftID: ${draftID}`);
            const [teams] = await pool.promise().query(
                `SELECT dt.teamID 
                FROM draftTeams dt
                WHERE dt.draftID = ?
                ORDER BY RAND()`,
                [draftID]
            );

            if (!teams.length) {
                console.error(`No teams found for draftID ${draftID}`);
                return res.status(400).json({ error: 'No teams found to initialize draft order.' });
            }

            const orderData = teams.map((team, index) => [draftID, team.teamID, index]);
            console.log(`Inserting draft order for draftID ${draftID}:`, orderData);

            await pool.promise().query(
                'INSERT INTO draftOrder (draftID, teamID, pickOrder) VALUES ?',
                [orderData]
            );

            console.log(`Draft order initialized successfully for draftID ${draftID}`);

            // Update draft status to active
            const currentTime = new Date();
            await pool.promise().query(
                'UPDATE draft SET draftStatus = "A", lastPickTime = ? WHERE draftID = ?',
                [currentTime, draftID]
            );

            // Start draft timer
            startDraftTimer(pool, draftID);
            console.log(`Draft timer started for draftID ${draftID}`);

            res.status(200).json({ message: 'Draft started and order initialized successfully.' });
        } catch (error) {
            console.error('Error starting draft:', error);
            res.status(500).json({ error: 'Failed to start draft.' });
        }
    });


    // Fetch all drafts for a league
    router.get('/league/:leagueID', verifyToken, async (req, res) => {
        const { leagueID } = req.params;

        try {
            const [drafts] = await pool.promise().query('SELECT * FROM draft WHERE leagueID = ?', [leagueID]);
            res.status(200).json(drafts);
        } catch (error) {
            console.error('Error fetching drafts:', error);
            res.status(500).json({ error: 'Failed to fetch drafts' });
        }
    });

    // Add a team to a draft
    router.post('/:draftID/join', verifyToken, async (req, res) => {
        const { draftID } = req.params;
        const { teamID } = req.body;

        try {
            const [draft] = await pool.promise().query('SELECT * FROM draft WHERE draftID = ?', [draftID]);
            if (!draft.length) {
                return res.status(404).json({ error: 'Draft not found' });
            }

            const [team] = await pool.promise().query('SELECT * FROM team WHERE teamID = ?', [teamID]);
            if (!team.length) {
                return res.status(404).json({ error: 'Team not found' });
            }

            const [exists] = await pool.promise().query(
                'SELECT * FROM draftTeams WHERE draftID = ? AND teamID = ?',
                [draftID, teamID]
            );
            if (exists.length) {
                return res.status(400).json({ error: 'Team already in the draft' });
            }

            await pool.promise().query('INSERT INTO draftTeams (draftID, teamID) VALUES (?, ?)', [draftID, teamID]);
            res.status(200).json({ message: 'Team joined the draft successfully' });
        } catch (error) {
            console.error('Error joining draft:', error);
            res.status(500).json({ error: 'Failed to join draft' });
        }
    });

    // Remove a team from a draft
    router.post('/:draftID/leave', verifyToken, async (req, res) => {
        const { draftID } = req.params;
        const { teamID } = req.body;

        try {
            await pool.promise().query('DELETE FROM draftTeams WHERE draftID = ? AND teamID = ?', [draftID, teamID]);
            res.status(200).json({ message: 'Team left the draft successfully' });
        } catch (error) {
            console.error('Error leaving draft:', error);
            res.status(500).json({ error: 'Failed to leave draft' });
        }
    });

    // Fetch teams for a specific draft
    router.get('/:draftID/teams', verifyToken, async (req, res) => {
        const { draftID } = req.params;

        try {
            const [teams] = await pool.promise().query(
                `SELECT t.* 
                FROM team t
                JOIN draftTeams dt ON t.teamID = dt.teamID
                WHERE dt.draftID = ?`,
                [draftID]
            );
            res.status(200).json({ teams });
        } catch (error) {
            console.error('Error fetching teams for draft:', error);
            res.status(500).json({ error: 'Failed to fetch teams' });
        }
    });

    // Fetch all drafted players for a specific draft
    router.get('/:draftID/draftedPlayers', verifyToken, async (req, res) => {
        const { draftID } = req.params;

        try {
            const [draftedPlayers] = await pool.promise().query(
                `SELECT dp.playerID, p.fullname, dp.teamID 
                FROM draftedPlayers dp
                JOIN player p ON dp.playerID = p.playerID
                WHERE dp.draftID = ?`,
                [draftID]
            );
            res.status(200).json({ draftedPlayers });
        } catch (error) {
            console.error('Error fetching drafted players:', error);
            res.status(500).json({ error: 'Failed to fetch drafted players.' });
        }
    });


    // Fetch all drafts where the user's team has joined
    router.get('/user/joined', verifyToken, async (req, res) => {
        const userID = req.user.userID;

        try {
            const [drafts] = await pool.promise().query(
                `SELECT d.*, t.teamID 
                FROM draft d
                JOIN draftTeams dt ON d.draftID = dt.draftID
                JOIN team t ON t.teamID = dt.teamID
                WHERE t.owner = ?`,
                [userID]
            );
            res.status(200).json(drafts);
        } catch (error) {
            console.error('Error fetching joined drafts:', error);
            res.status(500).json({ error: 'Failed to fetch joined drafts' });
        }
    });



    return router;
};