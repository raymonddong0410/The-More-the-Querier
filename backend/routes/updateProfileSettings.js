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
            UPDATE profileSetting
            SET favoriteSport = ?, aboutMe = ?
            WHERE userID = ?`;
    
        pool.query(query, [favoriteSport, aboutMe, userID], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to save profile settings' });
            }
    
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Profile settings not found for this user.' });
            }
    
            res.status(200).json({ message: 'Profile settings updated successfully.' });
        });
    });
    

   
    

    return router;
};
