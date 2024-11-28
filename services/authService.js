
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const loadEnvFile = require('../utils/envUtil');

const envVariables = loadEnvFile('./.env');

const oracledb = require('oracledb');
const { withOracleDB } = require('./userService'); // Assuming db.js contains your withOracleDB function

// Signup Handler
exports.signup = async (req, res) => {
  const { email, name, phoneNumber, password } = req.body;

  try {
    // Check if user already exists
    const query = `SELECT COUNT(*) AS COUNT FROM Users WHERE Email = :email`;
    const result = await withOracleDB(async (connection) => {
      const { rows } = await connection.execute(query, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return rows[0].COUNT;
    });

    if (result > 0) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert the new user
    const insertQuery = `
      INSERT INTO Users (Email, Name, PhoneNumber, Password)
      VALUES (:email, :name, :phoneNumber, :password)
    `;
    await withOracleDB(async (connection) => {
      await connection.execute(insertQuery, [email, name, phoneNumber, hashedPassword], { autoCommit: true });
    });

    // Create a JWT token
    const token = jwt.sign({ id: email }, envVariables.JWT_SECRET, {
      expiresIn: envVariables.JWT_EXPIRES_IN || '30d',
    });

    // Set the token in a cookie (optional)
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day expiration
      httpOnly: true, // Can't be accessed by JavaScript
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Login Handler
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Query to find the user by email
    const query = `SELECT Email, Password FROM Users WHERE Email = :email`;
    const user = await withOracleDB(async (connection) => {
      const { rows } = await connection.execute(query, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return rows[0]; // Return the first user (or undefined if not found)
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password with hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.PASSWORD);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign({ id: email }, envVariables.JWT_SECRET, {
      expiresIn: envVariables.JWT_EXPIRES_IN || '1d',
    });

    // Set the token in a cookie (optional)
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
      httpOnly: true, // Can't be accessed by JavaScript
    });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Protect middleware
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Check if a token exists
  if (!token) {
    return res.status(401).json({ message: 'You are not logged in!' });
  }

  try {
    // Validate the token
    const decoded = jwt.verify(token, envVariables.JWT_SECRET);

    // Query the database to find the user by the email (decoded.id)
    const query = `SELECT Email, Name FROM Users WHERE Email = :email`;

    const user = await withOracleDB(async (connection) => {
      const { rows } = await connection.execute(query, [decoded.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return rows[0]; // Return the user or undefined if not found
    });

    const orgQuery = `SELECT Email, Name FROM VolunteerOrganization WHERE Email = :email`;
    const org = await withOracleDB(async (connection) => {
      const {rows }  = await connection.execute(orgQuery, [decoded.id], { outFormat: oracledb.OUT_FORMAT_OBJECT});
      return rows[0];
    });


    // Check if the user exists in the database
    if (!user && !org) {
      return res.status(404).json({ message: 'User/Org no longer exists' });
    }

    // Attach the user to the request object and pass it to the next middleware
    req.user = user;
    req.org = org;
    // res.locals.user = req.user;

    next();
  } catch (err) {
    console.error('Error validating token:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Organization Login Handler
exports.organizationLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query to find the organization by email
    const query = `SELECT Email, Password FROM VolunteerOrganization WHERE Email = :email`;
    const organization = await withOracleDB(async (connection) => {
      const { rows } = await connection.execute(query, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return rows[0]; // Return the first organization (or undefined if not found)
    });

    if (!organization) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password with hashed password stored in the database
    const isMatch = await bcrypt.compare(password, organization.PASSWORD);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign({ id: email, type: 'organization' }, envVariables.JWT_SECRET, {
      expiresIn: envVariables.JWT_EXPIRES_IN || '1d',
    });

    // Set the token in a cookie (optional)
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
      httpOnly: true, // Can't be accessed by JavaScript
    });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Organization Signup Handler
exports.organizationSignup = async (req, res) => {
  const { email, password, name, field, address, verification } = req.body;

  try {
    // Check if organization already exists
    const query = `SELECT COUNT(*) AS COUNT FROM VolunteerOrganization WHERE Email = :email`;
    const result = await withOracleDB(async (connection) => {
      const { rows } = await connection.execute(query, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return rows[0].COUNT;
    });

    if (result > 0) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert the new organization
    const insertQuery = `
      INSERT INTO VolunteerOrganization (Email, Password, Name, Field, Address, Verification)
      VALUES (:email, :password, :name, :field, :address, :verification)
    `;
    await withOracleDB(async (connection) => {
      await connection.execute(insertQuery, [email, hashedPassword, name, field, address, verification], { autoCommit: true });
    });

    // Create a JWT token
    const token = jwt.sign({ id: email, type: 'organization' }, envVariables.JWT_SECRET, {
      expiresIn: envVariables.JWT_EXPIRES_IN || '30d',
    });

    // Set the token in a cookie (optional)
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day expiration
      httpOnly: true, // Can't be accessed by JavaScript
    });

    res.status(201).json({
      message: 'Organization created successfully',
      token,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


