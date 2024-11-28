const express = require('express');
const fundService = require('../services/fundService');
const router = express.Router();

// ----------------------------------------------------------
// API endpoints for the Fund table
// Modify or extend these routes based on your project's needs.


// Fetch all funds from the Fund table
router.get('/funds', async (req, res) => {
    const funds = await fundService.fetchFundsFromDb();
    res.json({ data: funds });
});

router.get('/fundsLarger/:threshold', async (req, res) => {
    const threshold = req.params.threshold;
    const funds = await fundService.findTransactionsWithBalance(threshold);
    res.json({ data: funds});
});

router.delete('/:fundID', async (req, res) => {
    const fundID = req.params.fundID;
    const result = await fundService.deleteFund(fundID);
    if (result) {
        res.status(200).json({ success: true});
    } else {
        res.status(500).json({ success: false});
    }
});

// Initialize the Fund table (drop and recreate)
router.post("/initiate", async (req, res) => {
    const initiateResult = await fundService.initiateFundsTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Insert a new fund into the Fund table
router.post("/insert", async (req, res) => {
    const { purpose, balance, verification } = req.body;
    const insertResult = await fundService.insertFund(purpose, balance, verification);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Update a fund's balance based on its ID
router.post("/update", async (req, res) => {
    const { fundId, newBalance } = req.body;
    const updateResult = await fundService.updateFundBalance(fundId, newBalance);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Get the count of funds in the Fund table
router.get('/count', async (req, res) => {
    const fundCount = await fundService.countFunds();
    if (fundCount >= 0) {
        res.json({
            success: true,
            count: fundCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: fundCount
        });
    }
});

module.exports = router;
