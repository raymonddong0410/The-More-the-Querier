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
        return <div className="p-4">Loading leagues...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold">List of Leagues</h2>
                        <button 
                            onClick={handleCreateLeague} 
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Create New League
                        </button>
                    </div>
                    
                    {leagues.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No leagues have been created yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="p-3">League Name</th>
                                        <th className="p-3">Type</th>
                                        <th className="p-3">Max Teams</th>
                                        <th className="p-3">Draft Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leagues.map((league) => (
                                        <tr 
                                            key={league.leagueID} 
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="p-3">{league.leagueName}</td>
                                            <td className="p-3">
                                                {league.leagueType === 'P' ? 'Public' : 
                                                 league.leagueType === 'R' ? 'Private' : 'Unknown'}
                                            </td>
                                            <td className="p-3">{league.maxTeams}</td>
                                            <td className="p-3">
                                                {league.draftDate 
                                                    ? new Date(league.draftDate).toLocaleDateString() 
                                                    : 'TBD'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LeaguesPage;