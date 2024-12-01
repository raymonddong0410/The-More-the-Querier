import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function LeagueDetails() {
    const { leagueID } = useParams();
    console.log(leagueID)
    const [league, setLeague] = useState(null);
    const [teams, setTeams] = useState([])

    useEffect(() => {
        const fetchLeague = async () => {
            try {
                const response = await axios.get(`/league/${leagueID}`);
                setLeague(response.data);
            } catch (error) {
                console.error('Error fetching league details:', error);
            }
        };

        const fetchTeams = async () => {
            try {
                const response = await axios.get(`/league/${leagueID}/teams`);
                setTeams(response.data.teams);
            } catch (error) {
                console.error('Error fetching team details:', error);
            }
        }

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

            <h2>Teams in this League</h2>
            {teams.length === 0 ? (
                <p>No teams in this league yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Team Name</th>
                            <th>Total Points</th>
                            <th>Ranking</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((teams) => (
                            <tr key={teams.teamID}>
                                <td>{teams.teamName}</td>
                                <td>{teams.totalPoints || 0}</td>
                                <td>{teams.ranking || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default LeagueDetails;
