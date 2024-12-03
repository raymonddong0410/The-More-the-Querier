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
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchLeagues() {
            try {
                const response = await axios.get('/league'); // Fetch all leagues
                setAllLeagues(response.data);
                updateVisibleLeagues(response.data, page, searchTerm);
            } catch (error) {
                console.error('Error fetching leagues:', error);
            }
        }
        fetchLeagues();
    }, [leagueCreated]);

    // Centralized method to update visible leagues
    const updateVisibleLeagues = (leagues, currentPage, currentSearchTerm = '') => {
        // First, filter leagues by search term if applicable
        const filteredLeagues = currentSearchTerm 
            ? leagues.filter(league => 
                league.leagueName.toLowerCase().includes(currentSearchTerm.toLowerCase())
              )
            : leagues;

        // Then slice based on current page
        const startIndex = 0;
        const endIndex = currentPage * leaguesPerPage;
        const slicedLeagues = filteredLeagues.slice(startIndex, endIndex);

        setVisibleLeagues(slicedLeagues);
    };

    useEffect(() => {
        // Update visible leagues when search term changes
        updateVisibleLeagues(allLeagues, page, searchTerm);
    }, [searchTerm, allLeagues, page]);

    const loadMoreLeagues = () => {
        // Increment page and this will trigger the useEffect to update visible leagues
        setPage(prevPage => prevPage + 1);
    };

    return (
        <div>
            <h1>Leagues</h1>
            <input 
                type="text" 
                placeholder="Search leagues..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
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