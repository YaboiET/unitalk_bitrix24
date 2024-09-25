# Decision Log: Unitalk & Bitrix24 Integration

This document records key decisions and their rationale made during the development of the Unitalk & Bitrix24 integration project.

## Core Integration Strategy

* **Date:** September 13, 2024
* **Decision:** Utilize SIP trunking for the core call connection between Unitalk and Bitrix24
* **Rationale:**  This approach offers lower latency and better control over call quality compared to call forwarding, aligning with the project's goal of minimizing latency.

## Data Storage

* **Date:** September 13, 2024
* **Decision:** Utilize Bitrix24 Drive's "Network Drive" feature for storing integration data initially
* **Rationale:** Provides a readily available and no-cost solution for data storage during development and initial deployment. It can be re-evaluated later if data volume or complexity increases significantly.

## Queue & Agent Assignment Mapping

* **Date:** September 18, 2024
* **Decision:** Utilize an external mapping table stored in Bitrix24 Drive to associate Unitalk autodialers with Bitrix24 queues and agents
* **Rationale:** Offers flexibility and centralized management for handling potential changes in campaign setups and agent allocations

## Agent Status Management

* **Date:** September 18, 2024
* **Decision:** Implement automatic agent status updates based on Bitrix24 telephony statuses using webhook events (`ONVOXIMPLANTCALLSTART` and `ONVOXIMPLANTCALLEND`) 
* **Rationale:** Ensures accurate and real-time synchronization of agent availability between Unitalk and Bitrix24, crucial for predictive dialer efficiency. Avoids the need for manual status updates by agents and potential conflicts

## Disposition Outcome Mapping

* **Date:** September 18, 2024
* **Decision:** Leverage the native Unitalk-Bitrix24 connector to map Unitalk's `callState` to the custom `disposition` field in Bitrix24 CRM
* **Rationale:** Simplifies the integration by utilizing existing functionality and avoids the need for complex mapping logic within the custom code

## Queue Time Calculation

* **Date:** September 18, 2024
* **Decision:** Utilize the `secondsClientWaitOperator` field from Unitalk's `/autodialers/calls/get` API to capture queue time data
* **Rationale:** Provides a direct and reliable way to obtain queue time information for reporting and analytics purposes

## Call Recording

* **Date:** September 13, 2024
* **Decision:** Store call recording URLs in Bitrix24 Drive and associate them with the corresponding lead card
* **Rationale:** Leverages Bitrix24's built-in capabilities for storing and accessing call recordings, ensuring they are easily accessible within the CRM context

## Reporting and Analytics

* **Date:** September 13, 2024
* **Decision:** 
    * Utilize Bitrix24's BI builder and existing dataset for disposition outcome reporting
    * Explore Bitrix24's reporting capabilities further for other metrics. If needed, consider integrating with an external BI tool
* **Rationale:** 
    * The existing dataset and table provide a foundation for disposition reporting
    * Bitrix24's BI builder might offer sufficient customization for other metrics, but external BI tool integration remains an option for more advanced analysis

## Error Handling

* **Date:** September 18, 2024
* **Decision:** Implement robust error handling and retry mechanisms throughout the integration code, including specific handling for Unitalk and Bitrix24 API errors, webhook delivery failures, network issues and data storage errors
* **Rationale:** Ensures the integration is resilient to potential failures and minimizes disruptions to the user experience

## Development Approach

* **Date:** September 18, 2024
* **Decision:** Prioritize core functionalities (call initiation, routing, agent status sync, CRM updates, call recording) for the initial alpha release. Defer non-essential features (advanced CRM integrations, complex reporting, dynamic autodialer management) for later iterations
* **Rationale:** This approach allows for a faster initial deployment to meet stakeholder expectations while still delivering a functional and usable integration. Non-essential features can be added incrementally based on user feedback and evolving requirements

## Call Queueing and Agent Status Management

* **Date:** September 19, 2024
* **Decision:** Adopt a dynamic queue assignment approach
    * Create 10 inbound queues in Bitrix24, each initially associated with one of the 10 Unitalk inner lines
    * Assign the first 10 agents to their own dedicated queues
    * Distribute remaining agents across these 10 queues
    * Periodically poll Unitalk's API (`/phones/inner`) to get real-time status of inner lines
    * Dynamically adjust agent assignments in Bitrix24 queues based on line availability
    * If all inner lines and assigned agents are busy, route incoming calls to an overflow queue or voicemail
