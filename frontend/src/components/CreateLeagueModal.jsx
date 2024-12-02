import React, { useState } from 'react';
import axios from 'axios';

function CreateLeagueModal({ onClose }) {
    const [leagueName, setLeagueName] = useState('');
    const [leagueType, setLeagueType] = useState('P');
    const [maxTeams, setMaxTeams] = useState(10);
    const [draftDate, setDraftDate] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await axios.post('/league', {
                leagueName,
                leagueType,
                maxTeams,
                draftDate,
            });
            alert(response.data.message);
            onClose();
        } catch (error) {
            console.error('Error creating league:', error);
            alert('Failed to create league.');
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Create League</h2>
                <input
                    type="text"
                    placeholder="League Name"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                />
                <select value={leagueType} onChange={(e) => setLeagueType(e.target.value)}>
                    <option value="P">Public</option>
                    <option value="R">Private</option>
                </select>
                <input
                    type="number"
                    placeholder="Max Teams"
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(e.target.value)}
                />
                <input
                    type="date"
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                />
                <button onClick={handleSubmit}>Submit</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default CreateLeagueModal;
