# DEPLOYMENT.md

## Deployment on Heroku

This document outlines the steps for deploying the Unitalk-Bitrix24 integration on Heroku.

## Deployment Platform

We will deploy the integration on **Heroku**. Heroku is a cloud platform as a service (PaaS) that allows us to easily deploy, manage, and scale our application.


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
    *   A Heroku account
*   The Heroku CLI installed
*   A Git repository containing the integration code

## Initial Deployment Steps

1. **Create a Heroku account:** If you don't already have one, sign up for a free Heroku account.
2. **Install the Heroku CLI:** Follow the instructions on the Heroku website to install the Heroku CLI on your local machine.
3. **Create a Heroku app:** Use the Heroku CLI to create a new Heroku app for your integration.
4. **Set up environment variables:** Configure the necessary environment variables for your app on Heroku, including API keys, secrets, and other sensitive information.
5. **Deploy the code:** Push your code to the Heroku Git repository to deploy the integration.
6. **Verify the deployment:** Check the logs and verify that the integration is running correctly on Heroku.


**Deployment Tech Steps**

1.  Initialize a Git repository in your project directory:

    ```bash
    git init
    ```

2.  Commit your code to the repository:

    ```bash
    git add .
    git commit -m "Initial commit"
    ```

3.  Create a Heroku app:

    ```bash
    heroku create
    ```

4.  Deploy the code to Heroku:

    ```bash
    git push heroku main
    ```

5.  Configure environment variables in Heroku:

    *   `BITRIX24_WEBHOOK_URL`: The URL of your Bitrix24 webhook endpoint.
    *   `UNITALK_API_KEY`: Your Unitalk API key.
    *   `BITRIX24_DRIVE_FOLDER_ID`: The ID of the folder in Bitrix24 Drive where you want to store call data.

6.  Scale the app to one dyno:

    ```bash
    heroku ps:scale web=1
    ```

7.  Verify the deployment:

    *   Open the Heroku app in your browser.
    *   Check the logs for any errors:

        ```bash
        heroku logs --tail
        ```

        
## Additional Considerations

* **Bitrix24 Drive:**
    *    We're currently using Bitrix24 Drive for data storage. If you anticipate large data volumes or complex querying needs in the future, consider migrating to a dedicated database solution and update these instructions accordingly

* **Security:** 
    *   Implement appropriate security measures to protect your application and data in production
    *   Use HTTPS to encrypt data in transit
    *   Implement input validation and sanitization to prevent vulnerabilities
    *   Securely store API credentials and other sensitive information
    Heroku offers various security features to protect our application and data.
* **Monitoring and Maintenance:**
    *   Set up monitoring and alerting to proactively identify and address any issues in production
    *   Regularly review logs and error reports
    *   Keep your Node.js dependencies and Bitrix24/Unitalk API versions up-to-date
    *   Heroku provides monitoring tools to track the performance and health of our application.

* **Scalability:** 
    *   If your integration needs grow, consider Render's paid plans to scale your resources as needed. Refer to Render's pricing page for details
    *   Heroku allows us to easily scale our application as needed to handle increased traffic or workload.


*   You might need to configure additional settings in Heroku based on your specific requirements, such as database connections or custom domains.
*   Refer to the Heroku documentation for more detailed information on deployment and configuration.


**Remember to replace placeholders with actual values!**

## Deployment Checklist

* [ ] Create a Heroku account
* [ ] Install the Heroku CLI
* [ ] Create a Heroku app
* [ ] Set up environment variables
* [ ] Deploy the code
* [ ] Verify the deployment