* **Rationale:** This approach maximizes inner line utilization, efficiently handles inbound calls, and provides flexibility in agent assignments

## Caller ID Handling

* **Date:** September 19, 2024
* **Decision:** 
    * Unitalk will initiate outbound calls using its inner lines
    * The Australian Voximplant number (outer line) will be used as the caller ID, configured in Unitalk's "Outgoing Scenarios"
    * Thorough testing will be conducted to ensure caller ID consistency
* **Rationale:** This leverages Unitalk's predictive dialer capabilities while presenting a local Australian number to the recipient

## Inbound & Outbound Call Handling

* **Date:** September 19, 2024
* **Decision:**
    * **Incoming Calls:** Direct inbound calls to Bitrix24 Voximplant number will be handled by Bitrix24 and routed to a specific queue with prioritized agents before overflowing to another queue
    * **Outgoing Calls:** Unitalk initiates outbound calls via SIP trunking, Bitrix24 handles answered calls
* **Rationale:**  This setup centralizes inbound call handling in Bitrix24 and allows Unitalk to focus on outbound calling with its predictive dialer

## Other Decisions

* **Date:** September 19, 2024
* **Decisions:** 
    * Defer implementation of call transfers/conferencing, voicemail & missed call handling, and integration with other Bitrix24 modules for future enhancements
    * Need to confirm with Bitrix24 support if the rented Voximplant number can be used with the SIP connector and how caller ID is handled during call forwarding
    * No Answer" incrementation logic will be implemented
    * The mapping for `CLIENT_CALLED` will be adjusted based on the process for handling inbound or callback calls
    * Mappings for other relevant `callState` values will be added as needed
    * Use a single webhook endpoint (`/webhooks/bitrix24`) in `bitrix24Webhooks.js` to handle both `ONVOXIMPLANTCALLSTART` and `ONVOXIMPLANTCALLEND` events
    * Leverage the native Unitalk-Bitrix24 connector for basic call logging, contact synchronization, and disposition outcome mapping
    * Evaluate the potential use of other autodialer events later if needed
    * Explore using scheduled event handlers later if specific use cases arise

* **Rationale:** These decisions prioritize core functionality, simplify the initial implementation, and allow for future enhancements based on evolving needs and feedback. 

### Code Review and Refinements

* **Date:** September 18, 2024
* **Decisions:**
    * Enhance error handling and logging in `data.js`.
    * Include timestamps in file names for `storeCallDetails` for better organization.
    * Implement retry mechanisms for certain API calls in `data.js`.
    * Refine the `mapCallStateToDisposition` function to align with Bitrix24 disposition values and handle the `ANSWERING_MACHINE` case.
    * The `getQueueIdForAutodialer` function in `bitrix24Api.js` is partially implemented, pending the final queue mapping logic.
    * Placeholder functions `updateCrmRecord`, `createCrmActivity`, and `triggerAutomation` added to `bitrix24Api.js`.
    * The `storeCallDetails` and `storeCallRecording` functions in `data.js` need to be completed.
    * The `storeAgentAssignments` and `getAgentAssignments` functions in `data.js` need to be implemented based on the chosen agent assignment strategy.
* **Rationale:** 
    * Improve code robustness, clarity, and maintainability.
    * Address potential errors and edge cases.
    * Ensure accurate data mapping and handling.


* **Date:** September 18, 2024
* **Decisions:**
    * Enhance error handling and logging in `data.js`.
    * Include timestamps in file names for `storeCallDetails` for better organization.
    * Implement retry mechanisms for certain API calls in `data.js`.
    * Refine the `mapCallStateToDisposition` function to align with Bitrix24 disposition values and handle the `ANSWERING_MACHINE` case.
    * The `getQueueIdForAutodialer` function in `bitrix24Api.js` is partially implemented, pending the final queue mapping logic.
    * Placeholder functions `updateCrmRecord`, `createCrmActivity`, and `triggerAutomation` added to `bitrix24Api.js`.
    * The `storeCallDetails` and `storeCallRecording` functions in `data.js` need to be completed.
    * The `storeAgentAssignments` and `getAgentAssignments` functions in `data.js` need to be implemented based on the chosen agent assignment strategy.
