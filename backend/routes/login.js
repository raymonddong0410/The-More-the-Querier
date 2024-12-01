const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        const { username, password } = req.body;

        try {
            pool.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Login failed' });
                }

                if (results.length === 0) {
                    return res.status(401).json({ error: 'Invalid username or password' });
                }

                const user = results[0];
                if (user.isBanned) {
                    return res.status(403).json({ error: 'Account is banned. Please contact support.' });
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return res.status(401).json({ error: 'Invalid username or password' });
                }

                const token = jwt.sign(
                    { userID: user.userID, username: user.username, isAdmin: user.isAdmin }, // Include isAdmin
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                const refreshToken = jwt.sign(
                    { userID: user.userID, username: user.username, isAdmin: user.isAdmin },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: '7d' }
                );

                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                });

                return res.status(200).json({ message: 'Login successful' });
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    return router;
};
