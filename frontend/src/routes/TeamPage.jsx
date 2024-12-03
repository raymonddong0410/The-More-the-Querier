import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// axios.defaults.baseURL = 'https://themorethequerier.online/backend';
axios.defaults.baseURL = 'http://localhost:3000/backend';

function TeamPage() {
    const [teamDetails, setTeamDetails] = useState({
        username: "inactive",
        teamName: "inactive",
        leagueName: "inactive"
    });
    const [players, setPlayers] = useState([]);
    const { teamID } = useParams();

    const navigate = useNavigate();

    useEffect(()=> {
        const fetchTeamDetails = async () => {
            try {
                const response = await axios.get(`/teamDetails/${teamID}`);
                console.log(response)
                setTeamDetails(response.data.team)
            } catch (err) {
                console.error("Failed to get team information", err);
            }
        }

        const fetchPlayers = async () => {
            try {
                const response = await axios.get(`/teamPlayers/${teamID}`);
                if (response.data.length !== 0) {
                    setPlayers(response.data.players);
                }
            } catch (err) {
                console.error("Failed to get team players", err);
            }
        }

        fetchTeamDetails();
        fetchPlayers();
    }, [teamID]);

    const handlePlayerClick = (playerID) => {
        navigate(`/player/${playerID}`);
    };

    const handleMatchesClick = () => {
        navigate(`/team/${teamID}/matches`);
    };


    return(
        <div className="min-h-screen bg-gray-100 p-6">
        {/* Team Banner */}
        <div className="bg-blue-600 text-white p-4 mb-6 rounded-lg shadow-md flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold">User: {teamDetails.username}</h1>
                <h1 className="text-xl font-bold">League: {teamDetails.leagueName}</h1>
                <h1 className="text-xl font-bold">Team: {teamDetails.teamName}</h1>
            </div>
            <button 
                onClick={handleMatchesClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-300"
            >
                View Matches
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Overview */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-white">Team Overview</h2>
                <div className="space-y-2">
                    <p><strong>Total Points:</strong> {teamDetails.totalPoints}</p>
                    <p><strong>Ranking:</strong> {teamDetails.ranking}</p>
                    <p><strong>Status:</strong> {teamDetails.status === 'A' ? 'Active' : 'Inactive'}</p>
                </div>
            </div>

            {/* Players Table */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                    <h2 className="text-white">Team Players</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3">Name</th>
                                <th className="p-3">Position</th>
                                <th className="p-3">Real Team</th>
                                <th className="p-3">Fantasy Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player) => (
                                <tr key={player.playerID} 
                                className="border-b hover:bg-gray-50"
                                onClick={() => {handlePlayerClick(player.playerID)}}
                                >
                                    <td className="p-3">{player.fullname}</td>
                                    <td className="p-3">{player.position}</td>
                                    <td className="p-3">{player.realLifeTeam}</td>
                                    <td className="p-3">{player.fantasyPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    )
}

export default TeamPage;