* **Rationale:** 
    * Improve code robustness, clarity, and maintainability.
    * Address potential errors and edge cases.
    * Ensure accurate data mapping and handling.

### Collaboration Optimizations

* **Date:** September 18, 2024
* **Decisions:**
    * Do not include hybrid approach instructions in every prompt to avoid redundancy and maintain flexibility
    * Create an `optimizations.md` file to document agreed-upon collaboration optimizations
    * Create `ERROR_HANDLING.md` and `DATA_MAPPING.md` files for better documentation and clarity
    * Stick with Bitrix24 Drive for initial data storage due to its simplicity and no additional cost
    * Implement the `getQueueIdForAutodialer` function in `bitrix24Api.js` by retrieving queue information from Bitrix24 and matching based on queue names (assuming a consistent naming convention)
    * Handle technical issue `callState` values by logging them without updating the disposition field in Bitrix24
* **Rationale:** 
    * These decisions aim to streamline the development process, leverage existing functionalities, and ensure the integration's robustness and maintainability.

* **Date:** September 19, 2024
* **Decisions**
    * Use the native Unitalk-Bitrix24 connector to map `callState` to the custom `disposition` field in Bitrix24 CRM
    * Utilize the `/autodialers/calls/get` endpoint to retrieve `secondsClientWaitOperator` for queue time data
    * Implement a dynamic queue assignment approach to maximize the utilization of Unitalk's inner lines and efficiently handle inbound calls
    * Direct inbound calls to the Bitrix24 Voximplant number will be handled by Bitrix24 and routed to a specific queue
    * Outbound calls will be initiated by Unitalk via SIP trunking, and Bitrix24 will handle answered calls
    * Implementation of call transfers/conferencing, voicemail & missed call handling, and integration with other Bitrix24 modules will be deferred for future enhancements
    * Need to confirm with Bitrix24 support if we can use the rented Voximplant number with the SIP connector and how caller ID is handled during call forwarding
    * "No Answer" incrementation logic will be implemented to handle scenarios where the predictive dialer calls a lead that already has a "No Answer" disposition
    * The mapping for `CLIENT_CALLED` will be adjusted based on the process for handling inbound or callback calls
    * Mappings for other relevant `callState` values will be added as needed
    * Use a single webhook endpoint (`/webhooks/bitrix24`) in `bitrix24Webhooks.js` to handle both `ONVOXIMPLANTCALLSTART` and `ONVOXIMPLANTCALLEND` events
    * Leverage the native Unitalk-Bitrix24 connector for basic call logging, contact synchronization, and disposition outcome mapping
    * Evaluate the potential use of other autodialer events (e.g., `AUTODIAL_STATUS_CHANGED`, `AUTODIAL_FINISH`) later if needed
    * Explore using scheduled event handlers later if specific use cases arise

* **Rationale:** 
    * These decisions aim to streamline the development process, leverage existing functionalities, and ensure the integration's robustness and maintainability.

 **Date:** September 18, 2024
* **Decisions:**
    * Enhance error handling and logging in `data.js`.
    * Include timestamps in file names for `storeCallDetails` for better organization.
    * Implement retry mechanisms for certain API calls in `data.js`.
    * Refine the `mapCallStateToDisposition` function to align with Bitrix24 disposition values and handle the `ANSWERING_MACHINE` case.
    * The `getQueueIdForAutodialer` function in `bitrix24Api.js` is partially implemented, pending the final queue mapping logic.
    * Placeholder functions `updateCrmRecord`, `createCrmActivity`, and `triggerAutomation` added to `bitrix24Api.js`.
    * The `storeCallDetails` and `storeCallRecording` functions in `data.js` need to be completed.
    * The `storeAgentAssignments` and `getAgentAssignments` functions in `data.js` need to be implemented based on the chosen agent assignment strategy.
* **Rationale:** 
    * Improve code robustness, clarity, and maintainability.
    * Address potential errors and edge cases.
    * Ensure accurate data mapping and handling.
	
	
