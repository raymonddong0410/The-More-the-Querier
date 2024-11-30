import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';

// axios.defaults.baseURL = 'https://themorethequerier.online/backend';
axios.defaults.baseURL = 'http://localhost:3000/backend';

function HomePage() {
    const [username, setUsername] = useState('');
    const [myLeagues, setMyLeagues] = useState([]);
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/fetchUserData');
                setUsername(response.data.user.username);
            } catch (err) {
                console.error("Failed to get User Data", err);
            }
        }

        const fetchMyLeagues = async() => {
            try {
                const response = await axios.get('/userLeagues');
                if (response.data.length !== 0) {
                    setMyLeagues(response.data.user);
                }
            } catch (err) {
                console.error("Failed to get User Leagues", err);
            }
        }

        const fetchMatches = async() => {
            try {
                const response = await axios.get('/userMatches');
                if (response.data.length !== 0) {
                    setMatches(response.data.user);
                }
            } catch (err) {
                console.error("Failed to get User Matches", err);
            }
        }

        fetchUserData();
        fetchMyLeagues();
        fetchMatches()
    }, []);

    return(
        <div className="min-h-screen bg-gray-100 p-6">
      {/* Username Banner */}
      <div className="bg-blue-600 text-white p-4 mb-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Welcome, {username}!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leagues Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">My Leagues</h2>
          </div>
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
                {myLeagues.map((league) => (
                  <tr key={league.leagueID} className="border-b hover:bg-gray-50">
                    <td className="p-3">{league.leagueName}</td>
                    <td className="p-3">
                      {league.leagueType === 'P' ? 'Public' : 
                       league.leagueType === 'R' ? 'Private' : 'Unknown'}
                    </td>
                    <td className="p-3">{league.maxTeams}</td>
                    <td className="p-3">{league.draftDate ? new Date(league.draftDate).toLocaleDateString() : 'TBD'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Matches Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Matches</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">Team 1</th>
                  <th className="p-3">Team 2</th>
                  <th className="p-3">League</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.matchID} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(match.matchDate).toLocaleDateString()}</td>
                    <td className="p-3">{match.team1Name}</td>
                    <td className="p-3">{match.team2Name}</td>
                    <td className="p-3">{match.leagueName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;