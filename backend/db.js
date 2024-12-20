const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Function to create tables
async function createTables(pool) {
    const queries = [
        // Users Table
        `CREATE TABLE IF NOT EXISTS users (
            userID INT AUTO_INCREMENT PRIMARY KEY, 
            fullname VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL UNIQUE, 
            username VARCHAR(20) NOT NULL UNIQUE, 
            password VARCHAR(64) NOT NULL,
            isAdmin BOOLEAN NOT NULL DEFAULT FALSE,
            isBanned BOOLEAN NOT NULL DEFAULT FALSE
        )`,

        // Profile Settings Table
        `CREATE TABLE IF NOT EXISTS profileSetting (
            userID INT PRIMARY KEY,
            favoriteSport VARCHAR(50),
            aboutMe VARCHAR(255),
            FOREIGN KEY (userID) REFERENCES users(userID)
        )`,

        // League Table
        `CREATE TABLE IF NOT EXISTS league (
            leagueID INT AUTO_INCREMENT PRIMARY KEY,
            leagueName VARCHAR(30) NOT NULL,
            leagueType CHAR(1) NOT NULL,
            commissioner INT,
            maxTeams INT NOT NULL,
            draftDate DATE,
            FOREIGN KEY (commissioner) REFERENCES users(userID)
        )`,
        
        // Draft Table
        `CREATE TABLE IF NOT EXISTS draft (
            draftID INT AUTO_INCREMENT PRIMARY KEY,
            leagueID INT NOT NULL, 
            draftDate DATE NOT NULL,
            draftOrder CHAR(1) NOT NULL, -- 'S' for Snake, 'R' for Round Robin
            draftStatus CHAR(1) NOT NULL, -- 'P' for Pending, 'I' for In Progress, 'C' for Completed
            sport VARCHAR(20) NOT NULL,
            lastPickTime DATETIME DEFAULT NULL, -- Timestamp for the last pick
            rounds INT DEFAULT 1, -- Total number of rounds (optional)
            picksMade INT DEFAULT 0, -- Tracks the number of picks made so far
            FOREIGN KEY (leagueID) REFERENCES league(leagueID)
        )`,
        
        // Team Table
        `CREATE TABLE IF NOT EXISTS team (
            teamID INT AUTO_INCREMENT PRIMARY KEY, 
            teamName VARCHAR(25) NOT NULL,
            leagueID INT, 
            draftID INT,
            owner INT,
            totalPoints INT,
            ranking INT,
            status CHAR(1),
            FOREIGN KEY (leagueID) REFERENCES league(leagueID),
            FOREIGN KEY (draftID) REFERENCES draft(draftID),
            FOREIGN KEY (owner) REFERENCES users(userID)
        );`,

        // Player Table
        `CREATE TABLE IF NOT EXISTS player (
            playerID INT AUTO_INCREMENT PRIMARY KEY, 
            fullname VARCHAR(50) NOT NULL, 
            sport VARCHAR(20) NOT NULL, 
            position VARCHAR(20), 
            realLifeTeam VARCHAR(50), 
            fantasyPoints DECIMAL(6,2), 
            availabilityStatus CHAR(1)
        )`,

        // Matches Table
        `CREATE TABLE IF NOT EXISTS matches (
            matchID INT AUTO_INCREMENT PRIMARY KEY, 
            team1ID INT, 
            team2ID INT, 
            matchDate DATE,
            finalScore VARCHAR(10),
            winner INT, 
            FOREIGN KEY (team1ID) REFERENCES team(teamID),
            FOREIGN KEY (team2ID) REFERENCES team(teamID),
            FOREIGN KEY (winner) REFERENCES team(teamID)
        )`,

        // Player Statistic Table
        `CREATE TABLE IF NOT EXISTS playerStatistic (
            matchID INT, 
            playerID INT, 
            performanceStats JSON,
            injuryStatus CHAR(1),
            PRIMARY KEY (matchID, playerID),
            FOREIGN KEY (matchID) REFERENCES matches(matchID),
            FOREIGN KEY (playerID) REFERENCES player(playerID)
        )`,

        // Drafted Players Table
        `CREATE TABLE IF NOT EXISTS draftedPlayers (
            draftID INT NOT NULL, 
            playerID INT NOT NULL, 
            teamID INT NOT NULL,
            PRIMARY KEY (draftID, playerID),
            FOREIGN KEY (draftID) REFERENCES draft(draftID),
            FOREIGN KEY (playerID) REFERENCES player(playerID),
            FOREIGN KEY (teamID) REFERENCES team(teamID)
        );`,
        
        `CREATE TABLE IF NOT EXISTS draftTeams (
            draftID INT NOT NULL,
            teamID INT NOT NULL,
            PRIMARY KEY (draftID, teamID),
            FOREIGN KEY (draftID) REFERENCES draft(draftID) ON DELETE CASCADE,
            FOREIGN KEY (teamID) REFERENCES team(teamID) ON DELETE CASCADE
        );`,

        // Draft Order Table
        `CREATE TABLE IF NOT EXISTS draftOrder (
            draftID INT NOT NULL,
            teamID INT NOT NULL,
            pickOrder INT NOT NULL,
            PRIMARY KEY (draftID, teamID),
            FOREIGN KEY (draftID) REFERENCES draft(draftID) ON DELETE CASCADE,
            FOREIGN KEY (teamID) REFERENCES team(teamID) ON DELETE CASCADE
        )`,
    ];

    for (const query of queries) {
        await new Promise((resolve, reject) => {
            pool.query(query, (err, results) => {
                if (err) {
                    console.error(`Error creating table: ${err.message}`);
                    reject(err);
                } else {
                    console.log('Table ensured:', query.split(' ')[2]);
                    resolve(results);
                }
            });
        });
    }
}

// Function to create `updateProfileSetting` safely
async function createFunction(pool) {
    const dropFunctionQuery = `DROP FUNCTION IF EXISTS updateProfileSetting;`;
    const functionQuery = `
        CREATE FUNCTION updateProfileSetting (
            thisUserID INT,
            favoriteSport VARCHAR(255),
            newAbout VARCHAR(255)
        )
        RETURNS VARCHAR(255)
        DETERMINISTIC
        BEGIN
            INSERT INTO profileSetting (userID, favoriteSport, aboutMe)
            VALUES (thisUserID, favoriteSport, newAbout)
            ON DUPLICATE KEY UPDATE
                favoriteSport = VALUES(favoriteSport),
                aboutMe = VALUES(aboutMe);

            RETURN 'ProfileSetting updated successfully!';
        END;
    `;

    await pool.promise().query(dropFunctionQuery);
    await pool.promise().query(functionQuery);
}

// Function to create trigger safely
async function createTrigger(pool) {
    const dropTriggerQuery = `DROP TRIGGER IF EXISTS delete_inactive_teams_before_user_delete;`;
    const triggerQuery = `
        CREATE TRIGGER delete_inactive_teams_before_user_delete
        BEFORE DELETE ON users
        FOR EACH ROW
        BEGIN
            DELETE FROM team
            WHERE status = 'I';
        END;
    `;

    await pool.promise().query(dropTriggerQuery);
    await pool.promise().query(triggerQuery);
}

// Initialize the database
async function initializeDatabase(pool) {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    return new Promise((resolve, reject) => {
        connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``, async (err) => {
            if (err) {
                console.error('Error creating database:', err.message);
                reject(err);
            } else {
                console.log(`Database ${process.env.DB_NAME} is ready.`);
                connection.end();
                try {
                    await createTables(pool);
                    await createFunction(pool);
                    await createTrigger(pool);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

module.exports = { pool, initializeDatabase };