* Reviewed `index.js`, `unitalkWebhooks.js`, `bitrix24Webhooks.js`, `bitrix24Api.js`, and `unitalkApi.js` files.
* Addressed minor issues and inconsistencies.
* Enhanced error handling and logging in `data.js`.
* Implemented retry mechanisms for certain API calls in `data.js`.
* Included timestamps in file names for `storeCallDetails` for better organization.
* The `mapCallStateToDisposition` function has been refined to align with the Bitrix24 disposition values and handle the `ANSWERING_MACHINE` case.
* The `getQueueIdForAutodialer` function in `bitrix24Api.js` is partially implemented, pending the final queue mapping logic.
* Placeholder functions `updateCrmRecord`, `createCrmActivity`, and `triggerAutomation` added to `bitrix24Api.js`.
* The `storeCallDetails` and `storeCallRecording` functions in `data.js` need to be completed
* The `storeAgentAssignments` and `getAgentAssignments` functions in `data.js` need to be implemented based on the chosen agent assignment strategy

### Further Refinements and Decisions (continued)

* **Date:** September 18, 2024
* **Decisions**
    * Do not include hybrid approach instructions in every prompt to avoid redundancy and maintain flexibility.
    * Create an `optimizations.md` file to document agreed-upon collaboration optimizations.
    * Create `ERROR_HANDLING.md` and `DATA_MAPPING.md` files for better documentation and clarity.
    * Stick with Bitrix24 Drive for initial data storage due to its simplicity and no additional cost.
    * Implement the `getQueueIdForAutodialer` function in `bitrix24Api.js` by retrieving queue information from Bitrix24 and matching based on queue names (assuming a consistent naming convention).
    * Handle technical issue `callState` values by logging them without updating the disposition field in Bitrix24.
* **Rationale:** 
    * These decisions aim to streamline the development process, leverage existing functionalities, and ensure the integration's robustness and maintainability.

* **Date:** September 19, 2024
* **Decisions**
    * Use the native Unitalk-Bitrix24 connector to map `callState` to the custom `disposition` field in Bitrix24 CRM.
    * Utilize the `/autodialers/calls/get` endpoint to retrieve `secondsClientWaitOperator` for queue time data.
    * Implement a dynamic queue assignment approach to maximize the utilization of Unitalk's inner lines and efficiently handle inbound calls.
    * Direct inbound calls to the Bitrix24 Voximplant number will be handled by Bitrix24 and routed to a specific queue.
    * Outbound calls will be initiated by Unitalk via SIP trunking, and Bitrix24 will handle answered calls.
    * Implementation of call transfers/conferencing, voicemail & missed call handling, and integration with other Bitrix24 modules will be deferred for future enhancements.
    * Need to confirm with Bitrix24 support if we can use the rented Voximplant number with the SIP connector and how caller ID is handled during call forwarding.
    * "No Answer" incrementation logic will be implemented to handle scenarios where the predictive dialer calls a lead that already has a "No Answer" disposition.
    * The mapping for `CLIENT_CALLED` will be adjusted based on the process for handling inbound or callback calls.
    * Mappings for other relevant `callState` values will be added as needed.
    * Use a single webhook endpoint (`/webhooks/bitrix24`) in `bitrix24Webhooks.js` to handle both `ONVOXIMPLANTCALLSTART` and `ONVOXIMPLANTCALLEND` events.
    * Leverage the native Unitalk-Bitrix24 connector for basic call logging, contact synchronization, and disposition outcome mapping.
    * Evaluate the potential use of other autodialer events (e.g., `AUTODIAL_STATUS_CHANGED`, `AUTODIAL_FINISH`) later if needed.
    * Explore using scheduled event handlers later if specific use cases arise.

* **Rationale:** 
    * These decisions aim to streamline the development process, leverage existing functionalities, and ensure the integration's robustness and maintainability.

