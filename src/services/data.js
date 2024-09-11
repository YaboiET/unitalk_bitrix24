const axios = require('axios');
const config = require('../config');
const fs = require('fs');
const winston = require('winston');

// Configure Winston logger 
const logger = winston.createLogger({
    level: 'info', 
    format: winston.format.combine(
        winston.format.timestamp(),  

        winston.format.json() 
    ),
    transports: [
        new winston.transports.Console(), 
        // Add other transports  
 as needed (e.g., file transport for persistent logging)
    ]
});

// Function to store the association between Unitalk and Bitrix24 call IDs, including autodialer ID
async function storeCallAssociation(unitalkCallId, bitrix24CallId, autodialerId) {
    const maxRetries = 3; // Maximum number of retries
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
        // Construct the Bitrix24 Drive API URL for file upload
        const apiUrl = `${config.bitrix24.apiUrl}disk.folder.uploadfile`;

        // Prepare the file content 
        const fileContent = JSON.stringify({
            unitalkCallId,
            bitrix24CallId,
            autodialerId
        });

        // Prepare the request payload for file upload
        const formData = new FormData();
        formData.append('id', config.bitrix24.driveFolderId);
        formData.append('data', new Blob([fileContent], { type: 'application/json' }), `call_association_${unitalkCallId}.json`);

        // Make the API call using axios
        const response = await axios.post(apiUrl, formData, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data' 
            }
        });

        // Handle the API response
        if (response.data.result) {
            logger.info('Call association stored successfully in Bitrix24 Drive', { unitalkCallId, bitrix24CallId, autodialerId });
            return; // Exit the loop on success
        } else {
            const errorMessage = `Error storing call association in Bitrix24 Drive: ${response.status} - ${response.data.error} - ${response.data.error_description}`;
            logger.error(errorMessage, { unitalkCallId, bitrix24CallId, autodialerId });

            // Check for specific error codes and handle them appropriately 
            if (response.status === 401) { // Unauthorized - token might be expired
            // ... implement token refresh logic and retry the API call
            logger.warn('Retrying storeCallAssociation after token refresh...');
            // ... your token refresh logic here ...
            // Make sure to update the 'accessToken' variable after refreshing
            continue; // Retry the loop
            } else if (response.status === 500) { // Internal Server Error
            retryCount++;
            const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            logger.warn(`Retrying storeCallAssociation after ${retryDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue; // Retry the loop
            } else {
            // ... handle other errors (log, notify, etc.)
            // You might want to throw an error here to propagate it up to the calling function for further handling
            throw new Error(errorMessage);
            }
        }

    } catch (error) {
        logger.error('Error storing call association:', error);
        // You might want to log this error to a more persistent store or notify relevant stakeholders
        throw error; 
    }
}

// Function to retrieve Bitrix24 call ID and autodialer ID using Unitalk call ID
async function getBitrix24CallData(unitalkCallId) {
try {
  // Construct the Bitrix24 Drive API URL for file download
  const apiUrl = `${config.bitrix24.apiUrl}disk.file.getcontent`;

  // Prepare the request parameters
  const params = {
    id: `call_association_${unitalkCallId}.json` 
  };

  // Make the API call using axios
  const response = await axios.get(apiUrl, {
    params: params,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // Parse the file content and return the call data
  const callAssociationData = JSON.parse(response.data);
  return {
      bitrix24CallId: callAssociationData.bitrix24CallId,
      autodialerId: callAssociationData.autodialerId
  };

} catch (error) {
  console.error('Error retrieving Bitrix24 call data:', error);

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
    throw new Error('An error occurred while retrieving Bitrix24 call data.');
  }
  }
}

// Function to store call details in Bitrix24 Drive
async function storeCallDetails(unitalkCallId, callDetails) {
    const maxRetries = 3; // Maximum number of retries
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
        // Construct the file path for storing call details (with timestamp for better organization)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace colons and dots for valid file names
        const filePath = `./call_details_${unitalkCallId}_${timestamp}.json`; 

        // Write call details to the file
        fs.writeFileSync(filePath, JSON.stringify(callDetails));

        // Upload the file to Bitrix24 Drive
        const apiUrl = `${config.bitrix24.apiUrl}disk.folder.uploadfile`;

        const formData = new FormData();
        formData.append('id', config.bitrix24.driveFolderId);
        formData.append('data', fs.createReadStream(filePath), `call_details_${unitalkCallId}_${timestamp}.json`);

        const response = await axios.post(apiUrl, formData, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.result) {
            logger.info('Call details stored successfully in Bitrix24 Drive', { unitalkCallId });
            // Optionally, delete the local file after successful upload
            fs.unlinkSync(filePath);
            return; // Exit the loop on success
        } else {
            const errorMessage = `Error storing call details in Bitrix24 Drive: ${response.status} - ${response.data.error} - ${response.data.error_description}`;
            logger.error(errorMessage, { unitalkCallId });

            // Check for specific error codes and handle them appropriately 
            if (response.status === 401) {
            // ... implement token refresh logic and retry the upload
            logger.warn('Retrying storeCallDetails after token refresh...');
            // ... your token refresh logic here ...
            // Make sure to update the 'accessToken' variable after refreshing
            continue; // Retry the loop
            } else if (response.status === 500) {
            // ... retry the upload after a delay (exponential backoff)
            retryCount++;
            const retryDelay = Math.pow(2, retryCount) * 1000; // Adjust the delay as needed
            logger.warn(`Retrying storeCallDetails after ${retryDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue; // Retry the loop
            } else {
            // ... handle other errors (log, notify, etc.)
            throw new Error(errorMessage);
            }
        }

    } catch (error) {
        logger.error('Error uploading call details to Bitrix24 Drive:', { unitalkCallId, error });
        // Handle the error appropriately
    }
  });

  writeStream.on('error', (error) => {
    logger.error('Error writing call details to file:', { unitalkCallId, error });
    // Handle the error appropriately
  });

} catch (error) {
  console.error('Error storing call details:', error);
  throw error; 
}
}

