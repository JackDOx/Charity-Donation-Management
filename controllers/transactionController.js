const express = require('express');
const transactionService = require('../services/transactionService');
const authService = require('../services/authService');
const router = express.Router();

// ----------------------------------------------------------
// API endpoints for the Transaction table
// Modify or extend these routes based on your project's needs.


// Fetch all transactions from the Transaction table
router.get('/', async (req, res) => {
    const transactions = await transactionService.fetchTransactionsFromDb();
    res.json({ data: transactions });
});

router.get('/:userEmail', async (req, res) => {
  const userEmail = req.params.userEmail;
  const transactions = await transactionService.findUserTransaction(userEmail);
  res.json({ data: transactions });
});

router.get('/userDonatedAll', async (req, res) => {
  const result = await transactionService.findUsersWithTransactionsInAllFunds();
  res.json({ data: result});
});
// Initialize the Transaction tablze (drop and recreate)
router.post("/initiate", async (req, res) => {
    const initiateResult = await transactionService.initiateTransactionsTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/findFundsAboveAvg', async (req, res) => {
  const result = await transactionService.findFundsAboveOverallAvg();
  res.status(200).json({ data: result});  
});

// Insert a new transaction into the Transaction table
router.post("/insert", authService.protect, async (req, res) => {
    let { amount, transactionDate, content, userEmail, fundID, organizationEmail } = req.body;
    if (req.user) {
      userEmail = req.user.EMAIL;
    }
    
    if (req.org) {
      organizationEmail = req.org.EMAIL;
    }
    

    const insertResult = await transactionService.insertTransaction(amount, transactionDate, content, userEmail, fundID, organizationEmail);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Update a transaction based on its ID
router.post("/update", async (req, res) => {
    const { id, amount, transactionDate, content, userEmail, fundID, organizationEmail } = req.body;
    const updateResult = await transactionService.updateTransaction(id, amount, transactionDate, content, userEmail, fundID, organizationEmail);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Get the count of transactions in the Transaction table
router.get('/count', async (req, res) => {
    const transactionCount = await transactionService.countTransactions();
    if (transactionCount >= 0) {
        res.json({
            success: true,
            count: transactionCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: transactionCount
        });
    }
});

module.exports = router;
