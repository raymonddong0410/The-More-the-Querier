import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPlayerManagement() {
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState({
        fullname: '',
        sport: '',
        position: '',
        realLifeTeam: '',
        fantasyPoints: '',
        availabilityStatus: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    // Fetch players on component mount
    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const response = await axios.get('/admin/players');
            setPlayers(response.data);
        } catch (error) {
            console.error('Error fetching players:', error);
            alert('Failed to fetch players');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPlayer(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreatePlayer = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/createPlayer', currentPlayer);
            fetchPlayers();
            resetForm();
            alert('Player created successfully');
        } catch (error) {
            console.error('Error creating player:', error);
            alert('Failed to create player');
        }
    };

    const handleUpdatePlayer = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/admin/updatePlayer/${currentPlayer.playerID}`, currentPlayer);
            fetchPlayers();
            resetForm();
            setIsEditing(false);
            alert('Player updated successfully');
        } catch (error) {
            console.error('Error updating player:', error);
            alert('Failed to update player');
        }
    };

    const startEditing = (player) => {
        setCurrentPlayer(player);
        setIsEditing(true);
    };

    const resetForm = () => {
        setCurrentPlayer({
            fullname: '',
            sport: '',
            position: '',
            realLifeTeam: '',
            fantasyPoints: '',
            availabilityStatus: ''
        });
        setIsEditing(false);
    };

    return (
        <div>
            <h1>Player Management</h1>
            
            <form onSubmit={isEditing ? handleUpdatePlayer : handleCreatePlayer}>
                <input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    value={currentPlayer.fullname}
                    onChange={handleInputChange}
                    required
                />
                <select
                    name="sport"
                    value={currentPlayer.sport}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Sport</option>
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Baseball">Baseball</option>
                    <option value="Hockey">Hockey</option>
                </select>
                <input
                    type="text"
                    name="position"
                    placeholder="Position"
                    value={currentPlayer.position}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="realLifeTeam"
                    placeholder="Real Life Team"
                    value={currentPlayer.realLifeTeam}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="fantasyPoints"
                    placeholder="Fantasy Points"
                    value={currentPlayer.fantasyPoints}
                    onChange={handleInputChange}
                    step="100"
                />
                <select
                    name="availabilityStatus"
                    value={currentPlayer.availabilityStatus}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Availability</option>
                    <option value="A">Available</option>
                    <option value="I">Injured</option>
                </select>
                
                <button type="submit">
                    {isEditing ? 'Update Player' : 'Create Player'}
                </button>
                {isEditing && (
                    <button type="button" onClick={resetForm}>
                        Cancel
                    </button>
                )}
            </form>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Sport</th>
                        <th>Position</th>
                        <th>Team</th>
                        <th>Fantasy Points</th>
                        <th>Availability</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map(player => (
                        <tr key={player.playerID}>
                            <td>{player.playerID}</td>
                            <td>{player.fullname}</td>
                            <td>{player.sport}</td>
                            <td>{player.position}</td>
                            <td>{player.realLifeTeam}</td>
                            <td>{player.fantasyPoints}</td>
                            <td>{player.availabilityStatus}</td>
                            <td>
                                <button onClick={() => startEditing(player)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminPlayerManagement;