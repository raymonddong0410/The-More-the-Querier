const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    //display all leagues in the league page
    router.get('/', (req, res) => {
        try {
            pool.query('SELECT * FROM leagues', (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to locate any leagues' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: 'No leagues found' });
                }

                return res.status(200).json(results);
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'League fetch failed' });
        }
    });

    //Auto generated LeagueID
    const generateLeagueID = () => {
        return Math.floor(10000000 + Math.random() * 90000000);
    };

    //Check if the LeagueID generated is unique
    const isLeagueIDUnique = (leagueID) => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT COUNT(*) AS count FROM league WHERE leagueID = ?', [leagueID], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results[0].count === 0);
            });
        });
    };

    // option to design own league
    router.post('/', async (req, res) => {
        const {  
            leagueName, 
            leagueType, 
            commissioner, 
            maxTeams, 
            draftDate 
        } = req.body;

        // Input validation
        if (!leagueName || !leagueType || !commissioner || !maxTeams) {
            return res.status(400).json({ error: 'Missing required league parameters' });
        }

        // Validate leagueType
        if (leagueType !== 'P' && leagueType !== 'R') {
            return res.status(400).json({ error: 'Invalid league type. Must be P (Public) or R (Private)' });
        }

        try {

            // Generate a unique leagueID
            let leagueID;
            let isUnique = false;
                
            // Try up to 3 times to generate a unique ID
            for (let i = 0; i < 3; i++) {
                leagueID = generateUniqueLeagueID();
                isUnique = await isLeagueIDUnique(leagueID);
                    
                if (isUnique) {
                    break;
                }
            }
        
                if (!isUnique) {
                    return res.status(500).json({ error: 'Unable to generate a unique league ID' });
                }
                
            const query = `
                INSERT INTO league (
                    leagueID, 
                    leagueName, 
                    leagueType, 
                    commissioner, 
                    maxTeams, 
                    draftDate
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            pool.query(
                query, 
                [
                    leagueID, 
                    leagueName, 
                    leagueType, 
                    commissioner, 
                    maxTeams, 
                    draftDate || null
                ], 
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Failed to create league', details: err.message });
                    }

                    return res.status(201).json({ 
                        message: 'League created successfully',
                        leagueId: leagueID 
                    });
                }
            );
        } 
        
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'League creation failed' });
        }
    });

    return router;
};

