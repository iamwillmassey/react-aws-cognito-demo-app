# React / AWS Cognito Demo App
Basic React client to interact with an AWS Cognito User Pool, allowing you to experiment with creating new users, verifing the account and logging into the account / accessing account information.

Note, the React boilerplate was created with the Facebook `create-react-app` initializer.  
Also note, most of the code comes from a combination of an on-line tutorial, and AWS provided resources with examples (see Resources, below).

# Pre-requisites
* npm v5.2+
* [AWS account](https://aws.amazon.com)
  - Cognito User Pool details needed in App.js

# Running the app
* `npm install`
* `npm start`

# Testing

Basic steps to test the registration and auth flows.

* Create new email address
  - Use [Guerrilla Mail](https://www.guerrillamail.com/) to create temporary email accounts for testing
* Fill in the email and password fields to Register
* Wait for the verification code to confirm the account
* Once confirmed, login with the same details
* Get User Attributes will load some details about the account
* Logout will log the user out locally
  - Confirmed by trying to get the user attributes again

Note, as this is a very basic app, any messaging i.e. success, errors, etc. is only available within the browser console log.
  
# Resources
1. [facebook/create-react-app](https://github.com/facebook/create-react-app/blob/master/README.md#creating-an-app)
2. [API Authentication with Amazon Cognito (YouTube tutorial)](https://www.youtube.com/watch?v=TowcW1aTDqE&t=1047s)
3. [Using Amazon Cognito with JavaScript (Code examples)](https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html)
