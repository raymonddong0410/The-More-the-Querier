import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageLeagues() {
    const [allLeagues, setAllLeagues] = useState([]); // Store all fetched leagues
    const [visibleLeagues, setVisibleLeagues] = useState([]); // Store currently visible leagues
    const [page, setPage] = useState(1);
    const leaguesPerPage = 10; // Customize as needed

    useEffect(() => {
        async function fetchLeagues() {
            try {
                const response = await axios.get('/league'); // Fetch all leagues
                setAllLeagues(response.data);
                setVisibleLeagues(response.data.slice(0, leaguesPerPage)); // Initialize with the first page
            } catch (error) {
                console.error('Error fetching leagues:', error);
            }
        }
        fetchLeagues();
    }, []);

    const handleDeleteLeague = async (leagueID) => {
        try {
            await axios.delete(`/admin/deleteLeague/${leagueID}`);
            const updatedLeagues = allLeagues.filter(league => league.leagueID !== leagueID);
            setAllLeagues(updatedLeagues);
            // Update visible leagues for current page
            const newVisibleLeagues = updatedLeagues.slice(0, page * leaguesPerPage);
            setVisibleLeagues(newVisibleLeagues);
        } catch (error) {
            console.error('Error deleting league:', error);
        }
    };

    const loadMoreLeagues = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        setVisibleLeagues(allLeagues.slice(0, nextPage * leaguesPerPage));
    };

    return (
        <div>
            <h2>Manage Leagues</h2>
            <ul>
                {visibleLeagues.map(league => (
                    <li key={league.leagueID}>
                        {league.leagueName}
                        <button onClick={() => handleDeleteLeague(league.leagueID)}>Delete</button>
                    </li>
                ))}
            </ul>
            {visibleLeagues.length < allLeagues.length && (
                <button onClick={loadMoreLeagues}>Load More</button>
            )}
        </div>
    );
}

export default ManageLeagues;
