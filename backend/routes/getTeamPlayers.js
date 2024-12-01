const express = require('express');
const verifyToken = require('../middleware/verfifyToken');

module.exports = (pool) => {
    const router = express.Router();

    router.get('/:teamID', verifyToken, (req, res) => {
        const teamID = req.params.teamID;
        
        const query = `
            SELECT 
                p.playerID, 
                p.fullname, 
                p.position, 
                p.realLifeTeam, 
                p.fantasyPoints
            FROM player p
            JOIN playerTeam pt ON p.playerID = pt.playerID
            WHERE pt.teamID = ?`;

        pool.query(query, [teamID], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch team players.' });
            }
            
            res.status(200).json({ players: results });
        });
    });
        
    return router;
};