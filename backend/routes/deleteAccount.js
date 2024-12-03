const express = require('express');
const verifyToken = require('../middleware/verifyToken');

module.exports = (pool) => {
    const router = express.Router();

    router.delete('/', verifyToken, (req, res) => {
        const userID = req.user.userID;

        // Start a transaction to ensure data integrity
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

                    // Update matches to set team1ID and team2ID to NULL for teams in leagues owned by user
                    // Update matches to set team1ID and team2ID to NULL for teams in leagues owned by user
                    `UPDATE matches 
                    SET team1ID = NULL 
                    WHERE team1ID IN (
                        SELECT teamID 
                        FROM team 
                        WHERE owner = ?
                    )`,
                    
                    `UPDATE matches 
                    SET team2ID = NULL 
                    WHERE team2ID IN (
                        SELECT teamID 
                        FROM team 
                        WHERE owner = ?
                    );`,

                    // Delete playerTeam entries for all teams in leagues owned by user
                    'DELETE FROM playerTeam WHERE teamID IN (SELECT teamID FROM team WHERE leagueID IN (SELECT leagueID FROM league WHERE commissioner = ?))',

                    // Delete draftedPlayer entries for all drafts in leagues owned by user
                    'DELETE FROM draftedPlayers WHERE draftID IN (SELECT draftID FROM draft WHERE leagueID IN (SELECT leagueID FROM league WHERE commissioner = ?))',
                    
                    // Delete draft entries in leagues owned by user
                    'DELETE FROM draft WHERE leagueID IN (SELECT leagueID FROM league WHERE commissioner = ?)',
                    
                    // Delete teams in leagues owned by the user
                    'DELETE FROM team WHERE leagueID IN (SELECT leagueID FROM league WHERE commissioner = ?)',
                    
                    // Delete leagues owned by the user
                    'DELETE FROM league WHERE commissioner = ?',
                    
                    // Remove user from teams as owner
                    `UPDATE team SET status = 'I' WHERE owner = ?`,
                    
                    // Delete profile settings
                    'DELETE FROM profileSetting WHERE userID = ?',
                    
                    // Delete user record
                    'DELETE FROM users WHERE userID = ?'
                ];

                const executeQuery = (query) => {
                    return new Promise((resolve, reject) => {
                        const params = query.includes('DELETE FROM matches') 
                            ? [userID, userID]  // Two parameters for the matches deletion query
                            : [userID];          // Single parameter for other queries
                
                        connection.query(query, params, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                };

                // execute queries on all parts
                Promise.all(deletionQueries.map(executeQuery))
                    .then(() => {
                        connection.commit((err) => {
                            connection.release();
                            
                            if (err) {
                                return res.status(500).json({ error: 'Transaction commit failed' });
                            }

                             // Clear authentication cookies so user can go back to onboard page
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
                        // Rollback the transaction if any query fails
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