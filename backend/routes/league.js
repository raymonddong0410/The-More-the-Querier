const express = require('express');

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
    router.get('/:id', (req, res) => {
        const { id } = req.params;

        pool.query('SELECT * FROM league WHERE leagueID = ?', [id], (err, results) => {
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

    // Create a new league
    router.post('/', (req, res) => {
        const { leagueName, leagueType, commissioner, maxTeams, draftDate } = req.body;

        if (!leagueName || !leagueType || !commissioner || !maxTeams) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

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

    return router;
};
