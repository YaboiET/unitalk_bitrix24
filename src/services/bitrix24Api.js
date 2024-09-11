const axios = require('axios');
const config = require('../config');

// Function to initiate a call in Bitrix24
async function initiateBitrix24Call(phoneNumber, leadId, autodialerId) {
  try {
    // Construct the Bitrix24 API URL
    const apiUrl = `${config.bitrix24.apiUrl}telephony.externalcall.register`;

    // Get the queue ID for the given autodialer
    const queueId = await getQueueIdForAutodialer(autodialerId);

    // Prepare the request payload
    const payload = {
      PHONE_NUMBER: phoneNumber,
      CRM_ENTITY_TYPE: 'LEAD',
      CRM_ENTITY_ID: leadId,
      LINE_NUMBER: 'YOUR_AUSTRALIAN_VOXIMPLANT_NUMBER', // Replace with your actual Voximplant number
      TYPE: 'SIP',
      SHOW: 'Y',
      QUEUE_ID: queueId 
    };

    // Make the API call using axios
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}` 
      }
    });

    // Handle the API response
    if (response.data.result) {
      console.log('Bitrix24 call initiated successfully:', response.data.result);
      return response.data.result; // Return the Bitrix24 call ID
    } else {
      console.error('Error initiating Bitrix24 call:', response.data.error);

      // More specific error handling based on Bitrix24 API response codes
      if (response.status === 400) {
        throw new Error('Bitrix24 API: Bad Request. Check your parameters.');
      } else if (response.status === 401) {
        // Handle unauthorized access (potentially retry after refreshing the token)
        // ... (implementation will depend on your token refresh logic)
        throw new Error('Bitrix24 API: Unauthorized. Token might be invalid or expired.');
      } else if (response.status === 403) {
        throw new Error('Bitrix24 API: Forbidden. Check your app permissions.');
      } else {
        throw new Error('Bitrix24 API Error: ' + response.data.error);
      }
    }

  } catch (error) {
    console.error('Error initiating Bitrix24 call:', error);
    throw error; 
  }
}

// Function to get agent's telephony status
async function getAgentTelephonyStatus(userId) {
  try {
    // Construct the Bitrix24 API URL
    const apiUrl = `${config.bitrix24.apiUrl}telephony.getstatus`;

    // Make the API call using axios
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}` 
      }
    });

    // Find the agent's line status in the response
    const agentLine = response.data.result.LINES.find(line => line.USER_ID === userId);
    if (agentLine) {
      return agentLine.STATUS;
    } else {
      console.warn('Agent not found in telephony status response:', userId);
      return null; // Or handle this case appropriately (e.g., assume offline)
    }

  } catch (error) {
    console.error('Error getting agent telephony status:', error);

    // More specific error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const  
 { status, data } = error.response;  

      const errorMessage = data.error_description || 'An unknown error occurred.';
      console.error('Bitrix24 API error:', status, errorMessage);
      throw new Error(`Bitrix24 API error: ${errorMessage}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from Bitrix24 API:', error.request);
      throw new Error('No response from Bitrix24 API. Please try again later.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up  
 Bitrix24 API request:', error.message);
      throw new Error('An error occurred while fetching telephony status.');
    }
  }
}

// Function to update CRM record (lead in this case)
async function updateCrmRecord(leadId, updateData) {
  try {
    // Construct the Bitrix24 API URL
    const apiUrl = `${config.bitrix24.apiUrl}crm.lead.update`;

    // Prepare the request payload
    const payload = {
      id: leadId,
      fields: updateData
    };

    // Make the API call using axios
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}` 
      }
    });

    // Handle the API response
    if (response.data.result) {
      console.log('CRM record (lead) updated successfully:', leadId); 
    } else {
      console.error('Error updating CRM record (lead):', leadId, response.data.error);

      // More specific error handling
      if (response.status === 400) {
        throw new Error('Bitrix24 API: Bad Request. Check your parameters.');
      } else if (response.status === 401) {
        // Handle unauthorized access (potentially retry after refreshing the token)
        // ... (implementation will depend on your token refresh logic)
        throw new Error('Bitrix24 API: Unauthorized. Token might be invalid or expired.');
      } else if (response.status === 403) {
        throw new Error('Bitrix24 API: Forbidden. Check your app permissions.');
      } else if (response.status === 404) {
        throw new Error('Bitrix24 API: Not Found. The CRM record might not exist.');
      } else {
        throw new Error('Bitrix24 API Error: ' + response.data.error);
      }
    }

  } catch (error) {
    console.error('Error updating CRM record (lead):', leadId, error);
    throw error;
  }
}

