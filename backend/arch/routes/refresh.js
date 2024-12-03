const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = () => {
    const router = express.Router();

    router.post('/', (req, res) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(403).json({ error: 'Refresh token missing' });
        }

        try {
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            const newAuthToken = jwt.sign(
                { userID: payload.userID, username: payload.username, isAdmin: payload.isAdmin }, // Include isAdmin
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('authToken', newAuthToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
            });

            res.status(200).json({ message: 'Token refreshed successfully' });
        } catch (err) {
            console.error('Invalid refresh token:', err);
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }
    });

    return router;
};
