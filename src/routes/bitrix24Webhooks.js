const express = require('express');
const router = express.Router();
const config = require('../config');
const unitalkService = require('../services/unitalkApi');
const bitrix24Service = require('../services/bitrix24Api');

// Bitrix24 webhook endpoint
router.post('/webhooks/bitrix24', async (req, res) => {
  const webhookData = req.body;

  // Process Bitrix24 webhook data here
  console.log('Received Bitrix24 webhook:', webhookData);

  try {
    // Handle different Bitrix24 events
    switch (webhookData.event) {
      case 'ONVOXIMPLANTCALLSTART':
        handleOnVoximplantCallStart(webhookData);
        break;
      case 'ONVOXIMPLANTCALLEND':
        handleOnVoximplantCallEnd(webhookData);
        break;
      // Add more cases for other Bitrix24 events as needed
      // Example:
      // case 'ONCRMDEALUPDATE':
      //   handleOnCrmDealUpdate(webhookData);
      //   break;
      default:
        console.log('Unhandled Bitrix24 event:', webhookData.event);
    }


    res.sendStatus(200);

  } catch (error) {
    console.error('Error processing Bitrix24 webhook:', error);
    // More specific error handling (you might want to adjust this based on your requirements)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      const errorMessage = data.error_description || 'An unknown error occurred.';
      console.error('Bitrix24 API error in webhook handler:', status, errorMessage);
      // Potentially retry the operation or notify relevant stakeholders
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from Bitrix24 API in webhook handler:', error.request);
      // Potentially retry the operation or notify relevant stakeholders
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error in Bitrix24 webhook handler:', error.message);
      // Log the error or take other appropriate action
    }

    res.sendStatus(500); 
  }
});

// Handler for ONVOXIMPLANTCALLSTART event
async function handleOnVoximplantCallStart(webhookData) {
  const userId = webhookData.data.USER_ID;

  try {
    // Update agent status in Unitalk to "Busy" 
    await unitalkService.updateAgentStatus(userId, 'PAUS'); 

  } catch (error) {
    // Handle error (log, notify, etc.)
    console.error('Error in handleOnVoximplantCallStart:', error);
  }
}

// Handler for ONVOXIMPLANTCALLEND event
async function handleOnVoximplantCallEnd(webhookData) {
  const userId = webhookData.data.USER_ID;

  try {
    // Check if the agent is still clocked in in Bitrix24
    const isClockedIn = await bitrix24Service.isAgentClockedIn(userId);

    if (isClockedIn) {
      // Update agent status in Unitalk to "Available"
      await unitalkService.updateAgentStatus(userId, 'WORK');
    }

  } catch (error) {
    // Handle error
    console.error('Error in handleOnVoximplantCallEnd:', error);
  }
}

// Placeholder for handling other Bitrix24 events
// async function handleOnCrmDealUpdate(webhookData) {
//   // ... your logic to handle CRM deal updates
// }

module.exports = router;