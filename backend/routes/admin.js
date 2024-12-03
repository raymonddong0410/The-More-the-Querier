const express = require('express');
const checkAdmin = require('../middleware/checkAdmin');

module.exports = (pool) => {
    const router = express.Router();

    // Fetch all users
    router.get('/users', checkAdmin, async (req, res) => {
        try {
            const [users] = await pool.promise().query('SELECT * FROM users');
            res.status(200).json(users);
        } catch (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    });

    // Ban a user
    router.post('/banUser', checkAdmin, async (req, res) => {
        const { userID } = req.body;
        try {
            await pool.promise().query('UPDATE users SET isBanned = TRUE WHERE userID = ?', [userID]);
            res.status(200).json({ message: 'User banned successfully' });
        } catch (err) {
            console.error('Error banning user:', err);
            res.status(500).json({ error: 'Failed to ban user' });
        }
    });

    // Unban a user
    router.post('/unbanUser', checkAdmin, async (req, res) => {
        const { userID } = req.body;
        try {
            await pool.promise().query('UPDATE users SET isBanned = FALSE WHERE userID = ?', [userID]);
            res.status(200).json({ message: 'User unbanned successfully' });
        } catch (err) {
            console.error('Error unbanning user:', err);
            res.status(500).json({ error: 'Failed to unban user' });
        }
    })

    // Delete a league
    router.delete('/deleteLeague/:leagueID', checkAdmin, async (req, res) => {
        const { leagueID } = req.params;
    
        try {
            // Delete dependent records in the draftedPlayers table
            await pool.promise().query('DELETE FROM draftedPlayers WHERE teamID IN (SELECT teamID FROM team WHERE leagueID = ?)', [leagueID]);
    
            // Delete dependent records in the team table
            await pool.promise().query('DELETE FROM team WHERE leagueID = ?', [leagueID]);
    
            // Delete dependent records in the draft table
            await pool.promise().query('DELETE FROM draft WHERE leagueID = ?', [leagueID]);
    
            // Delete the league itself
            await pool.promise().query('DELETE FROM league WHERE leagueID = ?', [leagueID]);
    
            res.status(200).json({ message: 'League deleted successfully' });
        } catch (err) {
            console.error('Error deleting league:', err);
            res.status(500).json({ error: 'Failed to delete league' });
        }
    });

    // Fetch all players
    router.get('/players', checkAdmin, async (req, res) => {
        try {
            const [players] = await pool.promise().query('SELECT * FROM player');
            res.status(200).json(players);
        } catch (err) {
            console.error('Error fetching players:', err);
            res.status(500).json({ error: 'Failed to fetch players' });
        }
    });

    // Create a new player
    router.post('/createPlayer', checkAdmin, async (req, res) => {
        const { fullname, sport, position, realLifeTeam, fantasyPoints, availabilityStatus } = req.body;
        
        try {
            const [result] = await pool.promise().query(
                'INSERT INTO player (fullname, sport, position, realLifeTeam, fantasyPoints, availabilityStatus) VALUES (?, ?, ?, ?, ?, ?)', 
                [fullname, sport, position, realLifeTeam, fantasyPoints, availabilityStatus]
            );
            
            res.status(201).json({ 
                message: 'Player created successfully', 
                playerID: result.insertId 
            });
        } catch (err) {
            console.error('Error creating player:', err);
            res.status(500).json({ error: 'Failed to create player' });
        }
    });

    // Update an existing player
    router.put('/updatePlayer/:playerID', checkAdmin, async (req, res) => {
        const { playerID } = req.params;
        const { fullname, sport, position, realLifeTeam, fantasyPoints, availabilityStatus } = req.body;
        
        try {
            await pool.promise().query(
                'UPDATE player SET fullname = ?, sport = ?, position = ?, realLifeTeam = ?, fantasyPoints = ?, availabilityStatus = ? WHERE playerID = ?', 
                [fullname, sport, position, realLifeTeam, fantasyPoints, availabilityStatus, playerID]
            );
            
            res.status(200).json({ message: 'Player updated successfully' });
        } catch (err) {
            console.error('Error updating player:', err);
            res.status(500).json({ error: 'Failed to update player' });
        }
    });

    // Get all teams
    router.get('/teams', checkAdmin, async (req, res) => {
        try {
            const [teams] = await pool.promise().query('SELECT * FROM team');
            res.status(200).json(teams);
        } catch (err) {
            console.error('Error fetching teams:', err);
            res.status(500).json({ error: 'Failed to fetch teams' });
        }
    })

    //Get all matches
    router.get('/matches', checkAdmin, async (req, res) => {
        try {
            const [matches] = await pool.promise().query('SELECT * FROM matches');
            res.status(200).json(matches);
        } catch (err) {
            console.error('Error fetching matches:', err);
            res.status(500).json({ error: 'Failed to fetch matches' });
        }
    });

    // Create a new match
    router.post('/createMatch', checkAdmin, async (req, res) => {
        const { team1ID, team2ID, matchDate, finalScore, winner } = req.body;
        
        try {
            const [result] = await pool.promise().query(
                'INSERT INTO matches (team1ID, team2ID, matchDate, finalScore, winner) VALUES (?, ?, ?, ?, ?)', 
                [team1ID, team2ID, matchDate, finalScore, winner]
            );
            
            res.status(201).json({ 
                message: 'Match created successfully', 
                matchID: result.insertId 
            });
        } catch (err) {
            console.error('Error creating match:', err);
            res.status(500).json({ error: 'Failed to create match' });
        }
    });

    // Grant privileges based on role
    router.post('/grant', checkAdmin, async (req, res) => {
        const { username, role } = req.body; // Expect 'username' and 'role' ('admin' or 'non-admin')

        try {
            // Dynamically use database name from environment variables
            const databaseName = process.env.DB_NAME;

            if (!databaseName) {
                return res.status(500).json({ error: 'Database name is not defined in the environment variables.' });
            }

            let createUserQuery = `CREATE USER IF NOT EXISTS '${username}'@'localhost' IDENTIFIED BY 'defaultPassword';`;
            let grantQuery;

            // Adjust privileges based on role
            if (role === 'admin') {
                grantQuery = `GRANT ALL PRIVILEGES ON ${databaseName}.* TO '${username}'@'localhost';`;
            } else if (role === 'non-admin') {
                grantQuery = `GRANT SELECT, INSERT, UPDATE ON ${databaseName}.* TO '${username}'@'localhost';`;
            } else {
                return res.status(400).json({ error: 'Invalid role specified. Must be "admin" or "non-admin".' });
            }

            // Create the user if not exists
            await pool.promise().query(createUserQuery);

            // Grant privileges
            await pool.promise().query(grantQuery);

            res.status(200).json({ message: `Privileges granted to ${username} as ${role}.` });
        } catch (error) {
            console.error('Error granting privileges:', error);
            res.status(500).json({ error: 'Failed to grant privileges.' });
        }
    });


    // Revoke privileges based on role
    router.post('/revoke', checkAdmin, async (req, res) => {
        const { username, role } = req.body; // Expect 'username' and 'role' ('admin' or 'non-admin')

        try {
            // Dynamically use database name from environment variables
            const databaseName = process.env.DB_NAME;

            if (!databaseName) {
                return res.status(500).json({ error: 'Database name is not defined in the environment variables.' });
            }

            let revokeQuery;

            // Adjust revocation based on role
            if (role === 'admin') {
                revokeQuery = `REVOKE ALL PRIVILEGES ON ${databaseName}.* FROM '${username}'@'localhost';`;
            } else if (role === 'non-admin') {
                revokeQuery = `REVOKE SELECT, INSERT, UPDATE ON ${databaseName}.* FROM '${username}'@'localhost';`;
            } else {
                return res.status(400).json({ error: 'Invalid role specified. Must be "admin" or "non-admin".' });
            }

            // Revoke privileges
            await pool.promise().query(revokeQuery);

            res.status(200).json({ message: `Privileges revoked from ${username} (${role}).` });
        } catch (error) {
            console.error('Error revoking privileges:', error);
            res.status(500).json({ error: 'Failed to revoke privileges.' });
        }
    });



    return router;
};
