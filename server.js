const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (will persist during session on Render)
let locationsData = {
  locations: []
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API endpoint to save location
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

    console.log('✓ Location saved with address:', newLocation);
    console.log(`✓ Total locations saved this session: ${locationsData.locations.length}`);

    res.json({
      success: true,
      message: 'Location saved successfully',
      data: newLocation,
      totalLocations: locationsData.locations.length
    });
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving location',
      error: error.message
    });
  }
});

// API endpoint to get all locations
app.get('/api/locations', (req, res) => {
  try {
    console.log(`Fetching locations - Total: ${locationsData.locations.length}`);
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

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'Server is running',
    totalLocations: locationsData.locations.length,
    locations: locationsData.locations,
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Checkofferloc server running on port ${PORT}`);
  console.log(`✓ API endpoints:`);
  console.log(`  - POST /api/save-location - Save a location with address`);
  console.log(`  - GET /api/locations - Get all locations`);
  console.log(`  - GET /api/debug - Debug information`);
  console.log(`  - GET /api/health - Health check`);
});
