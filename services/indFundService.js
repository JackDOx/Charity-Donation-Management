const oracledb = require('oracledb');
const { withOracleDB } = require('./userService'); // Adjust the path to your withOracleDB function

// ----------------------------------------------------------

async function fetchIndividualFundsFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT IF.ID, IF.SSN, IF.UserEmail, F.Purpose, F.Balance, F.Verification
            FROM IndividualFund IF
            JOIN Fund F ON IF.ID = F.ID
        `);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateIndividualFundsTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE IndividualFund`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE IndividualFund (
                ID NUMBER PRIMARY KEY,
                SSN NUMBER(9) NOT NULL,
                UserEmail VARCHAR(255) NOT NULL,
                CONSTRAINT IndFund_User FOREIGN KEY (UserEmail) REFERENCES Users(Email) ON DELETE CASCADE,
                CONSTRAINT Ind_Fund FOREIGN KEY (ID) REFERENCES Fund(ID) ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertIndividualFund(purpose, balance, verification, ssn, userEmail) {
    return await withOracleDB(async (connection) => {
        try {
            // Create a Fund entry first
            const fundResult = await connection.execute(
                `INSERT INTO Fund (Purpose, Balance, Verification) VALUES (:purpose, :balance, :verification) RETURNING ID INTO :id`,
                {
                    purpose,
                    balance,
                    verification,
                    id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                { autoCommit: false }
            );

            const fundId = fundResult.outBinds.id[0];

            // Insert into IndividualFund with the created Fund ID
            const individualFundResult = await connection.execute(
                `INSERT INTO IndividualFund (ID, SSN, UserEmail) VALUES (:fundId, :ssn, :userEmail)`,
                [fundId, ssn, userEmail],
                { autoCommit: true }
            );

            return individualFundResult.rowsAffected && individualFundResult.rowsAffected > 0;
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            }
            throw err;
        }
    }).catch((err) => {
        console.error(err);
        return false;
    });
}

async function updateIndividualFundSSN(id, newSSN, email) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE IndividualFund
            SET SSN=:newSSN, UserEmail=:email
            WHERE ID=:id`,
            { id: id, newSSN: newSSN, email},
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function updateFundAndIndividualFund(fundId, updates) {
    return await withOracleDB(async (connection) => {
        try {
            // Start a transaction by setting auto-commit to false
            await connection.execute(`SET TRANSACTION NAME 'update_fund_and_individual_fund'`);

            // Prepare dynamic update parts and bindings for Fund table
            const fundUpdateParts = [];
            const fundBindings = { fundId };

            if (updates.purpose !== undefined) {
                fundUpdateParts.push("Purpose = :purpose");
                fundBindings.purpose = updates.purpose;
            }
            if (updates.balance !== undefined) {
                fundUpdateParts.push("Balance = :balance");
                fundBindings.balance = updates.balance;
            }
            if (updates.verification !== undefined) {
                fundUpdateParts.push("Verification = :verification");
                fundBindings.verification = updates.verification;
            }

            if (fundUpdateParts.length > 0) {
                const fundUpdateQuery = `
                    UPDATE Fund
                    SET ${fundUpdateParts.join(", ")}
                    WHERE ID = :fundId
                `;
                await connection.execute(fundUpdateQuery, fundBindings, { autoCommit: false });
            }

            // Prepare dynamic update parts and bindings for IndividualFund table
            const individualFundUpdateParts = [];
            const individualFundBindings = { fundId };

            if (updates.newSSN !== undefined) {
                individualFundUpdateParts.push("SSN = :newSSN");
                individualFundBindings.newSSN = updates.newSSN;
            }
            if (updates.userEmail !== undefined) {
                individualFundUpdateParts.push("UserEmail = :userEmail");
                individualFundBindings.userEmail = updates.userEmail;
            }

            if (individualFundUpdateParts.length > 0) {
                const individualFundUpdateQuery = `
                    UPDATE IndividualFund
                    SET ${individualFundUpdateParts.join(", ")}
                    WHERE ID = :fundId
                `;
                await connection.execute(individualFundUpdateQuery, individualFundBindings, { autoCommit: false });
            }

            // Commit the transaction if both updates succeed
            await connection.commit();

            return true;
        } catch (err) {
            // Rollback the transaction in case of an error
            await connection.rollback();
            if (err instanceof Error) {
                console.log(err.message);
            }
            return false;
        }
    }).catch((err) => {
        console.error(err);
        return false;
    });
};




async function countIndividualFunds() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM IndividualFund');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

module.exports = {
    fetchIndividualFundsFromDb,
    initiateIndividualFundsTable,
    insertIndividualFund,
    updateIndividualFundSSN,
    countIndividualFunds,
    updateFundAndIndividualFund
};
