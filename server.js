const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Path to locations.json
const locationsFilePath = path.join(__dirname, 'locations.json');

// API endpoint to save location
app.post('/api/save-location', (req, res) => {
  try {
    const { latitude, longitude, timestamp, userAgent } = req.body;

    // Validate required fields
    if (!latitude || !longitude || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: latitude, longitude, timestamp'
      });
    }

    // Read existing locations
    let locationsData = { locations: [] };
    if (fs.existsSync(locationsFilePath)) {
      const fileContent = fs.readFileSync(locationsFilePath, 'utf8');
      locationsData = JSON.parse(fileContent);
    }

    // Create new location entry
    const newLocation = {
      id: locationsData.locations.length + 1,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: timestamp,
      userAgent: userAgent || 'Unknown',
      savedAt: new Date().toISOString()
    };

    // Add to locations array
    locationsData.locations.push(newLocation);

    // Write back to file
    fs.writeFileSync(
      locationsFilePath,
      JSON.stringify(locationsData, null, 2)
    );

    console.log('Location saved:', newLocation);

    res.json({
      success: true,
      message: 'Location saved successfully',
      data: newLocation
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
    if (fs.existsSync(locationsFilePath)) {
      const fileContent = fs.readFileSync(locationsFilePath, 'utf8');
      const locationsData = JSON.parse(fileContent);
      res.json(locationsData);
    } else {
      res.json({ locations: [] });
    }
  } catch (error) {
    console.error('Error reading locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading locations',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Checkofferloc server running on http://localhost:${PORT}`);
  console.log('Location data will be saved to locations.json');
});