// Function to check if agent is clocked in (using timeman module)
async function isAgentClockedIn(userId) {
  try {
    // Construct the Bitrix24 API URL
    const apiUrl = `${config.bitrix24.apiUrl}timeman.status.current`;

    // Prepare the request parameters
    const params = {
      user_id: userId
    };

    // Make the API call using axios
    const response = await axios.get(apiUrl, {
      params: params,
      headers: {
        'Authorization': `Bearer ${accessToken}` 
      }
    });

    // Check the agent's status in the response
    const status = response.data.result.STATUS;
    return status === 'OPENED'; // Return true if clocked in, false otherwise

  } catch (error) {
    console.error('Error checking agent clock-in status:', error);
    // Handle the error appropriately (e.g., log it, retry, or return a default value)
    // For now, let's assume the agent is not clocked in if there's an error
    return false;
  }
}


// Placeholder functions for other Bitrix24 API interactions (add as needed)


/// Function to create a CRM activity (call log)
async function createCrmActivity(callData) {
  // ... (implementation will be added later based on your CRM structure and requirements)
  console.log('Creating CRM activity:', callData);
}

// Function to trigger Bitrix24 automation
async function triggerAutomation(automationId, data) {
  try {
   const apiUrl = `${config.bitrix24.apiUrl}bizproc.automation.trigger`;

    // Prepare the request payload
    const payload = {
        CODE: automationId, 
        DOCUMENT_ID: [ 'crm', 'CCrmDocumentLead', data.callId ], 
        PARAMETERS: data 
    };

    // Make the API call using axios
    const response = await axios.post(apiUrl, payload, {
        headers: {
        'Authorization': `Bearer ${accessToken}` 
        }
    });

    // Handle the API response
    if (response.data.result) {
        console.log('Bitrix24 automation triggered successfully');
    } else {
        console.error('Error triggering Bitrix24 automation:', response.data.error);
        throw new Error(response.data.error);
    }

    } catch (error) {
    console.error('Error triggering Bitrix24 automation:', error);
    throw error; 
    }
}


// Function to get the queue ID for a given autodialer
async function getQueueIdForAutodialer(autodialerId) {
  try {
    // Fetch queue information from Bitrix24 (potentially with caching)
    const queues = await getBitrix24Queues();

    // Retrieve the "Initiative Lead" value for the autodialer 
    const initiativeLead = await getInitiativeLeadForAutodialer(autodialerId); // need to implement this function

    // Find the matching queue based on the Initiative Lead value
    const queue = queues.find(q => q.NAME.includes(initiativeLead));

    if (queue) {
      return queue.ID;
    } else {
      // Log a warning and skip the call initiation
      logger.warn('Queue not found for autodialer, skipping call initiation', { autodialerId });
      return null;
    }

  } catch (error) {
    console.error('Error getting queue ID for autodialer:', error);
    // Handle the error appropriately (e.g., log, notify)
    throw error; 
  }
}

// Function to retrieve queue information from Bitrix24 (with caching)
let cachedQueues = null;
let cacheExpiry = null;

async function getBitrix24Queues() {
  try {
    // Check if cache is valid
    if (cachedQueues && cacheExpiry > Date.now()) {
      return cachedQueues;
    }

    // Construct the Bitrix24 API URL
    const apiUrl = `${config.bitrix24.apiUrl}voximplant.queue.get`;

    // Make the API call using axios
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Cache the results
    cachedQueues = response.data.result;
    cacheExpiry = Date.now() + (30 * 60 * 1000); // Cache for 30 minutes (adjust as needed)

    // Return the list of queues
    return cachedQueues;

  } catch (error) {
    console.error('Error getting Bitrix24 queues:', error);

    // Add retry logic for potential API errors or network issues (example)
    if (error.response && (error.response.status === 500 || error.response.status === 503)) { // Retry on 500 or 503 errors
      const retryDelay = 2000; 
      logger.warn(`Retrying getBitrix24Queues after ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return await getBitrix24Queues(); 
    } else {
      throw error;
    }
  }
}

// Placeholder function to get the "Initiative Lead" value for a given autodialer
async function getInitiativeLeadForAutodialer(autodialerId) {
  // ... (You'll need to implement this based on how you store/access this information)
  console.log('Getting Initiative Lead for autodialer:', autodialerId);
  // For now return a placeholder value
  return 'Some Initiative Lead';
}

module.exports = {
  initiateBitrix24Call,
  getAgentTelephonyStatus,
  updateCrmRecord,
  isAgentClockedIn,
  createCrmActivity, 
  triggerAutomation,
  updateDealStage,
  getQueueIdForAutodialer
};