# Data Mapping: Unitalk & Bitrix24 Integration

This document defines the mapping between Unitalk's call data/events and the corresponding fields or parameters in Bitrix24 CRM and automation workflows.

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

*   This mapping table represents the current understanding of the data mapping between Unitalk and Bitrix24
*   It might need to be adjusted or expanded as you gain more insights into the actual webhook payloads and API responses during development and testing
*   Ensure that the field names and values in this table match your actual Bitrix24 CRM setup and automation configurations

