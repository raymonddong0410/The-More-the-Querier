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

    return router;
};
