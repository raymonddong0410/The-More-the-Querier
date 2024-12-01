import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function LeagueDetails() {
    const { leagueID } = useParams();
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
        </div>
    );
}

export default LeagueDetails;
