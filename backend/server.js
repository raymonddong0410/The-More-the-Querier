require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { pool, initializeDatabase } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5173', // Development frontend
        'https://themorethequerier.online', // Production frontend
    ],
    methods: ['GET', 'POST'],
    credentials: true, // Allow cookies to be sent with requests
}));
app.use(express.json());

// Initialize the database and start the server
initializeDatabase(pool)
    .then(() => {
        // Prefix all routes with /backend
        app.use('/backend/register', require('./routes/register')(pool));
        app.use('/backend/login', require('./routes/login')(pool));
        app.use('/backend/protected', require('./routes/protected')(pool));
        app.use('/backend/logout', require('./routes/logout')());
        app.use('/backend/refresh', require('./routes/refresh')()); // Include refresh route
        app.use('/backend/validate', require('./routes/validate')());

        app.use('/backend/fetchUserData', require('./routes/fetchUserData')(pool));
        app.use('/backend/userLeagues', require('./routes/getUserLeagues')(pool));
        app.use('/backend/userMatches', require('./routes/getUserMatches')(pool));

        app.use('/backend/teamDetails', require('./routes/getTeamDetails')(pool));
        app.use('/backend/teamPlayers', require('./routes/getTeamPlayers')(pool));


        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on ${port}`);
        });
    })
    .catch((err) => {
        console.error('Database initialization failed:', err);
        process.exit(1);
    });