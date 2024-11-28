const express = require('express');
const organizationService = require('../services/organizationService');
const authService = require('../services/authService');
const router = express.Router();

// ----------------------------------------------------------
// API endpoints for the VolunteerOrganization table
// Modify or extend these routes based on your project's needs.

router.post('/signup', authService.organizationSignup);
router.post('/login', authService.organizationLogin);

router.get('/check-db-connection', async (req, res) => {
    const isConnect = await organizationService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/projection', async (req, res) => {
    if (!req.body || ! req.body.columns) {
        res.status(400).json({ error: "No column provided"});
    }
    const orgs = await organizationService.projection(req.body.columns);

    res.json({ data: orgs });
});

// Fetch all organizations from the VolunteerOrganization table
router.get('/organizations', async (req, res) => {
    const organizations = await organizationService.fetchOrganizationsFromDb();
    res.json({ data: organizations });
});

// Initialize the VolunteerOrganization table (drop and recreate)
router.post("/initiate", async (req, res) => {
    const initiateResult = await organizationService.initiateOrganizationsTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Insert a new organization into the VolunteerOrganization table
router.post("/insert", async (req, res) => {
    const { email, password, name, field, address, verification } = req.body;
    const insertResult = await organizationService.insertOrganization(email, password, name, field, address, verification);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Update an organization's address based on their email
router.post("/update", async (req, res) => {
    const { email, newAddress, name, field } = req.body;
    const updateResult = await organizationService.updateOrganizationDetails(email, newAddress, name, field);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Get the count of organizations in the VolunteerOrganization table
router.get('/counts', async (req, res) => {
    const organizationCount = await organizationService.countOrganizations();
    if (organizationCount >= 0) {
        res.json({
            success: true,
            count: organizationCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: organizationCount
        });
    }
});

module.exports = router;
