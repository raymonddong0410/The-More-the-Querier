const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    router.get('/:teamID', async (req, res) => {
        const teamID = req.params.teamID;

            // Query to fetch matches for a specific team
        const query = `
            SELECT 
                m.matchID, 
                m.team1ID, 
                m.team2ID, 
                m.matchDate, 
                m.finalScore, 
                m.winner,
                t1.teamName as team1Name,
                t2.teamName as team2Name
            FROM matches m
            LEFT JOIN team t1 ON m.team1ID = t1.teamID
            LEFT JOIN team t2 ON m.team2ID = t2.teamID
            WHERE m.team1ID = ? OR m.team2ID = ?
            ORDER BY m.matchDate DESC
            `;

            const [matches] = await pool.promise().query(query, [teamID, teamID]);

            // Format the response
            res.json({
                matches: matches.map(match => ({
                    matchID: match.matchID,
                    team1ID: match.team1ID,
                    team2ID: match.team2ID,
                    matchDate: match.matchDate,
                    finalScore: match.finalScore,
                    winner: match.winner,
                    team1Name: match.team1Name,
                    team2Name: match.team2Name
                }))
            }); 
    });

    return router;
};