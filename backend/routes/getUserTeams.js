const express = require('express');
const verifyToken = require('../middleware/verifyToken');

module.exports = (pool) => {
    const router = express.Router();

    // Fetch all teams for the logged-in user
    router.get('/', verifyToken, (req, res) => {
        const userID = req.user.userID;

        const query = `
            SELECT 
                t.teamID,
                t.teamName,
                t.totalPoints,
                t.ranking,
                l.leagueName,
                l.leagueID
            FROM team t
            JOIN league l ON t.leagueID = l.leagueID
            WHERE t.owner = ?`;

        pool.query(query, [userID], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch teams.' });
            }

            res.status(200).json({ teams: results });
        });
    });

    return router;
};
