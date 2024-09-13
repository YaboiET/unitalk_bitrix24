# API Notes

This file documents important notes, clarifications, and potential gotchas related to the Unitalk and Bitrix24 APIs used in this integration project.

## Unitalk API

* **Caller ID in SIP INVITE:**
    * Unitalk documentation on SIP trunking: [https://unitalk.cloud/services/sip-trunck/](https://unitalk.cloud/services/sip-trunck/)
    * It suggests that the caller ID set in the "Outgoing Scenarios" tab will be included in the SIP INVITE request. 
    * This will be thoroughly tested during implementation.
    * If needed, we can use the `/direct-sip-call` endpoint as a fallback to explicitly set the caller ID: [https://unitalk.cloud/api-references/#direct-sip-call----gsm](https://unitalk.cloud/api-references/#direct-sip-call----gsm)

* **Queue Time Data:**
    * We'll attempt to use the `secondsClientWaitOperator` field from the `/autodialers/calls/get` API response to capture queue time: [https://unitalk.cloud/api-references/#obtaining-information-about-autodialer-calls](https://unitalk.cloud/api-references/#obtaining-information-about-autodialer-calls).
    * If this doesn't work as expected, we'll explore alternative approaches or seek further clarification from Unitalk support.

* **Disposition Outcome Mapping:**
    * We'll leverage the native Unitalk-Bitrix24 connector to map `callState` to the custom disposition field in Bitrix24 CRM.
    * Refer to the `callState` dictionary in Unitalk's documentation for possible values and their meanings: [https://unitalk.cloud/api-references/#callstate](https://unitalk.cloud/api-references/#callstate).

* **Other Notes:**
    * *(Add any other important observations or clarifications about the Unitalk API here as you encounter them during development)*

## Bitrix24 API

* **Telephony Statuses for Agent Status Synchronization:**
    * We'll use the `telephony.getstatus` endpoint to retrieve agent statuses: [https://training.bitrix24.com/rest_help/scope_telephony/telephony/index.php](https://training.bitrix24.com/rest_help/scope_telephony/telephony/index.php)
    * The `BUSY` status indicates the agent is on a call, and `READY` indicates they are available.
    * We'll need to confirm with Bitrix24 support if there are any specific webhook events or other mechanisms to get real-time updates on these statuses

* **Reporting and Analytics:**
    * We'll leverage the existing dataset and table in Bitrix24's BI builder for disposition outcome reporting
    * We'll explore Bitrix24's reporting capabilities further to see if other metrics can be generated with minimal customization. If needed, we'll consider integrating with an external BI tool. 
    * Relevant documentation:
        * Bitrix24 BI Analytics: [https://training.bitrix24.com/support/training/course/index.php?COURSE_ID=142](https://training.bitrix24.com/support/training/course/index.php?COURSE_ID=142)
        * Bitrix24 REST API (for potential custom report development): [https://training.bitrix24.com/rest_help/](https://training.bitrix24.com/rest_help/)

* **Other Notes:**
    * *(Add any other important observations or clarifications about the Bitrix24 API here)*