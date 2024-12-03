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
    const [sortLeagues, setSortLeagues] = useState([]);
    const [matches, setMatches] = useState([]);
    const navigate = useNavigate();
    const [profileSettings, setProfileSettings] = useState({
      favoriteSport: '',
      aboutMe: ''
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
        fetchMatches()
        fetchProfileSettings();
    }, []);

    const handleRowClick = (leagueID) => {
      navigate(`/league/${leagueID}`);
    };

    const handleMatchClick = (teamID) => {
      navigate(`/team/${teamID}/matches`);
    };



    const handleSort = (key) => {
      let direction = 'asc';
      if (sortLeagues.key === key && sortLeagues.direction === 'asc') {
        direction = 'desc';
      }
      setSortLeagues({ key, direction });
    };

  const sortedLeagues = [...myLeagues].sort((a, b) => {
    if (a[sortLeagues.key] < b[sortLeagues.key]) {
      return sortLeagues.direction === 'asc' ? -1 : 1;
    }
    if (a[sortLeagues.key] > b[sortLeagues.key]) {
      return sortLeagues.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

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
               <th className="table-header-cell" onClick={() => handleSort('leagueName')} style={{ cursor: 'pointer' }}>
                League Name {sortLeagues.key === 'leagueName' ? (sortLeagues.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="table-header-cell">Type</th>
              <th className="table-header-cell">Max Teams</th>
              <th className="table-header-cell">Draft Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeagues.map((league) => (
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