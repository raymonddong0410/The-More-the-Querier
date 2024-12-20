require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { pool, initializeDatabase } = require('./db');

const app = express();
const port = process.env.PORT || 3000;
const verifyToken = require('./middleware/verifyToken');
const { resumeDrafts } = require('./utils/draftTimer');

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:443', // Development frontend
        'https://themorethequerier.online', // Production frontend
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true, // Allow cookies to be sent with requests
}));
app.use(express.json());

// Initialize the database and start the server
initializeDatabase(pool)
    .then(async () => {
        await resumeDrafts(pool); // Resume timers
        console.log('Active drafts resumed.');
        // Prefix all routes with /backend
        app.use('/backend/register', require('./routes/register')(pool));
        app.use('/backend/login', require('./routes/login')(pool));
        app.use('/backend/protected', require('./routes/protected')(pool));
        app.use('/backend/logout', require('./routes/logout')());
        app.use('/backend/refresh', require('./routes/refresh')()); // Include refresh route
        app.use('/backend/validate', require('./routes/validate')());

        app.use('/backend/profileSettings', require('./routes/profileSettings')(pool));
        app.use('/backend/updateProfileSettings', require('./routes/updateProfileSettings')(pool));
        app.use('/backend/deleteAccount', require('./routes/deleteAccount')(pool));

        app.use('/backend/fetchUserData', require('./routes/fetchUserData')(pool));
        app.use('/backend/userLeagues', require('./routes/getUserLeagues')(pool));
        app.use('/backend/userMatches', require('./routes/getUserMatches')(pool));
        app.use('/backend/league', require('./routes/league')(pool));

        app.use('/backend/teamDetails', require('./routes/getTeamDetails')(pool));
        app.use('/backend/teamPlayers', require('./routes/getTeamPlayers')(pool));
        app.use('/backend/teamMatches', require('./routes/getTeamMatches')(pool));

        app.use('/backend/player', require('./routes/getPlayerDetails')(pool));

        app.use('/backend/admin', verifyToken, require('./routes/admin')(pool));
        app.use('/backend/draft', require('./routes/draft')(pool));

        app.use('/backend/userTeams', require('./routes/getUserTeams')(pool));

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on ${port}`);
        });
    })
    .catch((err) => {
        console.error('Database initialization failed:', err);
        console.log(process.version);
        process.exit(1);
    });