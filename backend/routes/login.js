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
                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return res.status(401).json({ error: 'Invalid username or password' });
                }

                // Generate Access Token
                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                // Generate Refresh Token
                const refreshToken = jwt.sign(
                    { id: user.id, username: user.username },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: '7d' } // Longer expiry for refresh token
                );

                // Send tokens as HTTP-only cookies
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