import React, { Component } from 'react';
import './App.css';
import gapi from 'gapi-client';

// Client ID and API key from the Developer Console
var CLIENT_ID = '616482134011-3hnr36kvc6jeh1dfojv3gblj8bu7i6b7.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    // authorizeButton.style.display = 'none';
    // signoutButton.style.display = 'block';
    listFiles();
    getAppDataFileID().then(function(fileID) {
      saveAppData(fileID, {'test': 'test'}).then(function () {
        getAppDataFileContent(fileID).then(function (r) {
          document.getElementById('content').innerHTML += JSON.stringify(r);
        });
      });
    });
  } else {
    // authorizeButton.style.display = 'block';
    // signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
  document.getElementById('content').innerHTML = '';
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/**
 * Print files.
 */
function listFiles() {
  gapi.client.drive.files.list({
    'pageSize': 10,
    'fields': "nextPageToken, files(id, name)"
  }).then(function(response) {
    appendPre('Files:');
    var files = response.result.files;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        appendPre(file.name + ' (' + file.id + ')');
      }
    } else {
      appendPre('No files found.');
    }
  });
}

function getAppDataFileID() {
  return gapi.client.drive.files
    .list({
      q: 'name="pyret-teacher-dashboard.json"',
      spaces: 'appDataFolder',
      fields: '*'
    }).then(
      function (data) {
        console.log(data);
        return data.result.files[0].id;
      }
    );
};

function createAppDataFile() {
  return gapi.client.drive.files
    .create({
      resource: {
        name: 'pyret-teacher-dashboard.json',
        parents: ['appDataFolder']
      },
      fields: 'id'
    }).then(function (data) {
      return {
        fileId: data.result.id
      };
    });
};

function getAppDataFileContent(fileId) {
  return gapi.client.drive.files
    .get({
      fileId: fileId,
      // Download a file — files.get with alt=media file resource
      alt: 'media'
    }).then(function (data) {
      return {
        fileId: fileId,
        appData: data.result
      };
    });
};

function saveAppData(fileId, appData) {
  return gapi.client.request({
    path: '/upload/drive/v3/files/' + fileId,
    method: 'PATCH',
    params: {
      uploadType: 'media'
    },
    body: JSON.stringify(appData)
  });
};

function updateAppDataParams (key, value) {
  getAppDataFileID().then(function(fileID) {
    getAppDataFileContent(fileID).then(function(resp) {
      var data = resp.appData;
      data[key] = value;
      saveAppData(fileID, data).then(function(resp) {
        getAppDataFileContent(fileID).then(function(resp) {
          console.log(resp);
        });
      });
    });
  }, function(reason) {
    console.log('error, creating');
    createAppDataFile();
  });
}

class App extends Component {
  render() {
    return (
      <div>
        <p>Drive API Quickstart</p>
        <button onClick={handleAuthClick} id="authorize-button" >Authorize</button>
        <button onClick={handleSignoutClick} id="signout-button" >Sign Out</button>
        <pre id="content"></pre>
      </div>
    );
  }
  componentDidMount() {
    gapi.load('client:auth2', initClient);
  }
}

export default App;
