const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    router.get('/', (req, res) => {
        const userID = req.user.userID;
        const { sortBy, sortOrder } = req.query;

        // Validate input to prevent SQL injection
        const validSortColumns = ['leagueName', 'leagueType', 'maxTeams', 'draftDate'];
        const validSortOrders = ['ASC', 'DESC'];

        if (!validSortColumns.includes(sortBy) || !validSortOrders.includes(sortOrder)) {
            return res.status(400).json({ error: 'Invalid sort parameters' });
        }

        pool.query('CALL SortUserLeagues(?, ?, ?)', [userID, sortBy, sortOrder], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch sorted leagues.' });
            }
            
            // MySQL stored procedures return results in a nested array
            res.status(200).json({ user: results[0] });
        });
    });
        
    return router;
};