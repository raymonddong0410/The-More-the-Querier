const express = require('express');
const verifyToken = require('../middleware/verfifyToken')

module.exports = (pool) => {
    const router = express.Router();

    // Get user profile
    router.get('/', verifyToken, (req, res) => {
        const userID = req.user.userID; // Extracted from the JWT by middleware
        
        pool.query('SELECT * FROM users WHERE userID = ?', [userID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch user data.' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        const user = results[0];
            res.status(200).json({ user });
        });
    });
        
    return router;
}