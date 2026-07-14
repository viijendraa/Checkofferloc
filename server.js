const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple authentication setup
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'checkofferloc2024';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

// Path to locations.json file
const locationsFilePath = path.join(__dirname, 'locations.json');

// Initialize locations file if it doesn't exist
function initializeLocationsFile() {
  if (!fs.existsSync(locationsFilePath)) {
    fs.writeFileSync(locationsFilePath, JSON.stringify({ locations: [] }, null, 2));
    console.log('✓ Created locations.json file');
  }
}

// Read locations from file
function readLocations() {
  try {
    if (fs.existsSync(locationsFilePath)) {
      const data = fs.readFileSync(locationsFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading locations file:', error);
  }
  return { locations: [] };
}

// Write locations to file
function writeLocations(data) {
  try {
    fs.writeFileSync(locationsFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✓ Locations saved to file');
    return true;
  } catch (error) {
    console.error('Error writing locations file:', error);
    return false;
  }
}

let sessions = {}; // Store session tokens

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Helper function to generate token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login first.'
    });
  }

  if (!sessions[token]) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }

  req.token = token;
  next();
}

// Login endpoint
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = generateToken();
      sessions[token] = {
        username: username,
        loginTime: new Date().toISOString()
      };

      console.log(`✓ User ${username} logged in successfully`);

      res.json({
        success: true,
        message: 'Login successful',
        token: token
      });
    } else {
      console.warn(`✗ Failed login attempt with username: ${username}`);
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// Logout endpoint
app.post('/api/logout', authenticateToken, (req, res) => {
  try {
    delete sessions[req.token];
    console.log('✓ User logged out successfully');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
});

// API endpoint to save location (NO authentication required)
app.post('/api/save-location', (req, res) => {
  try {
    const { latitude, longitude, timestamp, userAgent, address, city, country } = req.body;

    // Validate required fields
    if (!latitude || !longitude || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: latitude, longitude, timestamp'
      });
    }

    // Read current locations
    let locationsData = readLocations();

    // Create new location entry with address details
    const newLocation = {
      id: locationsData.locations.length + 1,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: timestamp,
      userAgent: userAgent || 'Unknown',
      address: address || 'Address not found',
      city: city || 'N/A',
      country: country || 'N/A',
      savedAt: new Date().toISOString()
    };

    // Add to locations array
    locationsData.locations.push(newLocation);

    // Write to file
    const success = writeLocations(locationsData);

    if (success) {
      console.log('✓ Location saved with address:', newLocation);
      res.json({
        success: true,
        message: 'Location saved successfully',
        data: newLocation,
        totalLocations: locationsData.locations.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error saving location to file'
      });
    }
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving location',
      error: error.message
    });
  }
});

// API endpoint to get all locations (REQUIRES AUTHENTICATION)
app.get('/api/locations', authenticateToken, (req, res) => {
  try {
    const locationsData = readLocations();
    console.log(`✓ Authenticated user fetching locations - Total: ${locationsData.locations.length}`);
    res.json(locationsData);
  } catch (error) {
    console.error('Error reading locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading locations',
      error: error.message
    });
  }
});

// Debug endpoint (REQUIRES AUTHENTICATION)
app.get('/api/debug', authenticateToken, (req, res) => {
  try {
    const locationsData = readLocations();
    res.json({
      status: 'Server is running',
      totalLocations: locationsData.locations.length,
      locations: locationsData.locations,
      timestamp: new Date().toISOString(),
      filePath: locationsFilePath,
      fileExists: fs.existsSync(locationsFilePath)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in debug endpoint',
      error: error.message
    });
  }
});

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Verify token endpoint
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: sessions[req.token]
  });
});

// Start server
app.listen(PORT, () => {
  // Initialize locations file
  initializeLocationsFile();

  console.log(`✓ Checkofferloc server running on port ${PORT}`);
  console.log(`✓ Locations file path: ${locationsFilePath}`);
  console.log(`✓ API endpoints:`);
  console.log(`  - POST /api/login - Login with username and password`);
  console.log(`  - POST /api/logout - Logout (requires token)`);
  console.log(`  - POST /api/save-location - Save a location with address`);
  console.log(`  - GET /api/locations - Get all locations (requires authentication)`);
  console.log(`  - GET /api/debug - Debug information (requires authentication)`);
  console.log(`  - GET /api/health - Health check`);
  console.log(`  - GET /api/verify-token - Verify token (requires authentication)`);
  console.log(`\n⚠️  IMPORTANT: Change ADMIN_PASSWORD environment variable in production!`);
  console.log(`   Default credentials: username=admin, password=checkofferloc2024`);
});
