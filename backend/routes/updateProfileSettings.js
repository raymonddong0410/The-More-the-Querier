const express = require('express');
const verifyToken = require('../middleware/verifyToken');

module.exports = (pool) => {
    const router = express.Router();

    router.put('/', verifyToken, (req, res) => {
        console.log('User ID:', req.user.userID); // Log user ID to confirm user is authenticated
    
        const userID = req.user.userID;
        const { favoriteSport, aboutMe } = req.body;
    
        if (!favoriteSport || !aboutMe) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
    
        const query = `
        INSERT INTO profileSetting (userID, favoriteSport, aboutMe)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        favoriteSport = VALUES(favoriteSport), 
        aboutMe = VALUES(aboutMe)`;

    pool.query(query, [userID, favoriteSport, aboutMe], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to save profile settings' });
        }

        res.status(200).json({ message: 'Profile settings updated successfully.' });
    });
    });
    

   
    

    return router;
};
