# Checkofferloc - Offer Location Checker

This application checks user locations for offer validation.

## Features

- 📍 **Location Detection**: Captures user's geographical coordinates
- 💾 **Location Storage**: Saves location data to `locations.json`
- 🔐 **Privacy-First**: Requests user permission before accessing location
- 📱 **Mobile Friendly**: Works on all devices with geolocation support
- ⚡ **Real-time API**: Backend server saves locations automatically

## Files

- `index.html` - Main user interface with "Check My Offers" button
- `locations.json` - Stores all captured location data
- `server.js` - Express backend server for saving locations
- `package.json` - Node.js dependencies

## How to Use

### Option 1: Local Development (Recommended for testing)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   Or with auto-restart:
   ```bash
   npm run dev
   ```

3. **Visit the application:**
   ```
   http://localhost:3000
   ```

4. **Click "Check My Offers"**
   - Allow location access when prompted
   - Location will be saved to `locations.json` automatically

### Option 2: GitHub Pages (Static hosting)

1. Go to Settings → Pages
2. Choose "Deploy from a branch"
3. Select "main" branch
4. Your site will be available at: `https://viijendraa.github.io/Checkofferloc/`

⚠️ **Note:** GitHub Pages is static hosting, so the backend won't run there. Use Option 1 for location saving functionality.

## Data Structure

When a location is saved, `locations.json` will contain:

```json
{
  "locations": [
    {
      "id": 1,
      "latitude": 28.7041,
      "longitude": 77.1025,
      "timestamp": "2026-07-14T05:10:34.123Z",
      "userAgent": "Mozilla/5.0...",
      "savedAt": "2026-07-14T05:10:34.567Z"
    }
  ]
}
```

## API Endpoints

### Save Location
- **POST** `/api/save-location`
- **Body:**
  ```json
  {
    "latitude": 28.7041,
    "longitude": 77.1025,
    "timestamp": "2026-07-14T05:10:34.123Z",
    "userAgent": "Mozilla/5.0..."
  }
  ```

### Get All Locations
- **GET** `/api/locations`
- **Response:**
  ```json
  {
    "locations": [...]
  }
  ```

## Browser Compatibility

Works on all modern browsers that support:
- Geolocation API
- Fetch API
- ES6 JavaScript

## Troubleshooting

### Location not being saved?
1. Make sure the server is running (`npm start`)
2. Check browser console for errors (F12)
3. Verify location permission is allowed in browser settings
4. Check that `locations.json` file exists in the project root

### "Location permission denied" error?
- Enable location access in your browser settings
- Reload the page and try again

## Deployment

### Deploy to Heroku, Railway, or Render:

1. Push to GitHub
2. Connect your repository to the hosting platform
3. Set `npm start` as the startup command
4. The server will start automatically and locations will be saved

## License

Public Repository
