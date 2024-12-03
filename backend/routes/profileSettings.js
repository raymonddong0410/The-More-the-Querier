const express = require('express');
const verifyToken = require('../middleware/verifyToken');

module.exports = (pool) => {
    const router = express.Router();

    // PUT endpoint to update profile settings
    router.put('/', verifyToken, (req, res) => {
        const userID = req.user.userID;
        const { favoriteSport, aboutMe } = req.body;
    
        if (!favoriteSport || !aboutMe) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
    
        const query = `
        SELECT updateProfileSetting(?, ?, ?) AS message
    `;

    pool.query(query, [userID, favoriteSport, aboutMe], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to save profile settings' });
        }

        // Get the message from the function's result
        const message = results[0]?.message || 'Profile settings updated successfully.';
        res.status(200).json({ message });
    });
    });

    // GET endpoint to retrieve profile settings
    router.get('/', verifyToken, (req, res) => {
        const userID = req.user.userID;

        const query = `
            SELECT favoriteSport, aboutMe 
            FROM profileSetting 
            WHERE userID = ?`;

        pool.query(query, [userID], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch profile settings' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Profile settings not found' });
            }

            const { favoriteSport, aboutMe } = results[0];
            res.status(200).json({ favoriteSport, aboutMe });
        });
    });

    return router;
};
