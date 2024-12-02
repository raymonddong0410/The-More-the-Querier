import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';

axios.defaults.baseURL = 'http://localhost:3000/backend';

function PlayerPage() {
    const [player, setPlayer] = useState({});
    const { playerID } = useParams();

    useEffect(() => {
        const fetchPlayerDetails = async () => {
            try {
                const playerResponse = await axios.get(`/player/${playerID}`);
                if (playerResponse.data.length !== 0) {
                    setPlayer(playerResponse.data.player);
                }
            } catch (err) {
                console.error("Failed to get player information", err);
            }
        }

        fetchPlayerDetails();
    }, [playerID]);

    return(
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Player Banner */}
            <div className="bg-blue-600 text-white p-4 mb-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold">{player.fullname}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Player Information</h2>
                    <div className="space-y-3">
                        <div>
                            <strong>Sport:</strong> {player.sport}
                        </div>
                        <div>
                            <strong>Position:</strong> {player.position}
                        </div>
                        <div>
                            <strong>Real Team:</strong> {player.realLifeTeam}
                        </div>
                        <div>
                            <strong>Fantasy Points:</strong> {player.fantasyPoints}
                        </div>
                        <div>
                            <strong>Availability Status:</strong> {player.availabilityStatus == 1 ? "Healthy" : "Out"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerPage;