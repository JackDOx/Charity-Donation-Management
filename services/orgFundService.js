const oracledb = require('oracledb');
const { withOracleDB } = require('./userService'); // Adjust the path to your withOracleDB function

async function fetchOrganizationFundsFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT OF.ID, OF.TaxID, F.Purpose, F.Balance, F.Verification
            FROM OrganizationFund OF
            JOIN Fund F ON OF.ID = F.ID
        `);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateOrganizationFundsTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE OrganizationFund`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE OrganizationFund (
                ID NUMBER PRIMARY KEY,
                OrgEmail VARCHAR(255) NOT NULL,
                TaxID NUMBER(9) UNIQUE NOT NULL,
                CONSTRAINT Org_Fund FOREIGN KEY (ID) REFERENCES Fund(ID) ON DELETE CASCADE,
                CONSTRAINT Org_Fund_Email FOREIGN KEY (OrgEmail) REFERENCES VolunteerOrganization(Email) ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertOrganizationFund(email, purpose, balance, verification, taxID) {
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

            // Insert into OrganizationFund with the created Fund ID
            const organizationFundResult = await connection.execute(
                `INSERT INTO OrganizationFund (ID, OrgEmail, TaxID) VALUES (:fundId, :email, :taxID)`,
                [fundId, email, taxID],
                { autoCommit: true }
            );

            return organizationFundResult.rowsAffected && organizationFundResult.rowsAffected > 0;
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

async function updateOrganizationFundTaxID(id, newTaxID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE OrganizationFund
            SET TaxID = :newTaxID
            WHERE ID = :id`,
            { id: id, newTaxID: newTaxID },
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateFundAndOrganizationFund(fundId, updates) {
    return await withOracleDB(async (connection) => {
        try {
            // Start a transaction by setting auto-commit to false
            await connection.execute(`SET TRANSACTION NAME 'update_fund_and_organization_fund'`);

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

            // Prepare dynamic update parts and bindings for OrganizationFund table
            const organizationFundUpdateParts = [];
            const organizationFundBindings = { fundId };

            if (updates.newTaxID !== undefined) {
                organizationFundUpdateParts.push("TaxID = :newTaxID");
                organizationFundBindings.newTaxID = updates.newTaxID;
            }

            if (organizationFundUpdateParts.length > 0) {
                const organizationFundUpdateQuery = `
                    UPDATE OrganizationFund
                    SET ${organizationFundUpdateParts.join(", ")}
                    WHERE ID = :fundId
                `;
                await connection.execute(organizationFundUpdateQuery, organizationFundBindings, { autoCommit: false });
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
}

async function countOrganizationFunds() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM OrganizationFund');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

module.exports = {
    fetchOrganizationFundsFromDb,
    initiateOrganizationFundsTable,
    insertOrganizationFund,
    updateOrganizationFundTaxID,
    countOrganizationFunds,
    updateFundAndOrganizationFund
};
