const express = require('express');
const verifyToken = require('../middleware/verfifyToken');

module.exports = (pool) => {
    const router = express.Router();

    router.get('/:playerID', verifyToken, (req, res) => {
        const playerID = req.params.playerID;

        const query = `
            SELECT 
                p.playerID, 
                p.fullname, 
                p.sport,
                p.position,
                p.realLifeTeam,
                p.fantasyPoints,
                p.availabilityStatus
            FROM player p
            WHERE p.playerID = ?`;

        pool.query(query, [playerID], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch player details.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Player not found.' });
            }
            
            res.status(200).json({ player: results[0] });
        })
    })

    return router;
};