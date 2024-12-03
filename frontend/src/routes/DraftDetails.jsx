import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function DraftDetails() {
    const { draftID } = useParams();
    const [draft, setDraft] = useState(null);
    const [commissioner, setCommissioner] = useState(null);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [userID, setUserID] = useState(null);
    const [userTeamID, setUserTeamID] = useState(null);
    const [currentTurn, setCurrentTurn] = useState(null);
    const [draftedPlayers, setDraftedPlayers] = useState([]);

    // Fetch user data
    const fetchUserData = async () => {
        console.log("Fetching user data...");
        try {
            const response = await axios.get("/fetchUserData");
            setUserID(response.data.user.userID);
            console.log("User data fetched successfully:", response.data.user);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Fetch draft details
    const fetchDraftDetails = async () => {
        console.log(`Fetching draft details for draftID: ${draftID}...`);
        try {
            const { data } = await axios.get(`/draft/${draftID}`);
            setDraft(data.draft);
            setPlayers(data.players);
            console.log("Draft details fetched successfully:", data);

            // Fetch commissioner details using leagueID from the draft
            const leagueID = data.draft.leagueID;
            if (leagueID) {
                console.log(`Fetching commissioner details for leagueID: ${leagueID}...`);
                const leagueResponse = await axios.get(`/league/${leagueID}`);
                setCommissioner(leagueResponse.data.commissioner);
                console.log("Commissioner details fetched successfully:", leagueResponse.data);
            }
        } catch (error) {
            console.error("Error fetching draft details:", error);
        }
    };

    // Fetch teams for this draft
    const fetchTeamsForDraft = async () => {
        console.log(`Fetching teams for draftID: ${draftID}...`);
        try {
            const { data } = await axios.get(`/draft/${draftID}/teams`);
            setTeams(data.teams);
            console.log("Teams fetched successfully:", data.teams);

            const userTeam = data.teams.find((team) => team.owner === userID);
            setUserTeamID(userTeam ? userTeam.teamID : null);
            console.log("User's team ID:", userTeam ? userTeam.teamID : "No team found for user");
        } catch (error) {
            console.error("Error fetching teams for draft:", error);
        }
    };

    // Fetch the current turn for this draft
    const fetchCurrentTurn = async () => {
        console.log(`Fetching current turn for draftID: ${draftID}...`);
        try {
            const { data } = await axios.get(`/draft/${draftID}/currentTurn`);
            setCurrentTurn(data.teamID);
            console.log("Current turn fetched successfully:", data.teamID);
        } catch (error) {
            console.error("Error fetching current turn:", error);
        }
    };

    // Fetch drafted players
    const fetchDraftedPlayers = async () => {
        console.log(`Fetching drafted players for draftID: ${draftID}...`);
        try {
            const { data } = await axios.get(`/draft/${draftID}/draftedPlayers`);
            setDraftedPlayers(data.draftedPlayers);
            console.log("Drafted players fetched successfully:", data.draftedPlayers);
        } catch (error) {
            console.error("Error fetching drafted players:", error);
        }
    };

    // Handle player draft
    const handlePickPlayer = async (playerID) => {
        if (userTeamID !== currentTurn) {
            alert("Not your turn to draft!");
            console.log("Draft attempt blocked: Not user's turn");
            return;
        }
        console.log(`Attempting to draft playerID: ${playerID} for teamID: ${userTeamID}...`);
        try {
            await axios.post(`/draft/${draftID}/pick`, { playerID });
            alert("Player drafted successfully!");
            console.log("Player drafted successfully.");
            fetchDraftDetails();
            fetchCurrentTurn();
            fetchDraftedPlayers();
        } catch (error) {
            console.error("Error drafting player:", error);
        }
    };

    // Start the draft
    const handleStartDraft = async () => {
        console.log(`Attempting to start draft for draftID: ${draftID}...`);
        try {
            await axios.post(`/draft/${draftID}/start`);
            alert("Draft started successfully!");
            console.log("Draft started successfully.");
            fetchDraftDetails();
        } catch (error) {
            console.error("Error starting draft:", error);
        }
    };

useEffect(() => {
    let interval;
    
    if (draft && draft.draftStatus === "A") {
        // Start polling if the draft is active
        interval = setInterval(() => {
            fetchCurrentTurn();
        }, 5000); // Poll every 5 seconds
    }

    // Clean up the interval when the draft becomes inactive or component unmounts
    return () => clearInterval(interval);
}, [draft]);


    useEffect(() => {
        console.log("Component mounted. Fetching user data...");
        fetchUserData();
    }, []);

    useEffect(() => {
        if (userID) {
            console.log("User ID available. Fetching draft data...");
            fetchDraftDetails();
            fetchTeamsForDraft();
            fetchCurrentTurn();
            fetchDraftedPlayers();
        }
    }, [userID]);

    // Convert both commissioner and userID to the same type for accurate comparison
    const isCommissioner = Number(commissioner) === Number(userID);
    console.log("Is user commissioner?", isCommissioner);

    if (!draft || !userID) return <div>Loading...</div>;

    return (
        <div>
            <h1>Draft for {draft.sport}</h1>
            <p>Status: {draft.draftStatus === "P" ? "Pending" : draft.draftStatus === "A" ? "Active" : "Completed"}</p>
            <p>Commissioner: {commissioner || "Unknown"}</p>
            <p>User ID: {userID}</p>
            <p>Commissioner ID (for debug): {commissioner}</p>

            {draft.draftStatus === "P" && isCommissioner && (
                <button onClick={handleStartDraft}>Start Draft</button>
            )}

            <h2>Teams</h2>
            <ul>
                {teams.map((team) => (
                    <li key={team.teamID}>
                        {team.teamName} {currentTurn === team.teamID ? "(Current Turn)" : ""}
                    </li>
                ))}
            </ul>

            <h2>Available Players</h2>
            {draft.draftStatus === "A" ? (
                <ul>
                    {players
                        .filter((player) => !draftedPlayers.some((dp) => dp.playerID === player.playerID))
                        .map((player) => (
                            <li key={player.playerID}>
                                {player.fullname} ({player.position}) - {player.realLifeTeam}
                                {userTeamID === currentTurn && (
                                    <button onClick={() => handlePickPlayer(player.playerID)}>Draft</button>
                                )}
                            </li>
                        ))}
                </ul>
            ) : (
                <p>Draft has not started yet or is completed.</p>
            )}

            <h2>Drafted Players</h2>
            <ul>
                {draftedPlayers.map((dp) => (
                    <li key={dp.playerID}>
                        {dp.fullname} drafted by {teams.find((team) => team.teamID === dp.teamID)?.teamName || "Unknown Team"}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DraftDetails;