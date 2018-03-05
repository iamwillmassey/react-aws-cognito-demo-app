import React, { Component } from 'react';
import AWS from 'aws-sdk';
import { AuthenticationDetails, CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showError: false,
      userPoolId: '', // Populate with details from AWS Console
      clientId: '', // Populate with details from AWS Console
      identityPoolId : '', // Populate with details from AWS Console
      aws_region: '' // Populate with details from AWS Console
    }
  }

  render() {
    return (
      <div className="App">
        {this.state.showError && <div className="error-message">Oops! Email Address already used!</div>}
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          Fill in the details below to create a new user account
        </p>
        <input type="email" placeholder="email" ref={(input) => {this.email = input}} /><br />
        <input type="password" placeholder="password" ref={(input) => {this.password = input}} /><br />
        <button onClick={(e) => this.doRegister(e)}>Register</button>
        <button onClick={(e) => this.doLogin(e)}>Login</button>
        <br /><hr />
        <p className="App-intro">
          Confirm your account
        </p>
        <input type="text" placeholder="verificationCode" ref={(input) => {this.verificationCode = input}} /><br />
        <button onClick={(e) => this.doConfirmUser(e)}>Confirm</button>
        <br /><hr />
        <p className="App-intro">
          If you did not receive a confirmation code, request it again
        </p>
        <button onClick={(e) => this.resendConfirmationCode()}>Resend Confirmation Code</button>
        <br /><hr />
        <p className="App-intro">
          Get user attributes
        </p>
        <button onClick={(e) => this.getUserAttributes()}>Get User Attributes</button>
        <br /><hr />
        <p className="App-intro">
          User logout
        </p>
        <button onClick={(e) => this.doLogout()}>Logout</button>
      </div>
    );
  }

  componentDidMount() {
    this.loadAuthenticatedUser();
  }

  doLogout() {
    var cognitoUser = this.getCognitoUserPool().getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.signOut();
      console.log("User logged out!")
    }
  }

  loadAuthenticatedUser() {
    console.log("Loading auth user...");

    var cognitoUser = this.getCognitoUserPool().getCurrentUser();

    if (cognitoUser != null) {
      console.log("User found!");
      cognitoUser.getSession(function(err, session) {
        if (err) {
          console.error(err);
        } else {
          var creds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : this.state.identityPoolId,
            Logins : {
               // Populate with details from AWS Console
              '': session.getIdToken().getJwtToken()
            }
          },{
            region: this.state.aws_region
          });
          console.log(`Creds: ${creds}`);
          creds.refresh(function(err, data) {
            if (err) {
              console.error(err);
            } else {
              console.log(`credentials refreshed! ${creds}`);
            }
          });
        }
      });
    }
  }

  getUserAttributes() {
    var cognitoUser = this.getCognitoUserPool().getCurrentUser();

    if (cognitoUser != null) {
      console.log("User found!");
      cognitoUser.getSession(function(err, session) {
        if (err) {
          console.error(err);
        } else {
          console.log(`session validity: ${session.isValid()}`);
          cognitoUser.getUserAttributes(function(err, attributes) {
            if (err) {
              console.error(err);
            } else {
              for (var i = 0; i < attributes.length; i++) {
                console.log(`attribute ${attributes[i].getName()} has value ${attributes[i].getValue()}`);
              }
            }
          });
        }
      });
    } else {
      console.log("User not found!");
    }
  }

  doLogin() {
    var authenticationData = {
      Username : this.email.value,
      Password : this.password.value
    };
    var authenticationDetails = new AuthenticationDetails(authenticationData);

    this.getCognitoUser().authenticateUser(authenticationDetails, {
      onSuccess: function(result) {
        console.log(`access token ${result.getAccessToken().getJwtToken()}`)
      },
      onFailure: function(err) {
        console.error(`Login error: ${err}`);
      }
    })
  }

  toggleError() {
    this.setState((prevState, props) => {
      return { showError : !prevState.showError }
    });
  }

  doRegister(event) {
    var self = this;
    var userPool = this.getCognitoUserPool();
    var email = this.email.value;
    var password = this.password.value;

    console.log(`Register user: ${email} ${password}`)

    var attributeList = [];

    var dataEmail = {
      Name : 'email',
      Value : email
    };

    var attributeEmail = new CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    userPool.signUp(email, password, attributeList, null, function(err, result) {
      if (err) {
        console.error(err);
        self.toggleError();
      } else {
        var cognitoUser = result.user;
        console.log('user registered as ' + cognitoUser.getUsername());
      }
    });
  }

  doConfirmUser(event) {
    this.getCognitoUser().confirmRegistration(this.verificationCode.value, true, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        console.log(`result ${result}`);
      }
    });
  }

  resendConfirmationCode(event) {
    this.getCognitoUser().resendConfirmationCode(function(err, result) {
      if (err) {
        console.error(err);
      } else {
        console.log(`resend result: ${result}`)
      }
    });
  }

  getCognitoUserPool() {
    var poolData = {
      UserPoolId: this.state.userPoolId,
      ClientId: this.state.clientId
    };

    return new CognitoUserPool(poolData);
  }

  getUserSessionFromLocalStorage() {
    var cognitoUser = this.getCognitoUserPool().getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession(function(err, session) {
        if (err) {
          console.error(`getUserFromLocalStorage: ${err}`);
          return null;
        } else {
          console.log(`getUserFromLocalStorage: session validity: ${session.isValid()}`);
          return session;
        }
      });
    }
  }

  getCognitoUser() {
    var userPool = this.getCognitoUserPool();

    var userData = {
      Username : this.email.value,
      Pool : userPool
    }

    var cognitoUser = new CognitoUser(userData);

    return cognitoUser;
  }
}

export default App;
