const express = require('express');
const verifyToken = require('../middleware/verifyToken');

module.exports = (pool) => {
    const router = express.Router();

    router.delete('/', verifyToken, (req, res) => {
        const userID = req.user.userID;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).json({ error: 'Database connection failed' });
            }

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return res.status(500).json({ error: 'Transaction start failed' });
                }

                const deletionQueries = [
                    // Nullify team references in matches (team1ID, team2ID, and winner)
                    `UPDATE matches 
                    SET team1ID = NULL 
                    WHERE team1ID IN (
                        SELECT teamID 
                        FROM team 
                        WHERE leagueID IN (
                            SELECT leagueID 
                            FROM league 
                            WHERE commissioner = ?
                        )
                    )`,
                    `UPDATE matches 
                    SET team2ID = NULL 
                    WHERE team2ID IN (
                        SELECT teamID 
                        FROM team 
                        WHERE leagueID IN (
                            SELECT leagueID 
                            FROM league 
                            WHERE commissioner = ?
                        )
                    )`,
                    `UPDATE matches 
                    SET winner = NULL 
                    WHERE winner IN (
                        SELECT teamID 
                        FROM team 
                        WHERE leagueID IN (
                            SELECT leagueID 
                            FROM league 
                            WHERE commissioner = ?
                        )
                    )`,

                    // Delete draftedPlayers entries
                    `DELETE FROM draftedPlayers 
                    WHERE draftID IN (
                        SELECT draftID 
                        FROM draft 
                        WHERE leagueID IN (
                            SELECT leagueID 
                            FROM league 
                            WHERE commissioner = ?
                        )
                    )`,

                    // Delete drafts
                    `DELETE FROM draft 
                    WHERE leagueID IN (
                        SELECT leagueID 
                        FROM league 
                        WHERE commissioner = ?
                    )`,

                    // Delete teams
                    `DELETE FROM team 
                    WHERE leagueID IN (
                        SELECT leagueID 
                        FROM league 
                        WHERE commissioner = ?
                    )`,

                    // Delete leagues
                    `DELETE FROM league 
                    WHERE commissioner = ?`,

                    // Delete profile settings
                    `DELETE FROM profileSetting 
                    WHERE userID = ?`,

                    // Delete user account
                    `DELETE FROM users 
                    WHERE userID = ?`
                ];

                const executeQuery = (query, params) => {
                    return new Promise((resolve, reject) => {
                        connection.query(query, params, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                };

                Promise.all(deletionQueries.map(query => executeQuery(query, [userID])))
                    .then(() => {
                        connection.commit((err) => {
                            connection.release();

                            if (err) {
                                return res.status(500).json({ error: 'Transaction commit failed' });
                            }

                            // Clear authentication cookies
                            res.clearCookie('authToken', {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'Strict'
                            });
                            res.clearCookie('refreshToken', {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'Strict'
                            });

                            res.status(200).json({ message: 'Account deleted successfully' });
                        });
                    })
                    .catch((error) => {
                        connection.rollback(() => {
                            connection.release();
                            console.error('Account deletion error:', error);
                            res.status(500).json({ error: 'Failed to delete account' });
                        });
                    });
            });
        });
    });

    return router;
};
