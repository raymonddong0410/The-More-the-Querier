const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = () => {
    const router = express.Router();

    router.get('/', (req, res) => {
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ error: 'No token provided. Please log in.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.userID.isBanned) {
                return res.status(403).json({ error: 'Account is banned. Please contact support.' });
            }
            
            return res.status(200).json({
                message: 'Token is valid',
                user: {
                    id: decoded.userID,
                    username: decoded.username,
                    isAdmin: decoded.isAdmin, // Include isAdmin in the response
                },
            });
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired. Please refresh your session.' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
    });

    return router;
};
