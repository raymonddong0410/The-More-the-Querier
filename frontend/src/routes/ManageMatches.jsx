import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageMatches() {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [matchDetail, setMatchDetail] = useState({
        team1ID: '',
        team2ID: '',
        matchDate: '',
        finalScore: '',
        winner: ''
    });

    const fetchTeams = async () => {
        try {
            const response = await axios.get('/admin/teams');
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const fetchMatches = async () => {
        try {
            const response = await axios.get('/admin/matches');
            setMatches(response.data);
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchMatches();
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMatchDetail(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateMatch = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/createMatch', matchDetail);
            fetchMatches();
            resetForm();
            alert('Match created successfully');
        } catch (error) {
            console.error('Error creating match:', error);
            alert('Failed to create match');
        }
    };

    const resetForm = () => {
        setMatchDetail({
            team1ID: '',
            team2ID: '',
            matchDate: '',
            finalScore: '',
            winner: ''
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div>
        <h1>Manage Matches</h1>
        
        {/* Teams Table */}
        <h2>Teams</h2>
        <table border="1" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
                <tr>
                    <th>Team ID</th>
                    <th>Team Name</th>
                    <th>LeagueID</th>
                </tr>
            </thead>
            <tbody>
                {teams.map((team) => (
                    <tr key={team.teamID}>
                        <td>{team.teamID}</td>
                        <td>{team.teamName}</td>
                        <td>{team.leagueID}</td>
                    </tr>
                ))}
            </tbody>
        </table>

         {/* Matches Table */}
         <h2>Matches</h2>
            <table border="1" style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                    <tr>
                        <th>Match ID</th>
                        <th>Team 1</th>
                        <th>Team 2</th>
                        <th>Date</th>
                        <th>Final Score</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map((match) => (
                        <tr key={match.matchID}>
                            <td>{match.matchID}</td>
                            <td>{match.team1ID}</td>
                            <td>{match.team2ID}</td>
                            <td>{formatDate(match.matchDate)}</td>
                            <td>{match.finalScore}</td>
                            <td>{match.winner}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

       {/* Match Creation Form */}
       <h2>Create Match</h2>
            <form onSubmit={handleCreateMatch}>
                <label>
                    Team 1:
                    <select
                        name="team1ID"
                        value={matchDetail.team1ID}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Team 1</option>
                        {teams.map((team) => (
                            <option key={team.teamID} value={team.teamID}>
                                teamID:
                                {team.teamID}
                            </option>
                        ))}
                    </select>
                </label>
                <br />
                <label>
                    Team 2:
                    <select
                        name="team2ID"
                        value={matchDetail.team2ID}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Team 2</option>
                        {teams.map((team) => (
                            <option key={team.teamID} value={team.teamID}>
                                teamID:
                                {team.teamID}
                            </option>
                        ))}
                    </select>
                </label>
                <br />
                <label>
                    Match Date:
                    <input
                        type="date"
                        name="matchDate"
                        value={matchDetail.matchDate}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Final Score:
                    <input
                        type="text"
                        name="finalScore"
                        value={matchDetail.finalScore}
                        onChange={handleInputChange}
                    />
                </label>
                <br />
                <label>
                    Winner:
                    <input
                        type="text"
                        name="winner"
                        value={matchDetail.winner}
                        onChange={handleInputChange}
                    />
                </label>
                <br />
                <button type="submit">Create Match</button>
            </form>
        </div>
    )
}

export default ManageMatches;