// Function to store call recording URL in Bitrix24 Drive
async function storeCallRecording(bitrix24CallId, recordingUrl) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Construct the file path for storing call recording URL (adjust as needed)
      const filePath = `./call_recording_${bitrix24CallId}.json`;

      // Write the recording URL to the file
      fs.writeFileSync(filePath, JSON.stringify({ recordingUrl }));

      // Upload the file to Bitrix24 Drive
      const apiUrl = `${config.bitrix24.apiUrl}disk.folder.uploadfile`;

      const formData = new FormData();
      formData.append('id', config.bitrix24.driveFolderId);
      formData.append('data', fs.createReadStream(filePath), `call_recording_${bitrix24CallId}.json`);

      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      if (response.data.result) {
        logger.info('Call recording URL stored successfully in Bitrix24 Drive');
        // Optionally, delete the local file after successful upload
        fs.unlinkSync(filePath);
        return; // Exit loop on success
      } else {
        const errorMessage = `Error storing call recording URL in Bitrix24 Drive: ${response.status} - ${response.data.error} - ${response.data.error_description}`;
        logger.error(errorMessage, { bitrix24CallId });

        // Check for specific error codes and handle them appropriately 
        if (response.status === 401) {
          // ... implement token refresh logic and retry the upload
          logger.warn('Retrying storeCallRecording after token refresh...');
          // ... your token refresh logic here ...
          // Make sure to update the 'accessToken' variable after refreshing
          continue; // Retry the loop
        } else if (response.status === 500) {
          // ... retry the upload after a delay (exponential backoff)
          retryCount++;
          const retryDelay = Math.pow(2, retryCount) * 1000; // Adjust the delay as needed
          logger.warn(`Retrying storeCallRecording after ${retryDelay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue; // Retry the loop
        } else {
          // ... handle other errors (log, notify, etc.)
          throw new Error(errorMessage);
        }
      }

  } catch (error) {
    console.error('Error storing call recording URL:', error);
    throw error;
  }
}

// Function to store agent-autodialer assignments 
async function storeAgentAssignments(assignments) {
  try {
    // Construct the file path for storing agent assignments
    const filePath = './agent_assignments.json'; 

    // Write assignments data to the file
    fs.writeFileSync(filePath, JSON.stringify(assignments));

    // Upload the file to Bitrix24 Drive
    const apiUrl = `${config.bitrix24.apiUrl}disk.folder.uploadfile`;

    const formData = new FormData();
    formData.append('id', config.bitrix24.driveFolderId);
    formData.append('data', fs.createReadStream(filePath), 'agent_assignments.json');

    const response = await axios.post(apiUrl, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.result) {
      console.log('Agent assignments stored successfully in Bitrix24 Drive');
      // Optionally delete the local file after successful upload
      fs.unlinkSync(filePath);
    } else {
      console.error('Error storing agent assignments in Bitrix24 Drive:', response.data.error);
      // Handle the error appropriately (e.g., retry, log, notify)
    }
  } catch (error) {
    console.error('Error storing agent assignments:', error);
    throw error; 
  }
}

// Function to get agent assignments from Bitrix24 Drive
async function getAgentAssignments() {
    try {
      // Construct the Bitrix24 Drive API URL for file download
      const apiUrl = `${config.bitrix24.apiUrl}disk.file.getcontent`;
  
      // Prepare the request parameters
      const params = {
        id: 'agent_assignments.json' 
      };
  
      // Make the API call using axios
      const response = await axios.get(apiUrl, {
        params: params,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      // Parse the file content and return the assignments data
      return JSON.parse(response.data);
  
    } catch (error) {
      console.error('Error retrieving agent assignments:', error);
  
      // More specific error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { status, data } = error.response;
        const errorMessage = data.error_description || 'An unknown error occurred.';
        console.error('Bitrix24 API error:', status, errorMessage);
        throw new Error(`Bitrix24 API error: ${errorMessage}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response from Bitrix24 API:', error.request);
        throw new Error('No response from Bitrix24 API. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up Bitrix24 API request:', error.message);
        throw new Error('An error occurred while retrieving agent assignments.');
      }
    }
  }
  
  module.exports = {
    storeCallAssociation,
    getBitrix24CallData, 
    storeCallDetails,
    storeCallRecording,
    storeAgentAssignments,
    getAgentAssignments
  };