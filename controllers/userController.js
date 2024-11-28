const express = require('express');
const userService = require('../services/userService');
const authService = require('../services/authService');
const router = express.Router();

// ----------------------------------------------------------
// API endpoints for the Users table
// Modify or extend these routes based on your project's needs.

router.post('/signup', authService.signup);
router.post('/login', authService.login);

router.get('/check-db-connection', async (req, res) => {
    const isConnect = await userService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

// Fetch all users from the Users table
router.get('/users', async (req, res) => {
    const users = await userService.fetchUsersFromDb();
    res.json({ data: users });
});

// Initialize the Users table (drop and recreate)
router.post("/initiates", async (req, res) => {
    const initiateResult = await userService.initiateUsersTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});


router.post('/search-users', async (req, res) => {
    const { conditions } = req.body;
    const results = await userService.selection(conditions);
    res.json({ data: results });
});



// Insert a new user into the Users table
router.post("/insert-user", async (req, res) => {
    const { email, password, name, phoneNumber } = req.body;
    const insertResult = await userService.insertUser(email, password, name, phoneNumber);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Update a user's phone number based on their email
router.post("/update-user-phone", async (req, res) => {
    const { email, newPhoneNumber } = req.body;
    const updateResult = await userService.updateUserPhoneNumber(email, newPhoneNumber);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Get the count of users in the Users table
router.get('/counts', async (req, res) => {
    const userCount = await userService.countUsers();
    if (userCount >= 0) {
        res.json({
            success: true,
            count: userCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: userCount
        });
    }
});


module.exports = router;
