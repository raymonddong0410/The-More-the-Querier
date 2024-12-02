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
                    'DELETE FROM profileSetting WHERE userID = ?',
                    'UPDATE team SET owner = NULL WHERE owner = ?',
                    'UPDATE league SET commissioner = NULL WHERE commissioner = ?',
                    'DELETE FROM users WHERE userID = ?'
                ];

                const executeQuery = (query) => {
                    return new Promise((resolve, reject) => {
                        connection.query(query, [userID], (err) => {
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