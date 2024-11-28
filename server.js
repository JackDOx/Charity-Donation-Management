const express = require('express');
// const appController = require('./appController');
const userController = require('./controllers/userController');
const orgController = require('./controllers/organizationController');
const fundController = require('./controllers/fundController');
const indFundController = require('./controllers/indFundController');
const orgFundController = require('./controllers/orgFundController');
const transactionController = require('./controllers/transactionController');

const cookieParser = require('cookie-parser');
// Load environment variables from .env file
// Ensure your .env file has the required database credentials.
const loadEnvFile = require('./utils/envUtil');
const envVariables = loadEnvFile('./.env');

const app = express();
const PORT = envVariables.PORT || 65534;  // Adjust the PORT if needed (e.g., if you encounter a "port already occupied" error)

// Middleware setup
app.use(express.static('public'));  // Serve static files from the 'public' directory
app.use(express.json());             // Parse incoming JSON payloads

// If you prefer some other file as default page other than 'index.html',
//      you can adjust and use the bellow line of code to
//      route to send 'DEFAULT_FILE_NAME.html' as default for root URL
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/DEFAULT_FILE_NAME.html');
// });

app.use(cookieParser());
// mount the router
// app.use('/', appController);
app.use('/users', userController);
app.use('/org', orgController);
app.use('/fund', fundController);
app.use('/indFund', indFundController);
app.use('/orgFund', orgFundController);
app.use('/transactions', transactionController);


// ----------------------------------------------------------
// Starting the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

