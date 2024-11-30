const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = () => {
    const router = express.Router();

    // Middleware to verify authToken
    const verifyToken = (req, res, next) => {
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ error: 'Access denied, token missing!' });
        }

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified; // Attach user data to request
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired, please refresh.' });
            }
            return res.status(403).json({ error: 'Invalid token!' });
        }
    };

    router.get('/', verifyToken, (req, res) => {
        res.json({ message: `Welcome, ${req.user.username}!`, user: req.user });
    });

    return router;
};
