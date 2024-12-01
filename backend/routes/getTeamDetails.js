const express = require('express');
const verifyToken = require('../middleware/verfifyToken');

module.exports = (pool) => {
    const router = express.Router();

    router.get('/:teamID', verifyToken, (req, res) => {
        const teamID = req.params.teamID;
        
        const query = `
            SELECT 
                t.teamID, 
                t.teamName, 
                t.totalPoints, 
                t.ranking, 
                t.status, 
                l.leagueName,
                u.username
            FROM team t
            JOIN league l ON t.leagueID = l.leagueID
            JOIN users u ON t.owner = u.userID
            WHERE t.teamID = ?`;

        pool.query(query, [teamID], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch team details.' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Team not found.' });
            }
            
            res.status(200).json({ team: results[0] });
        });
    });
        
    return router;
};