import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateTeamModal from '../components/createTeamModal'; // Adjust import path as needed

function LeagueDetails() {
    const { leagueID } = useParams();
    const navigate = useNavigate();
    const [league, setLeague] = useState(null);
    const [teams, setTeams] = useState([]);
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

    const handleTeamClick = (teamID) => {
        navigate(`/team/${teamID}`);
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get(`/league/${leagueID}/teams`);
            setTeams(response.data.teams);
        } catch (error) {
            console.error('Error fetching team details:', error);
        }
    };

    useEffect(() => {
        const fetchLeague = async () => {
            try {
                const response = await axios.get(`/league/${leagueID}`);
                setLeague(response.data);
            } catch (error) {
                console.error('Error fetching league details:', error);
            }
        };

        fetchLeague();
        fetchTeams();
    }, [leagueID]);

    if (!league) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{league.leagueName}</h1>
            <p>Type: {league.leagueType === 'P' ? 'Public' : 'Private'}</p>
            <p>Commissioner: {league.commissioner}</p>
            <p>Max Teams: {league.maxTeams}</p>
            <p>Draft Date: {league.draftDate ? new Date(league.draftDate).toLocaleDateString() : 'TBD'}</p>

            {/* New button to create a team */}
            <button 
                onClick={() => setIsCreateTeamModalOpen(true)} 
                disabled={teams.length >= league.maxTeams}
            >
                Create Team
            </button>

            <h2>Teams in this League</h2>
            {teams.length === 0 ? (
                <p>No teams in this league yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Team Name| </th>
                            <th>Total Points| </th>
                            <th>Ranking| </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team) => (
                            <tr key={team.teamID}>
                                <td>   {team.teamName}</td>
                                <td>{team.totalPoints || 0}</td>
                                <td>{team.ranking || 'N/A'}</td>
                                <td>
                                    <button onClick={() => handleTeamClick(team.teamID)}>
                                        View Team
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Conditionally render the Create Team Modal */}
            {isCreateTeamModalOpen && (
                <CreateTeamModal 
                    leagueID={leagueID}
                    onClose={() => setIsCreateTeamModalOpen(false)}
                    onTeamCreated={fetchTeams}
                />
            )}
        </div>
    );
}

export default LeagueDetails;