const express = require('express');
const organizationFundService = require('../services/orgFundService');
const authService = require('../services/authService');
const router = express.Router();

// ----------------------------------------------------------
// API endpoints for the OrganizationFund table
// Modify or extend these routes based on your project's needs.

// Fetch all organization funds from the OrganizationFund table
router.get('/organization-funds', async (req, res) => {
    const organizationFunds = await organizationFundService.fetchOrganizationFundsFromDb();
    res.json({ data: organizationFunds });
});

// Initialize the OrganizationFund table (drop and recreate)
router.post('/initiate', async (req, res) => {
    const initiateResult = await organizationFundService.initiateOrganizationFundsTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Insert a new organization fund into the OrganizationFund table
router.post('/insert', authService.protect, async (req, res) => {
    const { purpose, balance, verification, taxID } = req.body;
    const email = req.user.EMAIL;
    const insertResult = await organizationFundService.insertOrganizationFund(email, purpose, balance, verification, taxID);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});


router.post('/update', authService.protect, async (req, res) => {
    const { fundId, purpose, balance, verification, newTaxID } = req.body;

    const updates = { purpose, balance, verification, newTaxID };
    const updateResult = await organizationFundService.updateFundAndOrganizationFund(fundId, updates);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Get the count of organization funds in the OrganizationFund table
router.get('/counts', async (req, res) => {
    const organizationFundCount = await organizationFundService.countOrganizationFunds();
    if (organizationFundCount >= 0) {
        res.json({
            success: true,
            count: organizationFundCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: organizationFundCount
        });
    }
});

module.exports = router;
