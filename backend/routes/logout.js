const express = require('express');

module.exports = () => {
    const router = express.Router();

    router.post('/', (req, res) => {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        res.status(200).json({ message: 'Logout successful' });
    });

    return router;
};