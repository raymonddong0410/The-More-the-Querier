import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function LeagueDetails() {
    const { id } = useParams();
    const [league, setLeague] = useState(null);

    useEffect(() => {
        const fetchLeague = async () => {
            try {
                const response = await axios.get(`/league/${id}`);
                setLeague(response.data);
            } catch (error) {
                console.error('Error fetching league details:', error);
            }
        };
        fetchLeague();
    }, [id]);

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
