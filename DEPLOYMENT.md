# Deployment Instructions: Unitalk & Bitrix24 Integration

This document outlines the steps and configurations required to deploy the Unitalk & Bitrix24 integration to a production environment using Render.

## Prerequisites

* Node.js and npm installed on your local machine
* A Bitrix24 account with:
    * Necessary permissions for the integration (Telephony, Telephony (outbound calls), Data storage, CRM)
    * SIP connector configured and activated
    * Unitalk's native Bitrix24 integration enabled
    * Webhooks created for `ONVOXIMPLANTCALLSTART` and `ONVOXIMPLANTCALLEND` events
    * Automation rules set up for handling AMD and other call outcomes
* A Unitalk account with:
    * API access and configured webhooks for `onCallCreated`, `onCallAnswered`, `onCallEnded`, and `onCallRecordingFinished`
    * SIP trunking configured with Bitrix24 Voximplant credentials
    * Caller ID set to the Bitrix24 Voximplant Australian number in "Outgoing Scenarios"

## Deployment Steps

1. **Set up Render Account and Project**

* Create a free account on Render: [https://render.com/](https://render.com/)
* Create a new "Web Service" project.
* Connect your GitHub repository to the project.

2. **Configure Environment Variables**

* In your Render project settings, navigate to the "Environment" section
* Add the following environment variables, replacing the placeholders with your actual values from your `.env` file:
    * `PORT`: The port your Node.js application will listen on (e.g., `3000`)
    * `UNITALK_API_KEY`
    * `BITRIX24_CLIENT_ID`
    * `BITRIX24_CLIENT_SECRET`
    * `BITRIX24_REDIRECT_URI`: Update this with the actual callback URL on your production server (e.g., `https://your-render-app-name.onrender.com/callback`)
    * `BITRIX24_API_URL`
    * `BITRIX24_WEBHOOK_SECRET` (if applicable)

3. **Build and Deploy**

* Commit and push any final changes to your GitHub repository
* In your Render project, trigger a new deployment
* Render will automatically build your Node.js application and deploy it to a live URL

4. **Update Webhook URLs**

* In your Unitalk account settings, update the webhook URL for the relevant events to point to your Render app's webhook endpoint (e.g., `https://your-render-app-name.onrender.com/webhooks/unitalk`)
* In your Bitrix24 webhook settings, update the "Handler URL" for the webhooks you created to point to your Render app's Bitrix24 webhook endpoint (e.g., `https://your-render-app-name.onrender.com/webhooks/bitrix24`)

5. **Test and Validate**

* Thoroughly test the integration in the production environment to ensure all functionalities are working as expected.
* Monitor logs and error reports for any issues

## Additional Considerations

* **Bitrix24 Drive:** We're currently using Bitrix24 Drive for data storage. If you anticipate large data volumes or complex querying needs in the future, consider migrating to a dedicated database solution (e.g., PostgreSQL on Render) and update these instructions accordingly
* **Security:** Implement appropriate security measures to protect your application and data in production
    * Use HTTPS to encrypt data in transit
    * Implement input validation and sanitization to prevent vulnerabilities
    * Securely store API credentials and other sensitive information
* **Monitoring and Maintenance:**
    * Set up monitoring and alerting to proactively identify and address any issues in production
    * Regularly review logs and error reports
    * Keep your Node.js dependencies and Bitrix24/Unitalk API versions up-to-date

* **Scalability:** If your integration needs grow, consider Render's paid plans to scale your resources as needed. Refer to Render's pricing page for details

**Remember to replace placeholders with your actual values and customize these instructions further based on any specific configurations or optimizations you implement**