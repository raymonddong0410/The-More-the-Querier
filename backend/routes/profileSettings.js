// profileSettings.js (backend route)
const express = require('express');
const verifyToken = require('../middleware/verifyToken');  
const router = express.Router();

// Example PUT route for profile settings
router.put('/profileSettings', verifyToken, (req, res) => {
    const userID = req.user.userID;
    const { favoriteSport, aboutMe } = req.body;
    const query = `
        UPDATE profileSetting
        SET favoriteSport = ?, aboutMe = ?
        WHERE userID = ?`;

    pool.query(query, [favoriteSport, aboutMe, userID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to save profile settings' });
        }

        res.status(200).json({ message: 'Profile settings updated successfully' });
    });
});

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