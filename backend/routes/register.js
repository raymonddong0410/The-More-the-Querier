const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into the database
            pool.query(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, hashedPassword],
                (err, results) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            // Handle duplicate username error
                            return res.status(400).json({ error: 'Username already exists' });
                        }
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Registration failed' });
                    }

                    // Check if insertId is valid
                    if (!results.insertId) {
                        return res.status(500).json({ error: 'Failed to retrieve user ID' });
                    }

                    // Generate Access Token
                    const authToken = jwt.sign(
                        { id: results.insertId, username },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    // Generate Refresh Token
                    const refreshToken = jwt.sign(
                        { id: results.insertId, username },
                        process.env.REFRESH_TOKEN_SECRET,
                        { expiresIn: '7d' }
                    );

                    // Send tokens as HTTP-only cookies
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