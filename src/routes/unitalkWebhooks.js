const express = require('express');
const router = express.Router();
const config = require('../config');
const bitrix24Service = require('../services/bitrix24Api');
const dataService = require('../services/data'); 
const axios = require('axios');

// Unitalk webhook endpoint
router.post('/webhooks/unitalk', async (req, res) => {
  const webhookData = req.body;

  // Process Unitalk webhook data here
  console.log('Received Unitalk webhook:', webhookData);
} catch (error) {
  logger.error('Error processing Unitalk webhook:', { error }); // Use logger.error here
  res.sendStatus(500); 
}
});
  
  try {
    // Handle different Unitalk events
    switch (webhookData.event) {
      case 'onCallCreated':
        await handleOnCallCreated(webhookData);
        break;
      case 'onCallAnswered':
      } catch (error) {
        logger.error('Error in handleOnCallCreated:', { error }); // Use logger.error here
      }
    }
        await handleOnCallAnswered(webhookData);
        break;
      case 'onCallEnded':
      } catch (error) {
        logger.error('Error in handleOnCallAnswered:', { error }); // Use logger.error here
      }
    }
        await handleOnCallEnded(webhookData);
        break;
      case 'onCallRecordingFinished':
      } catch (error) {
        logger.error('Error in handleOnCallEnded:', { error }); // Use logger.error here
      }
    }
        await handleOnCallRecordingFinished(webhookData);
        break;

      } catch (error) {
        logger.error('Error in handleOnCallRecordingFinished:', { error }); // Use logger.error here
      }
    }
      // Add more cases for other Unitalk events as needed
      default:
        console.log('Unhandled Unitalk event:', webhookData.event);
    }

    res.sendStatus(200); // Acknowledge webhook receipt

  } catch (error) {
    console.error('Error processing Unitalk webhook:', error);
    res.sendStatus(500); // Indicate an error occurred
  }
});

// Handler for onCallCreated event
async function handleOnCallCreated(webhookData) {
  const phoneNumber = webhookData.call.to[0];
  const unitalkCallId = webhookData.call.id;
  const autodialerId = webhookData.autodialerId; // Make sure this field exists in the webhook payload

  // Retrieve lead ID from webhook data (adjust this based on your actual Unitalk payload structure)
  const leadId = webhookData.call.meta; // Assuming 'meta' field contains the lead ID. 

  try {
    // Initiate call in Bitrix24 
    const bitrix24CallId = await bitrix24Service.initiateBitrix24Call(phoneNumber, leadId, autodialerId);

    // Store the association between Unitalk and Bitrix24 call IDs
    await dataService.storeCallAssociation(unitalkCallId, bitrix24CallId, autodialerId);

  } catch (error) {
    // Handle error (log, notify, etc.)
    console.error('Error in handleOnCallCreated:', error);
  }
}

// Handler for onCallAnswered event
async function handleOnCallAnswered(webhookData) {
  const unitalkCallId = webhookData.call.id;
  const startTime = new Date(webhookData.call.date); 
  const callerId = webhookData.call.from;
  const outerNumber = webhookData.call.outerNumber;
  const direction = webhookData.call.direction;
  const callId = webhookData.call.callId; 
  const uniqueId = webhookData.call.uniqueId;
  const callerIdName = webhookData.call.callerIdName;


  // Capture additional relevant data from the webhook 
  const utmSource = webhookData.call.utmSource;
  const utmMedium = webhookData.call.utmMedium;
  const utmCampaign = webhookData.call.utmCampaign;
  // ... capture other UTM parameters or relevant data as needed

  try {
    // Retrieve Bitrix24 call ID and autodialer ID using Unitalk call ID from storage
    const { bitrix24CallId, autodialerId } = await dataService.getBitrix24CallData(unitalkCallId);

    // Update CRM record in Bitrix24 
    await bitrix24Service.updateCrmRecord(bitrix24CallId, { 
      callAnswered: true, 
      callStartTime: startTime.toISOString(), 
      callerId: callerId,
      utmSource, 
      utmMedium,
      utmCampaign
      // ... add other relevant fields to update in Bitrix24 CRM 
    });

    // Store call details in Bitrix24 Drive for reporting
    await dataService.storeCallDetails(unitalkCallId, { 
      startTime: startTime.toISOString(),
      callerId, 
      outerNumber,
      direction,
      callAnswered: true,
      bitrix24CallId,
      autodialerId,
      utmSource, 
      utmMedium,
      utmCampaign
      callId, 
      uniqueId,
      callerIdName
      // ... store other captured data
    });

    // Log detailed information about the answered call
    logger.info('Unitalk call answered', {
      unitalkCallId,
      bitrix24CallId,
      autodialerId,
      startTime,
      callerId,
      outerNumber,
      direction,
      // ... other captured data
    });

  } catch (error) {
    // Handle error (log, notify, etc.)
    console.error('Error in handleOnCallAnswered:', error);
  }
}

