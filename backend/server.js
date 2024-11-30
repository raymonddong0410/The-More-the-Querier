require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Create a temporary connection to MySQL for database creation
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Ensure the database exists
connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``, (err, results) => {
    if (err) {
        console.error('Error creating database:', err);
        process.exit(1); // Exit if database creation fails
    }
    console.log(`Database ${process.env.DB_NAME} is ready.`);
    connection.end(); // Close the temporary connection

    // Proceed to initialize the application
    initializeApp();
});

// Initialize the application and MySQL connection pool
function initializeApp() {
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

    // Function to ensure tables exist
    function createTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS another_table (
                id INT AUTO_INCREMENT PRIMARY KEY,
                example_column VARCHAR(255)
            )`
        ];

        queries.forEach((query) => {
            pool.query(query, (err, results) => {
                if (err) {
                    console.error(`Error creating table: ${err}`);
                } else {
                    console.log('Table ensured: ', query.split(' ')[2]); // Log the table name
                }
            });
        });
    }

    // Call the function to create tables
    createTables();

    app.use(cors({
        origin: [
            'https://themorethequerier.online', // Production frontend
            'http://localhost:5173' // Local frontend during development
        ],
        // origin: 'https://themorethequerier.online', // Allow requests only from your frontend
        methods: ['GET', 'POST'], // Specify allowed HTTP methods
        credentials: true, // Include cookies if needed
    }));

    app.use(express.json());

    // Define an API router
    const apiRouter = express.Router();

    // Registration endpoint
    apiRouter.post('/register', async (req, res) => {
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
    apiRouter.post('/login', async (req, res) => {
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

                return res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username } });
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    // Example protected route
    apiRouter.get('/protected', (req, res) => {
        res.json({ message: 'This is a protected route' });
    });

    // Mount the API router on '/backend'
    app.use('/backend', apiRouter);

    // Start the server
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}