import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/backend';

function MatchesPage() {
    const [matches, setMatches] = useState([]);
    const [teamDetails, setTeamDetails] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { teamID } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeamMatches = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`/teamMatches/${teamID}`);
                setMatches(response.data.matches || []);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to get team matches", err);
                setError("Failed to load matches");
                setIsLoading(false);
            }
        };

        fetchTeamDetails();
        fetchTeamMatches();
    }, [teamID]);

    const getTeamNameForMatch = (team1ID, team2ID) => {
        const isTeam1Requested = parseInt(team1ID) === parseInt(teamID);
        return {
            requestedTeam: isTeam1Requested ? 'team1' : 'team2',
            opponentTeam: isTeam1Requested ? 'team2' : 'team1'
        };
    };

    const determineMatchResult = (match) => {
        if (!match.finalScore) return 'Upcoming';
        
        const teamPosition = getTeamNameForMatch(match.team1ID, match.team2ID);
        
        if (match.winner === null) return 'Draw';
        if (match.winner === parseInt(teamID)) return 'Won';
        return 'Lost';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl font-semibold text-gray-600">Loading matches...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Team Matches Banner */}
            <div className="bg-blue-600 text-white p-4 mb-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold">Matches for {teamDetails.teamName}</h1>
                <p className="text-sm">League: {teamDetails.leagueName}</p>
            </div>

            {/* Matches Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Opponent</th>
                            <th className="p-3 text-center">Score</th>
                            <th className="p-3 text-left">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center p-4 text-gray-500">
                                    No matches found for this team.
                                </td>
                            </tr>
                        ) : (
                            matches.map((match) => {
                                const teamPosition = getTeamNameForMatch(match.team1ID, match.team2ID);
                                const opponentTeamID = teamPosition.requestedTeam === 'team1' ? match.team2ID : match.team1ID;
                                const result = determineMatchResult(match);

                                return (
                                    <tr 
                                        key={match.matchID} 
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigate(`/match/${match.matchID}`)}
                                    >
                                        <td className="p-3">{new Date(match.matchDate).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            {teamPosition.requestedTeam === 'team1' 
                                                ? 'Home vs ' + teamDetails.teamName 
                                                : teamDetails.teamName + ' vs Away'}
                                        </td>
                                        <td className="p-3 text-center">
                                            {match.finalScore || 'N/A'}
                                        </td>
                                        <td className={`p-3 font-semibold ${
                                            result === 'Won' ? 'text-green-600' : 
                                            result === 'Lost' ? 'text-red-600' : 
                                            'text-gray-600'
                                        }`}>
                                            {result}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MatchesPage;