// Handler for onCallEnded event
async function handleOnCallEnded(webhookData) {
  const unitalkCallId = webhookData.call.id;
  const endTime = new Date().toISOString(); 
  const duration = webhookData.call.secondsFullTime;
  const talkTime = webhookData.call.secondsTalk;
  const callState = webhookData.call.state;
  // ... extract other relevant data as needed (e.g., disposition from native connector if available)

  try {
    // Retrieve Bitrix24 call ID and autodialer ID 
    const { bitrix24CallId, autodialerId } = await dataService.getBitrix24CallData(unitalkCallId);

    // Fetch additional call data from Unitalk (including queue time)
    const additionalCallData = await unitalkService.getAdditionalCallDataFromUnitalk(unitalkCallId);

    // Prepare data to update CRM record
    const crmUpdateData = {
      callEnded: true,
      duration,
      talkTime,
      endTime: endTime,
      // ... other relevant data from webhook or additionalCallData
    };

    // Map Unitalk's callState to your Bitrix24 disposition if not handled by the native connector
    if (!webhookData.call.disposition) { 
      crmUpdateData.disposition = mapCallStateToDisposition(callState);
    } else {
      crmUpdateData.disposition = webhookData.call.disposition; 
    }

    // Update CRM record in Bitrix24 
    await bitrix24Service.updateCrmRecord(bitrix24CallId, crmUpdateData);

    // If AMD detected an answering machine, trigger automation to update lead stage/disposition
    if (callState === 'ANSWERING_MACHINE') { 
      // Trigger Bitrix24 automation (replace 'YOUR_AUTOMATION_ID' with the actual automation ID)
      await bitrix24Service.triggerAutomation(config.bitrix24.automationId, { 
        callId: bitrix24CallId,
        // ... other relevant data you want to pass to the automation
      });
    }

    // Store final call details in Bitrix24 Drive
    await dataService.storeCallDetails(unitalkCallId, { 
      ...crmUpdateData, 
      ...additionalCallData,
      bitrix24CallId, 
      autodialerId 
    });

    // Log detailed information about the ended call
    logger.info('Unitalk call ended', {
      unitalkCallId,
      bitrix24CallId,
      autodialerId,
      endTime,
      duration,
      talkTime,
      callState,
      disposition: crmUpdateData.disposition,
      // ... other captured or calculated data
    });

  } catch (error) {
    // Handle error (log, notify, etc.)
    console.error('Error in handleOnCallEnded:', error);
  }
}

// Handler for onCallRecordingFinished event
async function handleOnCallRecordingFinished(webhookData) {
  // Extract Bitrix24 call ID directly from the webhook payload
  const bitrix24CallId = webhookData.CALL_ID; // Adjust this based on the actual field name in the Bitrix24 webhook
  const recordingUrl = webhookData.RECORD_URL; // Adjust this based on the actual field name

  try {
    // Store recording URL in Bitrix24 Drive and associate it with the CRM record
    await dataService.storeCallRecording(bitrix24CallId, recordingUrl);

  } catch (error) {
    // Handle error
    console.error('Error in handleOnCallRecordingFinished:', error);
  }
}

// Function to get additional call data from Unitalk (including queue time)
async function getAdditionalCallDataFromUnitalk(unitalkCallId) {
  try {
    // Construct the Unitalk API URL
    const apiUrl = `${config.unitalk.apiUrl}/autodial/action`;

    // Prepare the request payload
    const payload = {
      action: 'GET_CALLS_HISTORY',
      id: config.unitalk.autodialerId, 
      callHistoryRequest: {
        filter: {
          // Add any necessary filters here if you want to narrow down the results
          // For example to get data for a specific call ID
          id: [unitalkCallId]
        }
      }
    };

    // Make the API call using axios
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${config.unitalk.apiKey}`
      }
    });

    // Extract queue time and other relevant data from the response
    const callData = response.data.items.find(item => item.id === unitalkCallId);
    if (callData) {
      return {
        queueTime: callData.secondsClientWaitOperator || 0, 
        // ... other relevant data you want to capture
      };
    } else {
      console.warn('Call data not found in Unitalk response:', unitalkCallId);
      return {};
    }

  } catch (error) {
    console.error('Error getting additional call data from Unitalk:', error);
    throw error; 
  }
}

// Function to map Unitalk's callState to your Bitrix24 disposition
function mapCallStateToDisposition(callState, currentDisposition) {
  // Implement your mapping logic here, considering different scenarios
  switch (callState) {
    case 'ANSWER':
      // If the call is answered, let the agent handle the disposition update
      return currentDisposition; // Keep the existing disposition

    case 'NOANSWER':
    case 'BUSY':
    case 'ANSW_RJCT':
    case 'ANSW_NF_OP':
    case 'ANSW_OP_NA':
    case 'UNREACHABLE':
      // Handle "No Answer" scenarios, incrementing the attempt count if applicable
      if (currentDisposition && currentDisposition.startsWith('No Answer')) {
        const currentAttempt = parseInt(currentDisposition.slice(-1)); 
        const nextAttempt = Math.min(currentAttempt + 1, 6); 
        return `No Answer (${nextAttempt})`;
      } else {
        // If it's the first "No Answer" attempt, set it to "No Answer (1)"
        return 'No Answer (1)';
      }

    case 'ANSWERING_MACHINE':
      // Handle answering machine detection
      return 'No Answer (1)'; 

    case 'FAIL':
    case 'BUSYOUT':
    case 'AUDIO_ERR':
    case 'WRONG_DIR':
      // Handle technical issues - don't update the disposition, but log the issue
      logger.warn('Technical issue during call', { unitalkCallId, callState });
      return currentDisposition || null; // Keep the existing disposition or return null if there's none

    case 'CLIENT_CALLED':
      // Handle inbound or callback calls
      return 'Callback'; // Or adjust based on your process

    case 'CANCEL':
    case 'AUTOCANCEL':
      // Handle canceled calls
      return 'No Call Made';

    case 'NOT_EXIST':
      // Handle disconnected numbers
      return 'Broken';

    // Add more cases for other callState values as needed
    default:
      return currentDisposition;
  }
}

module.exports = router;