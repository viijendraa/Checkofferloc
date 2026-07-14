const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// GitHub Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'viijendraa';
const GITHUB_REPO = 'Checkofferloc';
const GITHUB_BRANCH = 'main';

// Path to locations.json
const locationsFilePath = path.join(__dirname, 'locations.json');

// Function to update file in GitHub
function updateGitHubFile(content, message) {
  return new Promise((resolve, reject) => {
    if (!GITHUB_TOKEN) {
      console.warn('GitHub token not configured. File will be saved locally only.');
      return resolve({
        success: true,
        message: 'Location saved locally (GitHub sync disabled)',
        source: 'local'
      });
    }

    // Get current file SHA
    const getOptions = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/locations.json?ref=${GITHUB_BRANCH}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Checkofferloc-Server',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.request(getOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const fileData = JSON.parse(data);
          const currentSha = fileData.sha;

          // Prepare update payload
          const updateOptions = {
            hostname: 'api.github.com',
            path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/locations.json`,
            method: 'PUT',
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'User-Agent': 'Checkofferloc-Server',
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            }
          };

          const payload = {
            message: message,
            content: Buffer.from(content).toString('base64'),
            sha: currentSha,
            branch: GITHUB_BRANCH
          };

          const req = https.request(updateOptions, (res) => {
            let updateData = '';
            res.on('data', chunk => updateData += chunk);
            res.on('end', () => {
              if (res.statusCode === 200 || res.statusCode === 201) {
                console.log('✓ File updated on GitHub');
                resolve({
                  success: true,
                  message: 'Location saved to GitHub',
                  source: 'github'
                });
              } else {
                console.error('GitHub update failed:', updateData);
                resolve({
                  success: true,
                  message: 'Location saved locally (GitHub sync failed)',
                  source: 'local'
                });
              }
            });
          });

          req.on('error', err => {
            console.error('Error updating GitHub:', err);
            resolve({
              success: true,
              message: 'Location saved locally',
              source: 'local'
            });
          });

          req.write(JSON.stringify(payload));
          req.end();
        } catch (err) {
          console.error('Error parsing GitHub response:', err);
          resolve({
            success: true,
            message: 'Location saved locally',
            source: 'local'
          });
        }
      });
    }).on('error', err => {
      console.error('Error getting file from GitHub:', err);
      resolve({
        success: true,
        message: 'Location saved locally',
        source: 'local'
      });
    }).end();
  });
}

// API endpoint to save location
app.post('/api/save-location', async (req, res) => {
  try {
    const { latitude, longitude, timestamp, userAgent } = req.body;

    // Validate required fields
    if (!latitude || !longitude || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: latitude, longitude, timestamp'
      });
    }

    // Read existing locations from GitHub or local file
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

    // Save to local file
    fs.writeFileSync(
      locationsFilePath,
      JSON.stringify(locationsData, null, 2)
    );

    console.log('Location saved locally:', newLocation);

    // Update on GitHub
    const githubResult = await updateGitHubFile(
      JSON.stringify(locationsData, null, 2),
      `Add location data: ${newLocation.latitude}, ${newLocation.longitude}`
    );

    res.json({
      success: true,
      message: 'Location saved successfully',
      data: newLocation,
      github: githubResult.source
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
  console.log(`✓ Checkofferloc server running on http://localhost:${PORT}`);
  console.log('Location data will be saved to locations.json');
  if (GITHUB_TOKEN) {
    console.log('✓ GitHub integration enabled - updates will be pushed to repository');
  } else {
    console.log('⚠ GitHub integration disabled - set GITHUB_TOKEN environment variable to enable');
  }
});
