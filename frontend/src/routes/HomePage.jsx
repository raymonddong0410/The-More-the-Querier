import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';
import {Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// axios.defaults.baseURL = 'https://themorethequerier.online/backend';
axios.defaults.baseURL = 'http://localhost:3000/backend';

function HomePage() {
    const [username, setUsername] = useState('');
    const [myLeagues, setMyLeagues] = useState([]);
    const [matches, setMatches] = useState([]);
    const navigate = useNavigate();
    const [profileSettings, setProfileSettings] = useState({
      favoriteSport: '',
      aboutMe: ''
    });
    const [sortConfig, setSortConfig] = useState({
      column: 'leagueName',
      order: 'ASC'
    });

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
                const response = await axios.get('/sortUserLeague', {
                    params: {
                        sortBy: sortConfig.column,
                        sortOrder: sortConfig.order
                    }
                });
                if (response.data.user.length !== 0) {
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

        const fetchProfileSettings = async () => {
          try {
              const response = await axios.get('/profileSettings');
              setProfileSettings(response.data); 
          } catch (err) {
              console.error("Failed to get Profile Settings", err);
          }
      };

        fetchUserData();
        fetchMyLeagues();
        fetchMatches();
        fetchProfileSettings();
    }, [sortConfig]);

    const handleRowClick = (leagueID) => {
      navigate(`/league/${leagueID}`);
    };

    const handleMatchClick = (teamID) => {
      navigate(`/team/${teamID}/matches`);
    };

    const handleSort = (column) => {
        // Toggle sort order if same column, otherwise default to ASC
        setSortConfig(prevConfig => ({
            column,
            order: prevConfig.column === column && prevConfig.order === 'ASC' ? 'DESC' : 'ASC'
        }));
    };

    return(
        <div>
      {/* Username Banner */}
      <div>
        <h1 className="welcome">Welcome, {username}!</h1>
      </div>

      {/* Profile Settings */} 
      <div className="profile-settings-box">
                <div className="profile-content">
                    <p><strong className="aboutMe">About Me:</strong> {profileSettings.aboutMe || 'Not set'}</p>
                    <p><strong className="aboutMe">Favorite Sport:</strong> {profileSettings.favoriteSport || 'Not set'}</p>
                </div>
      </div>

      <div >
        {/* Leagues Table */}
        <div >
          <div>
            <h2 className="league-header">My Leagues</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="table-full-width">
          <thead>
            <tr className="table-header-row">
              <th 
                className="table-header-cell cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('leagueName')}
              >
                League Name 
                {sortConfig.column === 'leagueName' && 
                  (sortConfig.order === 'ASC' ? ' ▲' : ' ▼')}
              </th>
              <th 
                className="table-header-cell cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('leagueType')}
              >
                Type
                {sortConfig.column === 'leagueType' && 
                  (sortConfig.order === 'ASC' ? ' ▲' : ' ▼')}
              </th>
              <th 
                className="table-header-cell cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('maxTeams')}
              >
                Max Teams
                {sortConfig.column === 'maxTeams' && 
                  (sortConfig.order === 'ASC' ? ' ▲' : ' ▼')}
              </th>
              <th 
                className="table-header-cell cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('draftDate')}
              >
                Draft Date
                {sortConfig.column === 'draftDate' && 
                  (sortConfig.order === 'ASC' ? ' ▲' : ' ▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {myLeagues.map((league) => (
              <tr key={league.leagueID} className="table-body-row" onClick={() => handleRowClick(league.leagueID)} style={{ cursor: 'pointer' }} >
                <td className="table-body-cell-value">
                    {league.leagueName}
                </td>
                <td className="table-body-cell-value">
                    {league.leagueType === 'P' ? 'Public' : league.leagueType === 'R' ? 'Private' : 'Unknown'}
                </td>
                <td className="table-body-cell-value">
                    {league.maxTeams}
                </td>
                <td className="table-body-cell-value">
                    {league.draftDate ? new Date(league.draftDate).toLocaleDateString() : 'TBD'}
                </td>
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
            <table className="table-full-width">
              <thead>
              <tr className="table-header-row">
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Team 1</th>
                <th className="table-header-cell">Team 2</th>
                <th className="table-header-cell">League</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.matchID} className="table-body-row" onClick={() => handleMatchClick(match.userTeamID)} style={{ cursor: 'pointer' }}>
                    <td className="table-body-cell-value">{new Date(match.matchDate).toLocaleDateString()}</td>
                    <td className="table-body-cell-value">{match.team1Name}</td>
                    <td className="table-body-cell-value">{match.team2Name}</td>
                    <td className="table-body-cell-value">{match.leagueName}</td>
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