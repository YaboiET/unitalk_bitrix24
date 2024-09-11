const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const FormData = require('form-data'); // Add this line

app.use(bodyParser.json()); // Parse JSON request bodies

// Load environment variables
require('dotenv').config();

// Bitrix24 OAuth 2.0 configuration
const BITRIX24_CLIENT_ID = process.env.BITRIX24_CLIENT_ID;
const BITRIX24_CLIENT_SECRET = process.env.BITRIX24_CLIENT_SECRET;
const BITRIX24_REDIRECT_URI = 'http://localhost:3000/callback'; // Update with your actual callback URL

// In-memory storage for access token (for now, consider a database for production)
let accessToken = null;

// Function to exchange authorization code for access token
async function getAccessToken(code) {
  try {
    const response = await axios.post('https://oauth.bitrix.info/oauth/token/', {
      grant_type: 'authorization_code',
      client_id: BITRIX24_CLIENT_ID,
      client_secret: BITRIX24_CLIENT_SECRET,
      code: code,
      redirect_uri: BITRIX24_REDIRECT_URI
    });

    return response.data.access_token; 

  } catch (error) {
    console.error('Error getting access token:', error);
    throw error; 
  }
}

// Route to initiate OAuth flow
app.get('/auth/bitrix24', (req, res) => {
  const authUrl = `https://oauth.bitrix.info/oauth/authorize/?
    client_id=${BITRIX24_CLIENT_ID}
    &response_type=code
    &redirect_uri=${BITRIX24_REDIRECT_URI}`;

  res.redirect(authUrl);
});

// Callback route to handle authorization code and get access token
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    // Handle the case where the authorization code is missing
    console.error('Authorization code is missing');
    return res.status(400).send('Authorization code is required');
  }

  try {
    accessToken = await getAccessToken(code); // TODO: Implement persistent access token storage (e.g., in a database) for production use


    console.log('Access token obtained:', accessToken);
    res.send('Authentication successful! You can close this window now.');

  } catch (error) {
    console.error('Error during authentication:', error);

    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      const errorMessage = data.error_description || 'An unknown error occurred.';
      console.error('Bitrix24 API error:', status, errorMessage);
      res.status(500).send(`Bitrix24 API error: ${errorMessage}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from Bitrix24 API:', error.request);
      res.status(500).send('No response from Bitrix24 API. Please try again later.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up Bitrix24 API request:', error.message);
      res.status(500).send('An error occurred during authentication. Please try again.');
    }
  }
});

const unitalkWebhookRoutes = require('./src/routes/unitalkWebhooks');
const bitrix24WebhookRoutes = require('./src/routes/bitrix24Webhooks');

app.use('/', unitalkWebhookRoutes);
app.use('/', bitrix24WebhookRoutes);

// ... other routes and webhook handlers will be added later

app.listen(port, () => {
  console.log(`Integration server listening on port ${port}`);
});