# Error Handling and Retry Strategies

This document outlines the error handling and retry strategies implemented in the Unitalk & Bitrix24 integration to ensure robustness and resilience in the face of potential failures.

## General Principles

*   **Logging:** All errors and exceptions should be logged with appropriate severity levels (e.g., `error`, `warn`, `info`) using the Winston logging library. Log messages should include relevant context and details to aid in debugging and troubleshooting.
*   **User Feedback:**  In case of errors that directly impact the user experience (e.g., failed call initiation, CRM update failures), provide clear and informative feedback to the user within the Bitrix24 interface or through other appropriate channels (e.g., notifications).
*   **Retry Mechanisms:** Implement retry mechanisms for API calls and other operations that might be prone to transient failures (e.g., network issues, temporary server errors). Use exponential backoff strategies to avoid overwhelming external services.
*   **Fallback Strategies:**  For critical errors that cannot be resolved through retries, implement fallback strategies to gracefully handle the situation and minimize disruption to the user experience (e.g., default values, alternative call routing, manual intervention).

## Specific Error Scenarios and Mitigation (Implemented)

*   **Unitalk API Errors**
    *   **HTTP Status Codes:**  Basic handling for different HTTP status codes is in place.
        *   401 Unauthorized: Placeholder for token refresh and retry logic.
        *   Other errors: Logged with error details.
    *   **Rate Limiting:**  Not yet implemented, but will be considered if needed.
    *   **Specific Error Messages:**  Currently handled generically, but can be customized further based on Unitalk's API responses.

*   **Bitrix24 API Errors**
    *   **HTTP Status Codes:**  Specific handling for 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), and 404 (Not Found) errors.
        *   401 Unauthorized: Placeholder for token refresh and retry logic
        *   Other errors: Logged with error details and re-thrown to be handled at a higher level.
    *   **Rate Limiting:** Not yet implemented, but will be considered if needed.
    *   **Specific Error Messages:** Currently handled generically, but can be customized further.

*   **Data Storage Errors (Bitrix24 Drive)**
    *   **Bitrix24 Drive API Errors:** Basic error handling and logging are in place. 
    *   **File System Errors (during development/testing):**  Handled during development/testing with logging.
    *   **Retry Mechanisms:** Implemented with exponential backoff for `storeCallAssociation`, `storeCallDetails` and `storeCallRecording`.

## Specific Error Scenarios and Mitigation (Planned)

*   **User Feedback:**
    *   **Implementation:** In case of user-impacting errors, display informative error messages within the Bitrix24 interface (e.g., using notifications or alerts) or send email notifications to relevant stakeholders

*   **Fallback Strategies:** 
    *   **Call Initiation Failure:**
        *   If Unitalk fails to initiate a call after retries, log the error, notify stakeholders, and potentially add the lead to a "Retry Call" list for manual follow-up
    *   **CRM Update Failure:** 
        *   If CRM record updates fail after retries, log the error, notify stakeholders, and potentially queue the update for later retry or manual intervention
    *   **Agent Status Synchronization Failure** 
        *   If unable to update agent status in Unitalk, log the error and consider fallback mechanisms like:
            *   Temporarily pausing the autodialer for that agent
            *   Notifying the agent or manager about the issue

*   **Unitalk API Errors**
    *   **Rate Limiting:**  
        *   Monitor API usage and implement rate limiting using a queue or a leaky bucket algorithm to avoid exceeding Unitalk's API limits
        *   Include backoff strategies to gracefully handle rate limit errors
    *   **Specific Error Messages:** 
        *   As you encounter specific error messages from Unitalk's API during development and testing, add them to this document along with their corresponding handling strategies

*   **Bitrix24 API Errors**
    *   **Rate Limiting:**  Similar to Unitalk, implement rate limiting if necessary
    *   **401 Unauthorized:** 
        *   Implement token refresh logic using the refresh token (if provided by Bitrix24)
        *   Retry the failed API call with the new access token

*   **Other Potential Errors**
    *   **Invalid or Missing Data in Webhook Payloads:** 
        *   Implement data validation and checks to handle cases where expected data is missing or in an unexpected format
        *   Log warnings or errors for invalid data and potentially skip processing the webhook if critical information is missing

    *   **Integration Logic Errors:** 
        *   Thoroughly test and debug your code to identify and fix any logical errors or unexpected behavior
        *   Use logging and debugging tools to track the flow of your code and pinpoint the source of errors

**Example Retry Logic (Illustrative)**

```javascript
async function retryOperation(operation, ...args) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await operation(...args);
    } catch (error) {
      retryCount++;
      console.error(`Error in operation (attempt ${retryCount}):`, error);

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; 
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // All retries failed, handle the final error (log, notify, etc.)
        console.error('Operation failed after retries.');
        throw error; 
      }
    }
  }
}

## Specific Error Scenarios and Mitigation (Implemented)

*   **Unitalk API Errors**
    *   **HTTP Status Codes:**  Basic handling for different HTTP status codes is in place.
        *   401 Unauthorized: *Implement token refresh logic and retry the API call*
        *   Other errors: Logged with error details.
    *   **Rate Limiting:**  *Implement rate limiting and backoff strategies if necessary.*
    *   **Specific Error Messages:**  *Handle specific error messages returned by Unitalk's API as they are encountered during development and testing*

*   **Bitrix24 API Errors**
    *   **HTTP Status Codes:**  Specific handling for 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), and 404 (Not Found) errors.
        *   401 Unauthorized: *Implement token refresh logic and retry the API call*
        *   Other errors: Logged with error details and re-thrown to be handled at a higher level.
    *   **Rate Limiting:** *Implement rate limiting if necessary.*
    *   **Specific Error Messages:** *Handle specific error messages returned by Bitrix24's API as they are encountered*

*   **Data Storage Errors (Bitrix24 Drive)**
    *   **Bitrix24 Drive API Errors:**  *Retry mechanisms with exponential backoff have been implemented for file uploads and downloads.*
    *   **File System Errors (during development/testing):**  *Handled with logging.*

*   **Other Potential Errors**
    *   **Invalid or Missing Data in Webhook Payloads:** *Implement data validation and checks to handle cases where expected data is missing or in an unexpected format. Log warnings or errors for invalid data and potentially skip processing the webhook if critical information is missing.*
    *   **Authentication or Authorization Errors:** *Handle scenarios where the Bitrix24 access token is invalid or expired. Implement token refresh logic and retry mechanisms.*
    *   **Integration Logic Errors:** *Thoroughly test and debug your code to identify and fix any logical errors or unexpected behavior. Use logging and debugging tools to track the flow of your code and pinpoint the source of errors.*

**Example Retry Logic (Illustrative)**

```javascript
async function retryOperation(operation, ...args) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await operation(...args);
    } catch (error) {
      retryCount++;
      console.error(`Error in operation (attempt ${retryCount}):`, error);

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; 
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // All retries failed, handle the final error (log, notify, etc.)
        console.error('Operation failed after retries.');
        throw error; 
      }
    }
  }
}