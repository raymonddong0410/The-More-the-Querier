import React, { useState } from 'react';
import axios from 'axios';

function CreateLeagueModal({ onClose }) {
    const [leagueName, setLeagueName] = useState('');
    const [leagueType, setLeagueType] = useState('P');
    const [maxTeams, setMaxTeams] = useState(10);
    const [draftDate, setDraftDate] = useState('');
    const [createTeam, setCreateTeam] = useState(false);
    const [teamName, setTeamName] = useState('');

    const handleSubmit = async () => {
        if (createTeam && !teamName) {
            alert('Please provide a team name.');
            return;
        }

        try {
            const response = await axios.post('/league', {
                leagueName,
                leagueType,
                maxTeams,
                draftDate,
                createTeam,
                teamName: createTeam ? teamName : null,
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
                <label>
                    <input
                        type="checkbox"
                        checked={createTeam}
                        onChange={(e) => setCreateTeam(e.target.checked)}
                    />
                    Create your own team in this league?
                </label>
                {createTeam && (
                    <input
                        type="text"
                        placeholder="Team Name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                    />
                )}
                <button onClick={handleSubmit}>Submit</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default CreateLeagueModal;
