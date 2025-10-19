// Foursquare Places API Proxy
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// API Key validation
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;
if (!FOURSQUARE_API_KEY) {
  console.error('ERROR: FOURSQUARE_API_KEY environment variable is required');
  process.exit(1);
}


app.use(cors());

app.get('/api/foursquare', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'query param required' });
  try {
    const url = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&limit=10&fields=fsq_id,name,location,categories,description`;
    const resp = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': FOURSQUARE_API_KEY
      }
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Foursquare proxy listening on port ${PORT}`);
}); 