* **Date:** September 18, 2024
* **Decisions**
    * Do not include hybrid approach instructions in every prompt to avoid redundancy and maintain flexibility.
    * Create an `optimizations.md` file to document agreed-upon collaboration optimizations.
    * Create `ERROR_HANDLING.md` and `DATA_MAPPING.md` files for better documentation and clarity.
    * Stick with Bitrix24 Drive for initial data storage due to its simplicity and no additional cost.
    * Implement the `getQueueIdForAutodialer` function in `bitrix24Api.js` by retrieving queue information from Bitrix24 and matching based on queue names (assuming a consistent naming convention).
    * Handle technical issue `callState` values by logging them without updating the disposition field in Bitrix24.
* **Rationale:** 
    * These decisions aim to streamline the development process, leverage existing functionalities, and ensure the integration's robustness and maintainability.

* **Date:** September 19, 2024
* **Decisions**
    * Use the native Unitalk-Bitrix24 connector to map `callState` to the custom `disposition` field in Bitrix24 CRM
    * Utilize the `/autodialers/calls/get` endpoint to retrieve `secondsClientWaitOperator` for queue time data
    * Implement a dynamic queue assignment approach to maximize the utilization of Unitalk's inner lines and efficiently handle inbound calls
    * Direct inbound calls to the Bitrix24 Voximplant number will be handled by Bitrix24 and routed to a specific queue
    * Outbound calls will be initiated by Unitalk via SIP trunking, and Bitrix24 will handle answered calls
    * Implementation of call transfers/conferencing, voicemail & missed call handling, and integration with other Bitrix24 modules will be deferred for future enhancements
    * Need to confirm with Bitrix24 support if we can use the rented Voximplant number with the SIP connector and how caller ID is handled during call forwarding
    * "No Answer" incrementation logic will be implemented to handle scenarios where the predictive dialer calls a lead that already has a "No Answer" disposition
    * The mapping for `CLIENT_CALLED` will be adjusted based on the process for handling inbound or callback calls
    * Mappings for other relevant `callState` values will be added as needed
    * Use a single webhook endpoint (`/webhooks/bitrix24`) in `bitrix24Webhooks.js` to handle both `ONVOXIMPLANTCALLSTART` and `ONVOXIMPLANTCALLEND` events
    * Leverage the native Unitalk-Bitrix24 connector for basic call logging, contact synchronization, and disposition outcome mapping
    * Evaluate the potential use of other autodialer events (e.g., `AUTODIAL_STATUS_CHANGED`, `AUTODIAL_FINISH`) later if needed
    * Explore using scheduled event handlers later if specific use cases arise

* **Rationale:** 
    * These decisions aim to streamline the development process, leverage existing functionalities, and ensure the integration's robustness and maintainability.
	
	* **Date:** September 19, 2024
* **Decisions**
    * The `ANSWER` `callState` will not be mapped to a disposition in Bitrix24, as agents will handle this manually.
    * `ANSWERING_MACHINE` will be mapped to "No Answer (1)".
    * Technical issues (`FAIL`, `BUSYOUT`, `AUDIO_ERR`, `WRONG_DIR`) will not update the disposition but will be logged.
    * `CLIENT_CALLED` will be mapped to "Callback".
    * `CANCEL` and `AUTOCANCEL` will be mapped to "No Call Made".
    * `NOT_EXIST` will be mapped to "Broken".
    * Other relevant `callState` values will be mapped as needed.
* **Rationale:** 
    * These decisions further refine the disposition outcome mapping to align with the project's specific requirements and ensure accurate representation of call outcomes in Bitrix24 CRM.

* **Date:** September 19, 2024
* **Decisions**
    * Use Bitrix24's `telephony.getstatus` endpoint for agent status synchronization
    * Leverage the existing dataset and table in Bitrix24's BI builder for disposition outcome reporting and explore its capabilities for other metrics. If necessary, consider integrating with an external BI tool
    * Implement the `getQueueIdForAutodialer` function in `bitrix24Api.js` by retrieving queue information from Bitrix24 and matching based on the queue name
    * Handle technical issue `callState` values by logging them without updating the disposition field in Bitrix24
    * 'No Answer' scenarios will be handled by incrementing the attempt count if the `currentDisposition` already starts with "No Answer".
    * Queue time data will be retrieved using the `/autodialers/calls/get` API.
    * Disposition outcome mapping will be handled using the native Unitalk-Bitrix24 connector and automation.

