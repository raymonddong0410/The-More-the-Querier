const express = require('express');
const checkAdmin = require('../middleware/checkAdmin');

module.exports = (pool) => {
    const router = express.Router();

    // Fetch all users
    router.get('/users', checkAdmin, async (req, res) => {
        try {
            const [users] = await pool.promise().query('SELECT userID, username, email, isAdmin FROM users');
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

    // Delete a league
// Delete a league
router.delete('/deleteLeague/:leagueID', checkAdmin, async (req, res) => {
    const { leagueID } = req.params;
    try {
        // Delete dependent records in `draft` table
        await pool.promise().query('DELETE FROM draft WHERE leagueID = ?', [leagueID]);

        // Delete the league
        await pool.promise().query('DELETE FROM league WHERE leagueID = ?', [leagueID]);

        res.status(200).json({ message: 'League deleted successfully' });
    } catch (err) {
        console.error('Error deleting league:', err);
        res.status(500).json({ error: 'Failed to delete league' });
    }
});


    return router;
};