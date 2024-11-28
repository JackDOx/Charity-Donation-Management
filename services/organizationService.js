const oracledb = require('oracledb');
const loadEnvFile = require('../utils/envUtil');

const envVariables = loadEnvFile('./.env');

const { withOracleDB } = require('./userService'); // Assuming db.js contains your withOracleDB function

// ----------------------------------------------------------


async function fetchOrganizationsFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM VolunteerOrganization');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function projection(columns) {
    return await withOracleDB(async (connection) => {
        const query = `SELECT ${columns.join(', ')} FROM VolunteerOrganization`;
        const result = await connection.execute(query);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateOrganizationsTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE VolunteerOrganization`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE VolunteerOrganization (
                Email VARCHAR(255) PRIMARY KEY,
                Password VARCHAR(255) NOT NULL,
                Name VARCHAR(100) NOT NULL,
                Field VARCHAR(50) NOT NULL,
                Address VARCHAR(255) NOT NULL,
                Verification VARCHAR(255) NOT NULL,
                CONSTRAINT Unique_namefield UNIQUE (Name, Field)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertOrganization(email, password, name, field, address, verification) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `INSERT INTO VolunteerOrganization (Email, Password, Name, Field, Address, Verification) VALUES (:email, :password, :name, :field, :address, :verification)`,
                [email, password, name, field, address, verification],
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

async function updateOrganizationDetails(email, newAddress, newName, newField) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `UPDATE VolunteerOrganization 
                 SET Address = :newAddress, Name = :newName, Field = :newField 
                 WHERE Email = :email`,
                [newAddress, newName, newField, email],
                { autoCommit: true }
            );

            return result.rowsAffected && result.rowsAffected > 0;
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            }
            return false;
        }
    }).catch(() => {
        return false;
    });
}


async function countOrganizations() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM VolunteerOrganization');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

module.exports = {
    fetchOrganizationsFromDb,
    initiateOrganizationsTable,
    insertOrganization,
    updateOrganizationDetails,
    countOrganizations,
    projection
};
