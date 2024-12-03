const express = require('express');
const verifyToken = require('../middleware/verifyToken')

module.exports = (pool) => {
    const router = express.Router();

    router.get('/', verifyToken, (req, res) => {
        const userID = req.user.userID; // Extracted from the JWT by middleware

        const query = `
            SELECT DISTINCT l.leagueID, l.leagueName, l.leagueType, l.commissioner, l.maxTeams, l.draftDate
            FROM league l
            LEFT JOIN team t ON t.leagueID = l.leagueID
            WHERE l.commissioner = ? OR t.owner = ?`;
        
        pool.query(query, [userID, userID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch user Leagues.' });
        }
        
        const user = results;
            res.status(200).json({ user });
        });
    });
        
    return router;
}