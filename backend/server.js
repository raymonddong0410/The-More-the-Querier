require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

app.use(cors());
app.use(express.json());

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Registration failed' });
                }
                return res.status(201).json({ message: 'User registered successfully' });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
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

            // In a real application, you would generate a JWT or session token here
            return res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username } });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Example protected route
app.get('/protected', (req, res) => {
    // In a real application, you would authenticate the user here (e.g., using JWT or session)
    res.json({ message: 'This is a protected route' });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});