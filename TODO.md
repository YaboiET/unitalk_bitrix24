## TODO List

This file tracks the outstanding tasks for the Unitalk and Bitrix24 integration project

| Task | Status | Assigned To |
|---|---|---|
| Complete implementation of API interactions in `bitrix24Api.js` | Not Started | |
| Set up and test Bitrix24 webhooks | Not Started | |
| Reconfigure Unitalk's native Bitrix24 integration | Not Started | |
| SIP Connector Configuration and trunking setup | Not Started | |
| Configure Unitalk Admin Panel | Not Started | |
| Configure Bitrix24 | Not Started | |
| Complete Local Bitrix24 App setup | Not Started | |
| Implement Data Storage in Bitrix24 Drive | Not Started | |
| Explore Bitrix24's reporting capabilities | Not Started | |
| Define detailed call flow & stages | Not Started | |
| Design call screens for each stage | Not Started | |
| Fill Placeholders | Not Started | |
| Address additional edge cases & security | Not Started | |
| Decide on ngrok/Render for development/testing | Not Started | |
| Thorough Testing | Not Started | |
| Deployment | Not Started | |



# TODO

**High Priority (Core Functionality)**

- [x] Implement Unitalk webhook handlers for:
    - [x] `onCallCreated` (initiate outbound calls, update CRM, store call data)
    - [x] `onCallAnswered` (update CRM, potentially trigger automations)
    - [x] `onCallEnded` (update CRM with call outcome, calculate duration, trigger automations)
    - [x] `onCallRecordingFinished` (store recording URL in Bitrix24 Drive)
- [x] Implement Bitrix24 webhook handlers for:
    - [x] `ONVOXIMPLANTCALLSTART` (update agent status in Unitalk)
    - [x] `ONVOXIMPLANTCALLEND` (update agent status in Unitalk)
- [x] Implement essential Bitrix24 API interactions:
    - [x] `telephony.getstatus` (retrieve agent telephony status)
    - [x] `timeman.status.current` (check if agent is clocked in)
    - [x] `crm.lead.update` (update CRM records with call details)
    - [x] `voximplant.queue.get` (retrieve queue information)
    - [x] `bizproc.automation.trigger` (trigger automations based on call outcomes)
    - [ ] `voximplant.user.get` (fetch user's SIP credentials dynamically)
- [x] Implement Unitalk API interactions:
    - [x] `/phones/inner/setStatus` (update agent status)
    - [x] `/autodial/action` with action: 'GET_CALLS_HISTORY' (fetch additional call data, including queue time)
- [x] Implement data storage functions in `data.js`:
    - [x] Store call details and association in Bitrix24 Drive
- [ ] Implement dynamic queue assignment logic:
    - [ ] Subscribe to Unitalk's WebSocket for real-time agent status updates
    - [ ] Add/remove agents from Bitrix24 queues based on available lines and campaign assignments
    - [ ] Handle overflow scenarios
    - [ ] Update agent assignments in the external mapping table

**Medium Priority (Additional Features & Refinements)**

- [ ] Implement `crm.activity.add` for creating CRM activities
- [ ] Implement error handling and retry mechanisms as outlined in `ERROR_HANDLING.md`
- [ ] Thoroughly test all implemented functionalities
- [ ] Set up basic logging and monitoring

**Low Priority (Future Enhancements)**

- [ ] Explore additional Bitrix24 webhook events for potential integration
- [ ] Implement more advanced reporting and analytics using Bitrix24's BI builder or external tools
- [ ] Optimize code for performance and scalability
- [ ] Add comprehensive documentation and comments