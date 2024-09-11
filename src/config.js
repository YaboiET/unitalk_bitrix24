// src/config.js

module.exports = {
    unitalk: {
        apiUrl: 'https://api.unitalk.cloud/api', // Unitalk API base URL
        apiKey: process.env.UNITALK_API_KEY,      // Unitalk API key from .env
        webhookUrl: process.env.UNITALK_WEBHOOK_URL || 'http://localhost:3000/webhooks/unitalk', // URL for Unitalk webhooks (default to localhost for development)
            // autodialerId: 'YOUR_UNITALK_AUTODIALER_ID' // We'll handle autodialer IDs dynamically later
    },
    bitrix24: {
        clientId: process.env.BITRIX24_CLIENT_ID || '', // pulls client id
        clientSecret: process.env.BITRIX24_CLIENT_SECRET || '', // use if needed otherwise null
        redirectUri: process.env.BITRIX24_REDIRECT_URI || 'http://localhost:3000/callback', // only use this for development
        apiUrl: 'https://obscrm.bitrix24.com/rest/', // Bitrix24 Domain Name / Rest / apisecret goes in next as a header usually
        webhookSecret: process.env.BITRIX24_WEBHOOK_SECRET || null, // If using webhook secret for verification
        driveFolderId: '418092'  // Your Bitrix24 Drive folder ID for data storage
    }
};

