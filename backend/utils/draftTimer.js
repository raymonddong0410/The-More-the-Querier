// utils/draftTimer.js
const activeDrafts = new Map(); // Track timers for active drafts

// Timer logic
const startDraftTimer = (pool, draftID) => {
    if (activeDrafts.has(draftID)) return; // Prevent duplicate timers

    const interval = setInterval(async () => {
        try {
            const [[draft]] = await pool.promise().query('SELECT * FROM draft WHERE draftID = ?', [draftID]);

            // Stop timer if draft is not active or doesn't exist
            if (!draft || draft.draftStatus !== 'A') {
                clearInterval(interval);
                activeDrafts.delete(draftID);
                return;
            }

            const currentTime = Date.now();
            const lastPickTime = new Date(draft.lastPickTime).getTime();
            const TIMEOUT_DURATION = 60 * 1000; // 1 minute per pick timeout

            // Check if time has elapsed for the current pick
            if (currentTime - lastPickTime > TIMEOUT_DURATION) {
                const [order] = await pool.promise().query(
                    `SELECT teamID FROM draftOrder WHERE draftID = ? ORDER BY pickOrder`,
                    [draftID]
                );

                const numTeams = order.length;
                if (!numTeams) {
                    console.error(`Draft ${draftID} has no teams in the order.`);
                    clearInterval(interval);
                    activeDrafts.delete(draftID);
                    return;
                }

                const round = Math.floor(draft.picksMade / numTeams);
                const pickIndex = draft.picksMade % numTeams;

                // Determine the current team's turn
                let currentTurnTeamID;
                if (draft.draftOrder === 'S') {
                    // Snake draft logic
                    currentTurnTeamID =
                        round % 2 === 0
                            ? order[pickIndex].teamID
                            : order[numTeams - 1 - pickIndex].teamID;
                } else {
                    // Round-robin logic
                    currentTurnTeamID = order[pickIndex].teamID;
                }

                // Auto-pick logic: select a random available player
                const [availablePlayers] = await pool.promise().query(
                    `SELECT playerID FROM player 
                     WHERE sport = ? AND availabilityStatus = "1"
                     AND playerID NOT IN (SELECT playerID FROM draftedPlayers WHERE draftID = ?)`,
                    [draft.sport, draftID]
                );

                if (availablePlayers.length) {
                    const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];

                    // Assign the player to the current team
                    await pool.promise().query(
                        'INSERT INTO draftedPlayers (draftID, playerID, teamID) VALUES (?, ?, ?)',
                        [draftID, randomPlayer.playerID, currentTurnTeamID]
                    );

                    console.log(`Auto-picked playerID ${randomPlayer.playerID} for teamID ${currentTurnTeamID} in draftID ${draftID}`);
                }

                // Update picksMade and lastPickTime
                await pool.promise().query(
                    'UPDATE draft SET picksMade = picksMade + 1, lastPickTime = ? WHERE draftID = ?',
                    [new Date(), draftID]
                );

                // Check if draft is complete
                const totalPicks = numTeams * draft.rounds; // Total picks required
                if (draft.picksMade + 1 >= totalPicks) {
                    await pool.promise().query('UPDATE draft SET draftStatus = "C" WHERE draftID = ?', [draftID]);
                    clearInterval(interval);
                    activeDrafts.delete(draftID);
                    console.log(`Draft ${draftID} completed.`);
                }
            }
        } catch (error) {
            console.error(`Error in draft timer for draftID ${draftID}:`, error);
        }
    }, 1000); // Check every second

    activeDrafts.set(draftID, interval); // Track the timer
};

// Resume active drafts on server restart
const resumeDrafts = async (pool) => {
    try {
        const [drafts] = await pool.promise().query('SELECT draftID FROM draft WHERE draftStatus = "A"');
        drafts.forEach(({ draftID }) => startDraftTimer(pool, draftID));
        console.log('Active drafts resumed.');
    } catch (error) {
        console.error('Error resuming drafts:', error);
    }
};

module.exports = { startDraftTimer, resumeDrafts };
