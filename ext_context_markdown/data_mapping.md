# Data Mapping

This document outlines the mapping between Unitalk and Bitrix24 data fields.


| Unitalk Field          | Bitrix24 Field           | Notes                                                                         |
| ---------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| `call_id`              | `UF_CRM_1698063422`       | Unitalk Call ID                                                              |
| `inner_phone`          | `ASSIGNED_BY_ID`          | Unitalk Agent ID (mapped to Bitrix24 User ID)                                |
| `status`               | `UF_CRM_1698063462`       | Call status (e.g., "completed", "busy", "noAnswer")                          |
| `duration`             | `UF_CRM_1698063482`       | Call duration in seconds                                                     |
| `amd_result`           | `UF_CRM_1698063501`       | Answering Machine Detection result (e.g., "MACHINE", "HUMAN", "NOT_SURE") |
| `link_to_recording`   | `recordings` (in call details file) | URL of the call recording                                                   |
| `autodialer_id`        | `UF_CRM_1698063520`       | Unitalk Autodialer ID (New custom lead field "Autodialer ID")                |
| N/A                    | `UF_CRM_1698063541`       | Initiative ID (New custom lead field "Initiative ID")                        |
| `realCalledCount` | `answ_machine_attempts` | Number of answering machine attempts (requires synchronization)             |

## Unitalk to Bitrix24 Mapping

| Unitalk Field | Bitrix24 Field | Notes |
|---|---|---|
| `call_id` | `UF_CRM_1698063422` | Unitalk Call ID |
| `status` | `UF_CRM_1698063462` | Call status (e.g., 'completed', 'busy', 'noAnswer') |
| `duration` | `UF_CRM_1698063482` | Call duration in seconds |
| `amd_result` | `UF_CRM_1698063501` | AMD result (e.g., 'MACHINE', 'HUMAN', 'NOT_SURE') |
| `autodialer_id` | `UF_CRM_16980XXXX` | Unitalk Autodialer ID (create a new custom lead field for this) |

## Bitrix24 to Unitalk Mapping

| Bitrix24 Field | Unitalk Field | Notes |
|---|---|---|
| `ID` | `UF_CRM_1698063443` | Bitrix24 Call ID |
| `ASSIGNED_BY_ID` | N/A | Agent ID (handled dynamically in the integration code) |


## Unitalk Webhook Data to Bitrix24 CRM Fields

| Unitalk Webhook Field | Bitrix24 CRM Field | Notes |
|---|---|---|
| `call.id` | `CallID` (custom field) | Stored in the lead record for reference |
| `call.from` | `callerId` (custom field) | Caller's phone number |
| `call.utmSource`, `call.utmMedium`, `call.utmCampaign` | `utmSource`, `utmMedium`, `utmCampaign` (custom fields) | UTM parameters for marketing attribution |
| `call.secondsFullTime` | `duration` (custom field) | Total call duration in seconds |
| `call.secondsTalk` | `talkTime` (custom field) | Agent talk time (conversation duration) in seconds |
| `call.state` | `disposition` (custom field) | Mapped using the `mapCallStateToDisposition` function (see below) |
| `/autodialers/calls/get` API - `secondsClientWaitOperator` | `queueTime` (custom field) | Time spent waiting in the queue |

**Unitalk `callState` to Bitrix24 `disposition` Mapping**

| Unitalk `callState` | Bitrix24 `disposition` | Automation Trigger/Action |
|---|---|---|
| `ANSWER` | *(No disposition update, handled by agent)* | - |
| `NOANSWER`, `BUSY`, `ANSW_RJCT`, `ANSW_NF_OP`, `ANSW_OP_NA`, `UNREACHABLE` | `No Answer (incremented count)` | If `answ_machine_attempts` reaches threshold, move lead to "Failed" pipeline |
| `ANSWERING_MACHINE` | `No Answer (1)` | Same as above |
| `FAIL`, `BUSYOUT`, `AUDIO_ERR`, `WRONG_DIR` | *(No disposition update, log as technical issue)* | - |
| `CLIENT_CALLED` | `Callback` | Create callback task and notification |
| `CANCEL`, `AUTOCANCEL` | `No Call Made` | - |
| `NOT_EXIST` | `Broken` | - |
| *other* | `Unknown` | - |

**Additional Notes**

*   Ensure the custom fields in Bitrix24 are created with the correct field types and IDs.
*   The `recordings` field is an array within the call details JSON file stored in Bitrix24 Drive.
*   Synchronize `realCalledCount` with `answ_machine_attempts` when adding numbers to Unitalk.
*   This mapping table represents the current understanding of the data mapping between Unitalk and Bitrix24
*   It might need to be adjusted or expanded as you gain more insights into the actual webhook payloads and API responses during development and testing
*   Ensure that the field names and values in this table match your actual Bitrix24 CRM setup and automation configurations
*    Ensure that the field IDs in the mapping table match the actual field IDs in your Bitrix24 CRM.
*    You might need to adjust the mapping based on your specific CRM structure and requirements.
