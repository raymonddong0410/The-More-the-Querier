const express = require('express');
const league = require('./league');

module.exports = (pool) => {
    const router = express.Router();

    router.get('/:leagueID/teams', (req, res) => {
        const {leagueID} = req.params.leagueID;

        const query = `
        SELECT 
            t.teamID, 
            t.teamName, 
            t.totalPoints, 
            t.ranking,
        FROM team t
        WHERE t.leagueID = ?;`

        pool.query(query, [leagueID], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch teams.' });
            }

            res.status(200).json({ teams: results });
        });
    });

    return router;
}