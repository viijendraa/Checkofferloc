# Checkofferloc - Offer Location Checker

This application checks user locations for offer validation.

## Features

- 📍 **Location Detection**: Captures user's geographical coordinates
- 💾 **Location Storage**: Saves location data to `locations.json`
- 🔐 **Privacy-First**: Requests user permission before accessing location
- 📱 **Mobile Friendly**: Works on all devices with geolocation support

## Files

- `index.html` - Main user interface with "Check My Offers" button
- `locations.json` - Stores all captured location data
- `server.js` - Backend server (optional, for API endpoint)

## How to Use

1. Visit the GitHub Pages URL: `https://viijendraa.github.io/Checkofferloc/`
2. Click "Check My Offers" button
3. Allow location access when prompted by your browser
4. Your location will be captured and saved

## Data Stored

Each location entry contains:
- Latitude
- Longitude
- Timestamp (ISO format)
- User Agent

## Setup Instructions

### Enable GitHub Pages:
1. Go to Settings → Pages
2. Choose "Deploy from a branch"
3. Select "main" branch
4. Your site will be available at: `https://viijendraa.github.io/Checkofferloc/`

### Optional: Backend Setup
To automatically save locations to the repository, set up a backend server with the `/api/save-location` endpoint.

## Browser Compatibility

Works on all modern browsers that support:
- Geolocation API
- Fetch API
- ES6 JavaScript

## License

Public Repository
