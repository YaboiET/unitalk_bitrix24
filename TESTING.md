# Testing Strategy

This document outlines the testing strategy for the Unitalk & Bitrix24 integration project. The goal is to ensure the integration functions correctly, meets the defined requirements, and delivers a seamless user experience.

## Test Objectives

* Validate core functionality: 
    * Call initiation and routing
    * Agent status synchronization
    * CRM integration and data storage
    * Call recording
* Ensure data accuracy and consistency between Unitalk and Bitrix24
* Verify error handling and resilience to potential failures
* Assess call quality and latency
* Gather user feedback on usability and effectiveness

## Test Phases

1.  Unit Testing
    * Test individual functions and components of the integration code in isolation
    * Use mocking or stubbing techniques to simulate external dependencies (Unitalk and Bitrix24 APIs)

2.  Integration Testing
    * Test the end-to-end call flow and interactions between Unitalk and Bitrix24
    * Include test cases for various scenarios, including:
        * Successful calls with different outcomes (answered, no answer, busy, etc.)
        * Call transfers and forwarding
        * Agent status changes (manual and automatic)
        * AMD detection and CRM updates
        * Call recording and data storage
    * Verify caller ID consistency, data accuracy, and error handling

3.  User Acceptance Testing (UAT)
    * Involve stakeholders (sales team, managers) to test the integration in a realistic environment
    * Gather feedback on usability, functionality and identify any potential issues or improvements

## Sample Test Cases

* **Call Initiation**
    * Test initiating outbound calls from Unitalk to Bitrix24 using different autodialers
    * Verify that the correct Bitrix24 queue is used based on the autodialer ID
    * Confirm that the caller ID displayed to the recipient is the Australian Voximplant number

* **Call Handling in Bitrix24**
    * Test incoming SIP calls from Unitalk being routed to the correct queues
    * Verify that agents can answer calls within Bitrix24 and interact with the caller
    * Confirm that call recordings are initiated and stored correctly in Bitrix24 Drive

* **CRM Integration**
    * Test that the `disposition` and `answ_machine_attempts` fields in the lead record are updated accurately based on call outcomes and AMD results from Unitalk
    * Verify that the disposition updates trigger the expected lead stage changes through Bitrix24 automation
    * Check if other call-related data (e.g., `queueTime`, `duration`, `callerId`, `utmSource`, `utmMedium`, `utmCampaign`) is captured and stored correctly in Bitrix24 Drive, associated with the corresponding lead

* **Agent Status Synchronization**
    * Test automatic agent status updates based on Bitrix24 telephony events (`ONVOXIMPLANTCALLSTART`, `ONVOXIMPLANTCALLEND`)
    * Verify that changes in Bitrix24 telephony status are reflected in Unitalk's agent status
    * Handle potential conflicts or edge cases in status updates (e.g., agent logs out while on a call)

* **Error Handling and Resilience**
    * Simulate various error scenarios (API failures, network issues, invalid data) and ensure the integration handles them gracefully with appropriate retries, logging, and notifications

* **Reporting and Analytics**
    * Test the generation of required reports using Bitrix24's BI builder
    * Validate the accuracy of the reported metrics:
        * Productivity (time spent waiting - `queueTime`)
        * Connect (time spent connected to a customer - `talkTime`)
        * AHT (average handling time - `duration`)
        * Disposition outcome reporting (filterable - using `disposition` field)
        * Strike rate (bookings/appointments per call connect - based on `disposition` and connected calls)
    * If using an external BI tool, test the data export and integration process

* **Bitrix24 Automations**

    * **AMD Automation**
        * Test the trigger condition: `ONVOXIMPLANTCALLEND` with `callState` = "ANSWERING_MACHINE"
        * Verify that the actions are executed correctly
            * `subdisposition` is set to "Voicemail"
            * Lead stage is updated based on `answ_machine_attempts` count

    * **Disposition to Lead Stage Mapping Automation**
        * Test the trigger condition: "On Disposition field update"
        * Verify the conditions and actions for each disposition value are implemented correctly, including:
            * Incrementing `answ_machine_attempts` for "No Answer" dispositions
            * Moving leads to the appropriate stages based on disposition and `answ_machine_attempts`
            * Resetting `answ_machine_attempts` when needed

    * **Callback Reminders/Tasks Automation**
        * Test the trigger condition: "On Callback Scheduled field update"
        * Verify that tasks are created or updated correctly with the specified due date and assigned agent
        * Test reminder notifications (if applicable)

    * **"Accidentally Hung Up" Redial Automation**
        * Test the trigger condition: "On Subdisposition field update" with value "Accidentally Hung Up"
        * Verify that the integration initiates an immediate redial
        * Confirm that the lead's "Callback Scheduled" field is updated to a past date/time

**Additional Considerations**

* Test Data: Prepare test data in both Unitalk and Bitrix24 to simulate different call scenarios, outcomes, and agent statuses
* Test Environments: Conduct testing in a staging or sandbox environment before deploying to production
* Performance Testing: If applicable perform load or stress testing to evaluate the integration's performance under high call volumes
* User Feedback: Gather feedback from users during UAT to identify any usability issues or areas for improvement

