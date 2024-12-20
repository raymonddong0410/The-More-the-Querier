const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        const { username, password, fullname, email } = req.body;

        if (!username || !password || !fullname || !email) {
            return res.status(400).json({ error: 'Missing user fields' });
        }

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into the database
            pool.query(
                'INSERT INTO users (username, password, fullname, email, isAdmin) VALUES (?, ?, ?, ?, ?)',
                [username, hashedPassword, fullname, email, false], // Default isAdmin to false
                (err, results) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({ error: 'Username already exists' });
                        }
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Registration failed' });
                    }

                    if (!results.insertId) {
                        return res.status(500).json({ error: 'Failed to retrieve user ID' });
                    }

                    const authToken = jwt.sign(
                        { userID: results.insertId, username, isAdmin: false }, // Include isAdmin
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    const refreshToken = jwt.sign(
                        { userID: results.insertId, username, isAdmin: false },
                        process.env.REFRESH_TOKEN_SECRET,
                        { expiresIn: '7d' }
                    );

                    res.cookie('authToken', authToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'Strict',
                    });
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'Strict',
                    });

                    return res.status(201).json({ message: 'User registered and logged in successfully' });
                }
            );
        } catch (err) {
            console.error('Unexpected error:', err);
            res.status(500).json({ error: 'Registration failed' });
        }
    });

    return router;
};
