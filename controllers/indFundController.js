const express = require('express');
const individualFundService = require('../services/indFundService');
const authService = require('../services/authService');
const router = express.Router();

// ----------------------------------------------------------
// API endpoints for the IndividualFund table
// Modify or extend these routes based on your project's needs.


// Fetch all individual funds from the IndividualFund table
router.get('/individual', async (req, res) => {
    const individualFunds = await individualFundService.fetchIndividualFundsFromDb();
    res.json({ data: individualFunds });
});

// Initialize the IndividualFund table (drop and recreate)
router.post("/initiate", async (req, res) => {
    const initiateResult = await individualFundService.initiateIndividualFundsTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Insert a new individual fund into the IndividualFund table
router.post("/insert", authService.protect, async (req, res) => {
    const { purpose, balance, verification, ssn } = req.body;
    const userEmail = req.user.EMAIL; // Assuming req.user has the authenticated user's email

    const insertResult = await individualFundService.insertIndividualFund(purpose, balance, verification, ssn, userEmail);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});


router.post("/update", authService.protect, async (req, res) => {
    const { fundId, purpose, balance, verification, newSSN, userEmail } = req.body;

    const updates = { purpose, balance, verification, newSSN, userEmail };
    const updateResult = await individualFundService.updateFundAndIndividualFund(fundId, updates);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Get the count of individual funds in the IndividualFund table
router.get('/counts', async (req, res) => {
    const individualFundCount = await individualFundService.countIndividualFunds();
    if (individualFundCount >= 0) {
        res.json({
            success: true,
            count: individualFundCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: individualFundCount
        });
    }
});

module.exports = router;
