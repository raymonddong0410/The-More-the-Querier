import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CreateLeagueModal from '../components/CreateLeagueModal';

function LeagueList() {
    const [leagues, setLeagues] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchLeagues = async () => {
        try {
            const response = await axios.get(`/league?page=${page}`);
            setLeagues((prev) => [...prev, ...response.data]); // Append new data to existing leagues
            setHasMore(response.data.length > 0); // Stop fetching if no more data
        } catch (error) {
            console.error('Error fetching leagues:', error);
        }
    };

    useEffect(() => {
        fetchLeagues();
    }, [page]);

    const handleScroll = (e) => {
        if (
            e.target.documentElement.scrollHeight - e.target.documentElement.scrollTop ===
                e.target.documentElement.clientHeight &&
            hasMore
        ) {
            setPage((prev) => prev + 1);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore]);

    return (
        <div>
            <h1>Leagues</h1>
            <button onClick={() => setShowModal(true)}>Create League</button>
            <ul>
                {leagues.map((league, index) => (
                    <li key={`${league.leagueID}-${index}`}>
                        <Link to={`/league/${league.leagueID}`}>{league.leagueName}</Link>
                    </li>
                ))}
            </ul>
            {showModal && <CreateLeagueModal onClose={() => setShowModal(false)} />}
        </div>
    );
}

export default LeagueList;
