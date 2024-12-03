import React, { useState } from 'react';
import axios from 'axios';

function JoinLeagueModal({ leagueID, onClose, onJoined }) {
    const [teamName, setTeamName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (teamName.trim() === '') {
            setError('Team name cannot be empty.');
            return;
        }

        if (teamName.length > 25) {
            setError('Team name must be 25 characters or less.');
            return;
        }

        try {
            await axios.post(`/league/${leagueID}/join`, { teamName });
            alert('Successfully joined the league!');
            onJoined(); // Callback to refresh league details
            onClose(); // Close modal
        } catch (error) {
            console.error('Error joining league:', error);
            setError(
                error.response?.data?.error ||
                'An error occurred while joining the league.'
            );
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Join League</h2>
                <input
                    type="text"
                    placeholder="Team Name (max 25 characters)"
                    value={teamName}
                    onChange={(e) => {
                        setTeamName(e.target.value);
                        setError(''); // Clear errors on input change
                    }}
                    maxLength={25}
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button onClick={handleSubmit}>Join</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default JoinLeagueModal;
