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
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS another_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            example_column VARCHAR(255)
        )`,
    ];

    for (const query of queries) {
        await new Promise((resolve, reject) => {
            pool.query(query, (err, results) => {
                if (err) {
                    console.error(`Error creating table: ${err.message}`);
                    reject(err);
                } else {
                    console.log('Table ensured:', query.split(' ')[2]); // Log the table name
                    resolve(results);
                }
            });
        });
    }
}

// Function to ensure the database exists and initialize tables
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
                connection.end(); // Close the temporary connection
                try {
                    await createTables(pool);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

module.exports = { pool, initializeDatabase };
