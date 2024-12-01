const express = require('express');

module.exports = (pool) => {
    const router = express.Router();


    router.get('/', (req, res) => {
        console.log("Received GET request to /backend/league");
        try {
            console.log("Attempting to query leagues table");
            pool.query('SELECT * FROM league', (err, results) => {
                console.log("Query completed", { err, resultsCount: results ? results.length : 'N/A' });
                
                if (err) {
                    console.error('Database query error:', err);
                    return res.status(500).json({ 
                        error: 'Failed to locate any leagues', 
                        details: err.message 
                    });
                }
    
                if (results.length === 0) {
                    console.log("No leagues found in database");
                    return res.status(404).json({ message: 'No leagues found' });
                }
    
                return res.status(200).json(results);
            });
        } catch (err) {
            console.error('Unexpected error in league fetch:', err);
            res.status(500).json({ 
                error: 'League fetch failed', 
                details: err.message 
            });
        }
    });

    // display all leagues in the league page
    router.get('/', (req, res) => {
        try {
            pool.query('SELECT * FROM league', (err, results) => {
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

    // option to design own league
    router.post('/', async (req, res) => {
        const {
            leagueID,  
            leagueName, 
            leagueType, 
            commissioner, 
            maxTeams, 
            draftDate 
        } = req.body;

        // Input validation
        if (!leagueID || !leagueName || !leagueType || !commissioner || !maxTeams) {
            return res.status(400).json({ error: 'Missing required league parameters' });
        }

        // Validate leagueType
        if (leagueType !== 'P' && leagueType !== 'R') {
            return res.status(400).json({ error: 'Invalid league type. Must be P (Public) or R (Private)' });
        }

        try {
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

