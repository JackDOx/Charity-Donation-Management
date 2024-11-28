const oracledb = require('oracledb');
const loadEnvFile = require('../utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,       // Only one connection in the pool
    poolMax: 3,
    poolIncrement: 1, // No additional connections will be created
    poolTimeout: 60,  // Recycle the connection if idle for 60 seconds
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);

// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool
        return await action(connection);
    } catch (err) {
        console.error("123" + err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchUsersFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Users');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateUsersTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE USERS`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE USERS (
                Email VARCHAR(255) PRIMARY KEY,
                Password VARCHAR(255) NOT NULL,
                Name VARCHAR(50) NOT NULL,
                PhoneNumber CHAR(10) NOT NULL,
                CONSTRAINT email_format CHECK (REGEXP_LIKE(Email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'))
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

function parseConditions(conditionString) {
    // Example parser: splits conditions by ' AND ' and ' OR '
    // This is a simplified example, and you might want to use a more sophisticated parser for complex conditions
    const conditions = conditionString.split(/( AND | OR )/i).map(part => part.trim());
    return conditions;
}

async function selection(conditionString) {
    const conditions = parseConditions(conditionString);

    const query = `SELECT * FROM USERS WHERE ${conditions.join(' ')}`;

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query);
        return result.rows;
    }).catch((error) => {
        console.error("An error occurred while executing the query:", error);
        return [];
    });
}

async function insertUser(email, password, name, phoneNumber) {
    return await withOracleDB(async (connection) => {
        try {
        const result = await connection.execute(
            `INSERT INTO USERS (Email, Password, Name, PhoneNumber) VALUES (:email, :password, :name, :phoneNumber)`,
            [email, password, name, phoneNumber],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            }
        }
    }).catch(() => {
        return false;
    });
}

async function updateUserPhoneNumber(email, newPhoneNumber) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Users SET PhoneNumber=:newPhoneNumber WHERE Email=:email`,
            [newPhoneNumber, email],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countUsers() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM Users');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

module.exports = {
    testOracleConnection,
    fetchUsersFromDb,
    initiateUsersTable,
    insertUser,
    updateUserPhoneNumber,
    countUsers,
    withOracleDB,
    selection
};
