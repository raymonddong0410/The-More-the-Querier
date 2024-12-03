import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TeamsList() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch teams for the logged-in user
    const fetchTeams = async () => {
        try {
            const response = await axios.get('/userTeams', { withCredentials: true });
            setTeams(response.data.teams);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    if (loading) {
        return <div>Loading teams...</div>;
    }

    if (teams.length === 0) {
        return <div>No teams found.</div>;
    }

    return (
        <div>
            <h1 >Your Teams</h1>
            <ul>
                {teams.map((team) => (
                    <li key={team.teamID}>
                        <h2 className="text-white">{team.teamName}</h2>
                        <p>League: {team.leagueName}</p>
                        <p>Total Points: {team.totalPoints}</p>
                        <p>Ranking: {team.ranking}</p>
                        <a href={`/team/${team.teamID}`}>View Team Details</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TeamsList;
