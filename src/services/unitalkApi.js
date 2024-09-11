const axios = require('axios');
const config = require('../config');

// Function to update agent status in Unitalk with retry logic
async function updateAgentStatus(agentId, newStatus) {
  const maxRetries = 3; 
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Basic parameter validation
      if (!agentId || !newStatus) {
        throw new Error('Invalid agentId or newStatus');
      }

      // Construct the Unitalk API URL
      const apiUrl = `${config.unitalk.apiUrl}/phones/inner/setStatus`;

      // Prepare the request parameters
      const params = {
        number: agentId, 
        status: newStatus 
      };

      // Make the API call using axios
      const response = await axios.post(apiUrl, null, { 
        params: params,
        headers: {
          'Authorization': `Bearer ${config.unitalk.apiKey}` 
        }
      });

      // Handle the API response
      if (response.data.status === 'Success') {
        console.log('Unitalk agent status updated successfully');
        return; // Exit the loop on success
      } else {
        // Log the full API response for better debugging
        console.error('Error updating Unitalk agent status:', response.data);
        throw new Error(response.data.message || 'Unitalk API Error');
      }

    } catch (error) {
      retryCount++;
      console.error(`Error updating Unitalk agent status (attempt ${retryCount}):`, error);

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; 
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Failed to update Unitalk agent status after retries.');
        throw error; 
      }
    }
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

    // Enhanced error handling and data validation
    if (!response.data || !Array.isArray(response.data.items)) {
      console.error('Invalid response from Unitalk API:', response.data);
      throw new Error('Invalid response from Unitalk API');
    }

    // Extract queue time and other relevant data from the response
    const callData = response.data.items.find(item => item.id === unitalkCallId);
    if (callData) {
      return {
        queueTime: callData.secondsClientWaitOperator || 0, 
        // ... other relevant data you want to capture (e.g., call cost, etc.)
      };
    } else {
      console.warn('Call data not found in Unitalk response:', unitalkCallId);
      return {};
    }

  } catch (error) {
    console.error('Error getting additional call data from Unitalk:', error);

    // More specific error handling 
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data.error_description || 'An unknown error occurred.';
      console.error('Unitalk API error:', status, errorMessage);
      // Potentially retry the operation or notify relevant stakeholders
    } else if (error.request) {
      console.error('No response from Unitalk API:', error.request);
      // Potentially retry the operation or notify relevant stakeholders
    } else {
      console.error('Error in Unitalk API request:', error.message);
      // Log the error or take other appropriate action
    }

    throw error; 
  }
}

module.exports = {
  updateAgentStatus,
  getAdditionalCallDataFromUnitalk
};