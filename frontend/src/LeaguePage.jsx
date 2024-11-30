import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function LeaguesPage() {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const response = await axios.get('http://localhost:3000/backend/league', {
                    withCredentials: true
                });
                setLeagues(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching leagues:', err);
                setError('Failed to fetch leagues');
                setLoading(false);
            }
        };

        fetchLeagues();
    }, []);

    const handleCreateLeague = () => {
        navigate('/create-league');
    };

    if (loading) {
        return <div>Loading leagues...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="leagues-container">
            <div className="leagues-header">
                <h1>All Leagues</h1>
                <button 
                    onClick={handleCreateLeague} 
                    className="create-league-btn"
                >
                    Create New League
                </button>
            </div>

            {leagues.length === 0 ? (
                <div className="no-leagues">
                    <p>No leagues have been created yet.</p>
                </div>
            ) : (
                <div className="leagues-list">
                    {leagues.map((league) => (
                        <div key={league.leagueID} className="league-card">
                            <h2>{league.leagueName}</h2>
                            <div className="league-details">
                                <p>Type: {league.leagueType === 'P' ? 'Public' : 'Private'}</p>
                                <p>Max Teams: {league.maxTeams}</p>
                                {league.draftDate && (
                                    <p>Draft Date: {new Date(league.draftDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LeaguesPage;