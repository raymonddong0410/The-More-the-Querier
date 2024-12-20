const express = require('express');
const verifyToken = require('../middleware/verifyToken')

module.exports = (pool) => {
    const router = express.Router();

    router.get('/', verifyToken, (req, res) => {
        const userID = req.user.userID; // Extracted from the JWT by middleware

        const query = `
        SELECT m.matchID, m.matchDate, 
            t1.teamName AS team1Name, t2.teamName AS team2Name, 
            m.finalScore, m.winner, l.leagueName,
            CASE 
                WHEN t1.owner = ? THEN t1.teamID
                WHEN t2.owner = ? THEN t2.teamID
            END AS userTeamID
        FROM matches m
        JOIN team t1 ON t1.teamID = m.team1ID
        JOIN team t2 ON t2.teamID = m.team2ID
        JOIN league l ON l.leagueID = t1.leagueID
        WHERE t1.owner = ? OR t2.owner = ?
        ORDER BY m.matchDate ASC`;
        
        pool.query(query, [userID, userID, userID, userID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch user Matches.' });
        }
        
        const user = results;
            res.status(200).json({ user });
        });
    });
        
    return router;
}