* **Rationale:** 
    * These decisions refine the integration plan further, based on additional information and analysis of Unitalk's API documentation and Bitrix24's capabilities

* **Date:** September 19, 2024
* **Decisions**
    * Stick with Bitrix24 Drive for initial data storage
    * Implement a dynamic queue assignment approach to maximize the utilization of Unitalk's inner lines and efficiently handle inbound calls
    * Unitalk will initiate outbound calls, and Bitrix24 will handle answered calls
    * Implementation of call transfers/conferencing, voicemail & missed call handling, and integration with other Bitrix24 modules will be deferred for future enhancements
    * We will use the rented Voximplant number with the SIP connector
    * Caller ID will be handled via Unitalk's "Outgoing Scenarios" 

* **Rationale:** 
    * These decisions prioritize core functionality, simplify the initial implementation, and allow for future enhancements based on evolving needs and feedback

* **Date:** September 19, 2024
* **Decisions** 
    * Use a single webhook endpoint (`/webhooks/bitrix24`) in `bitrix24Webhooks.js` to handle both `ONVOXIMPLANTCALLSTART` and `ONVOXIMPLANTCALLEND` events
    * Leverage the native Unitalk-Bitrix24 connector for basic call logging, contact synchronization, and disposition outcome mapping
    * The following events are currently configured to trigger the "Bitrix24 Handler":
        * Call events: `New call`, `Call redirected`, `Answering the call`, `Call completed`
        * SMS receiving event: `Received on any number`
        * Message status change event
    * Autodialer events:
        * Several autodialer events are currently unassigned
        * The following events are assigned to the "Bitrix24 Handler":
            * `New autodialer call`
            * `A subscriber answered the autodialer call`
            * `An operator answered the autodialer call`
            * `Autodialer call completed`
            * `Call completed unsuccessfully and the number of re-ring attempts has been exceeded`
            * `Client made the call himself or was an outgoing call`
            * `Phone number is blocked by the project settings`
            * `Call completed - answered by subscriber and operator`
            * `Call completed - answered by the subscriber and there was no call to the operators`
            * `Call completed - answered by a subscriber and there were no available operators`
            * `Call completed - answered by a subscriber and operators did not accept the call`
            * `Call completed - no answer`
            * `Call completed - busy or reset`
            * `Call completed - connection failure`
            * `Call completed - the callee is talking`
            * `Call completed - the callee is unavailable`
            * `Call completed - voice mail`
            * `Call completed - the number does not exist`
            * `Call completed - not enough lines`
            * `Call completed - wrong direction`
            * `Call completed - audio error`

* **Rationale:** 
    * These decisions leverage the existing native integration capabilities and streamline the webhook handling process

* **Date:** September 19, 2024
* **Decisions:**
    * Enhance error handling and logging in `data.js`, including specific checks for Bitrix24 API error codes and implementing retry mechanisms with exponential backoff
    * Include timestamps in file names for `storeCallDetails` for better organization
    * Implement the `getQueueIdForAutodialer` function in `bitrix24Api.js` by retrieving queue information from Bitrix24 and matching based on queue names
    * Handle 'No Answer' scenarios by incrementing the attempt count if the `currentDisposition` already starts with "No Answer".

* **Rationale:** 
    * Improve code robustness, clarity and maintainability
    * Address potential errors and edge cases
    * Ensure accurate data mapping and handling

* **Date:** September 19, 2024
* **Decisions**
    * The `ANSWER` `callState` will not be mapped to a disposition in Bitrix24, as agents will handle this manually.
    * `ANSWERING_MACHINE` will be mapped to "No Answer (1)".
    * Technical issues (`FAIL`, `BUSYOUT`, `AUDIO_ERR`, `WRONG_DIR`) will not update the disposition but will be logged.
    * `CLIENT_CALLED` will be mapped to "Callback".
    * `CANCEL` and `AUTOCANCEL` will be mapped to "No Call Made".
    * `NOT_EXIST` will be mapped to "Broken".
    * Other relevant `callState` values will be mapped as needed.
* **Rationale:** 
    * These decisions further refine the disposition outcome mapping to align with the project's specific requirements and ensure accurate representation of call outcomes in Bitrix24 CRM
