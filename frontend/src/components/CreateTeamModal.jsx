import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';

function CreateTeamModal({ onClose, onTeamCreated }) {
    const [teamName, setTeamName] = useState('');
    const [error, setError] = useState('');
    const { leagueID } = useParams();

    const handleSubmit = async () => {
        // Validate team name length
        if (teamName.trim() === '') {
            setError('Team name cannot be empty');
            return;
        }

        if (teamName.length > 25) {
            setError('Team name must be 25 characters or less');
            return;
        }

        try {
            const response = await axios.post(`/league/${leagueID}/createTeam`, {  
                teamName,
                totalPoints: 0, // Initialize total points to 0
                ranking: null, // Initially no ranking
                status: 'A' // Assuming 'A' for active
            });
            
            console.log('Team creation response:', response.data);
            alert(response.data.message);
            
            // Call the onTeamCreated callback to refresh teams or close modal
            if (onTeamCreated) {
                onTeamCreated();
            }
            
            onClose();
        } catch (error) {
            console.error('Full error object:', error);
            console.error('Error response:', error.response);
            setError(
                error.response?.data?.error || 
                error.response?.data?.message || 
                'Failed to create team'
            );
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Create Team in League</h2>
                <input
                    type="text"
                    placeholder="Team Name (max 25 characters)"
                    value={teamName}
                    onChange={(e) => {
                        setTeamName(e.target.value);
                        setError(''); // Clear any previous errors
                    }}
                    maxLength={25}
                />
                {error && <p style={{color: 'red'}}>{error}</p>}
                <button onClick={handleSubmit}>Create Team</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default CreateTeamModal;