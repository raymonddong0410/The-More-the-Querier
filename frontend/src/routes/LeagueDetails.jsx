import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JoinLeagueModal from '../components/JoinLeagueModal';
import CreateDraftModal from '../components/CreateDraftModal';

function LeagueDetails() {
    const { leagueID } = useParams();
    const navigate = useNavigate();
    const [league, setLeague] = useState(null);
    const [teams, setTeams] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [draftTeams, setDraftTeams] = useState({}); // Tracks teams for each draft
    const [userID, setUserID] = useState(null);
    const [isJoinLeagueModalOpen, setIsJoinLeagueModalOpen] = useState(false);
    const [isCreateDraftModalOpen, setIsCreateDraftModalOpen] = useState(false);

    const fetchUserID = async () => {
        try {
            const response = await axios.get('/fetchUserData');
            setUserID(response.data.user.userID); // Store the userID in state
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get(`/league/${leagueID}/teams`);
            setTeams(response.data.teams);
        } catch (error) {
            console.error('Error fetching team details:', error);
        }
    };

    const fetchDrafts = async () => {
        try {
            const response = await axios.get(`/draft/league/${leagueID}`);
            const drafts = response.data;

            setDrafts(drafts);

            // Fetch teams for each draft
            drafts.forEach(async (draft) => {
                const draftTeamsResponse = await axios.get(`/draft/${draft.draftID}/teams`);
                setDraftTeams((prev) => ({
                    ...prev,
                    [draft.draftID]: draftTeamsResponse.data.teams,
                }));
            });
        } catch (error) {
            console.error('Error fetching drafts:', error);
        }
    };

    const fetchLeague = async () => {
        try {
            const response = await axios.get(`/league/${leagueID}`);
            setLeague(response.data);
        } catch (error) {
            console.error('Error fetching league details:', error);
        }
    };

    useEffect(() => {
        fetchUserID();
        fetchLeague();
        fetchTeams();
        fetchDrafts();
    }, [leagueID]);

    const userTeamID = teams.find((team) => team.owner === userID)?.teamID;

    const userIsInLeague = teams.some((team) => team.owner === Number(userID));
    const isCommissioner = league?.commissioner === userID;
    const leagueIsFull = teams.length >= league?.maxTeams;

    const isUserTeamInDraft = (draftID) => {
        const teamsInDraft = draftTeams[draftID] || [];
        return teamsInDraft.some((team) => team.teamID === userTeamID);
    };

    if (!league || userID === null) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{league.leagueName}</h1>
            <p>Type: {league.leagueType === 'P' ? 'Public' : 'Private'}</p>
            <p>Commissioner: {league.commissionerUsername}</p>
            <p>Max Teams: {league.maxTeams}</p>
            <p>Draft Date: {league.draftDate ? new Date(league.draftDate).toLocaleDateString() : 'TBD'}</p>

            <h2>Teams in this League</h2>
            {teams.length === 0 ? (
                <p>No teams in this league yet.</p>
            ) : (
                <table className="table-full-width">
                    <thead>
                        <tr>
                            <th>Team Name</th>
                            <th>Owner</th>
                            <th>Total Points</th>
                            <th>Ranking</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team) => (
                            <tr key={team.teamID}>
                                <td>{team.teamName}</td>
                                <td>{team.ownerUsername}</td>
                                <td>{team.totalPoints || 0}</td>
                                <td>{team.ranking || 'N/A'}</td>
                                <td>
                                    <button onClick={() => navigate(`/team/${team.teamID}`)}>View Team</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {!userIsInLeague && !isCommissioner && league.leagueType === 'P' && !leagueIsFull && (
                <button onClick={() => setIsJoinLeagueModalOpen(true)}>Join League</button>
            )}

            {isJoinLeagueModalOpen && (
                <JoinLeagueModal
                    leagueID={leagueID}
                    onClose={() => setIsJoinLeagueModalOpen(false)}
                    onJoined={() => {
                        fetchLeague();
                        fetchTeams();
                    }}
                />
            )}

            <h2>Drafts for this League</h2>
            {drafts.length === 0 ? (
                <p>No drafts created yet.</p>
            ) : (
                <ul>
                    {drafts.map((draft) => (
                        <li key={draft.draftID}>
                            <Link to={`/draft/${draft.draftID}`}>
                                {draft.sport} Draft - Status: {draft.draftStatus === 'P' ? 'Pending' : 'Active'}
                            </Link>
                            {draft.draftStatus === 'P' && (
                                isUserTeamInDraft(draft.draftID) ? (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await axios.post(`/draft/${draft.draftID}/leave`, { teamID: userTeamID });
                                                alert('Left draft successfully!');
                                                fetchDrafts(); // Refresh drafts list after leaving
                                            } catch (error) {
                                                console.error('Error leaving draft:', error);
                                                alert('Failed to leave draft.');
                                            }
                                        }}
                                    >
                                        Leave Draft
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await axios.post(`/draft/${draft.draftID}/join`, { teamID: userTeamID });
                                                alert('Joined draft successfully!');
                                                fetchDrafts(); // Refresh drafts list after joining
                                            } catch (error) {
                                                console.error('Error joining draft:', error);
                                                alert('Failed to join draft.');
                                            }
                                        }}
                                    >
                                        Join Draft
                                    </button>
                                )
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {isCommissioner && (
                <button onClick={() => setIsCreateDraftModalOpen(true)}>Create Draft</button>
            )}

            {isCreateDraftModalOpen && (
                <CreateDraftModal
                    leagueID={leagueID}
                    onClose={() => setIsCreateDraftModalOpen(false)}
                    onDraftCreated={fetchDrafts}
                />
            )}
        </div>
    );
}

export default LeagueDetails;
