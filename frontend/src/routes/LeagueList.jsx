import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CreateLeagueModal from '../components/CreateLeagueModal';

function LeagueList() {
    const [allLeagues, setAllLeagues] = useState([]); // Store all fetched leagues
    const [visibleLeagues, setVisibleLeagues] = useState([]); // Store currently visible leagues
    const [page, setPage] = useState(1);
    const leaguesPerPage = 10; // Customize the number of leagues per page
    const [showModal, setShowModal] = useState(false);
    const [leagueCreated, setLeagueCreated] = useState(false);

    useEffect(() => {
        async function fetchLeagues() {
            try {
                const response = await axios.get('/league'); // Fetch all leagues
                setAllLeagues(response.data);
                setVisibleLeagues(response.data.slice(0, page * leaguesPerPage)); // Initialize with the first page
            } catch (error) {
                console.error('Error fetching leagues:', error);
            }
        }
        fetchLeagues();
    }, [leagueCreated, page]);

    const loadMoreLeagues = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        setVisibleLeagues(allLeagues.slice(0, nextPage * leaguesPerPage));
    };

    return (
        <div>
            <h1>Leagues</h1>
            <button onClick={() => setShowModal(true)}>Create League</button>
            <ul>
                {visibleLeagues.map((league) => (
                    <li key={league.leagueID}>
                        <Link to={`/league/${league.leagueID}`}>{league.leagueName}</Link>
                    </li>
                ))}
            </ul>
            {visibleLeagues.length < allLeagues.length && (
                <button onClick={loadMoreLeagues}>Load More</button>
            )}
            {showModal && (
                <CreateLeagueModal
                    onClose={() => {
                        setShowModal(false);
                        setLeagueCreated((prev) => !prev); // Trigger refresh
                    }}
                />
            )}
        </div>
    );
}

export default LeagueList;
