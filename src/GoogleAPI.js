import gapi from 'gapi-client';

class GoogleAPI {
    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    constructor() {
    // Client ID and API key from the Developer Console
    const CLIENT_ID = '616482134011-3hnr36kvc6jeh1dfojv3gblj8bu7i6b7.apps.googleusercontent.com';

    // Array of API discovery doc URLs for APIs used by the quickstart
    const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

      gapi.load('client:auth2', function() {
        gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
          clientId: CLIENT_ID,
          scope: SCOPES
        }).then(function() {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

          // Handle the initial sign-in state.
          this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        });
      });
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    updateSigninStatus(isSignedIn) {
      if (isSignedIn) {
        // authorizeButton.style.display = 'none';
        // signoutButton.style.display = 'block';
        this.listFiles();
        this.getAppDataFileID().then(function(fileID) {
          this.saveAppData(fileID, {'test': 'test'}).then(function() {
            this.getAppDataFileContent(fileID).then(function(r) {
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
    signIn(event) {
      gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    signOut(event) {
      gapi.auth2.getAuthInstance().signOut();
      document.getElementById('content').innerHTML = '';
    }

    /**
     * Append a pre element to the body containing the given message
     * as its text node. Used to display the results of the API call.
     *
     * @param {string} message Text to be placed in pre element.
     */
    appendPre(message) {
      const pre = document.getElementById('content');
      const textContent = document.createTextNode(message + '\n');
      pre.appendChild(textContent);
    }

    /**
     * Print files.
     */
    listFiles() {
      gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': "nextPageToken, files(id, name)"
      }).then(function(response) {
        this.appendPre('Files:');
        return response.result.files;
      });
    }

    getAppDataFileID() {
      return gapi.client.drive.files
        .list({
          q: 'name="pyret-teacher-dashboard.json"',
          spaces: 'appDataFolder',
          fields: '*'
        }).then(
          function(data) {
            console.log(data);
            return data.result.files[0].id;
          }
        );
    };

    createAppDataFile() {
      return gapi.client.drive.files
        .create({
          resource: {
            name: 'pyret-teacher-dashboard.json',
            parents: ['appDataFolder']
          },
          fields: 'id'
        }).then(function(data) {
          return {
            fileId: data.result.id
          };
        });
    };

    getAppDataFileContent(fileId) {
      return gapi.client.drive.files
        .get({
          fileId: fileId,
          // Download a file — files.get with alt=media file resource
          alt: 'media'
        }).then(function(data) {
          return {
            fileId: fileId,
            appData: data.result
          };
        });
    };

    saveAppData(fileId, appData) {
      return gapi.client.request({
        path: '/upload/drive/v3/files/' + fileId,
        method: 'PATCH',
        params: {
          uploadType: 'media'
        },
        body: JSON.stringify(appData)
      });
    };

    updateAppDataParams (key, value) {
      this.getAppDataFileID().then(function(fileID) {
        this.getAppDataFileContent(fileID).then(function(resp) {
          const data = resp.appData;
          data[key] = value;
          this.saveAppData(fileID, data).then(function(resp) {
            this.getAppDataFileContent(fileID).then(function(resp) {
              console.log(resp);
            });
          });
        });
      }, function(reason) {
        console.log('error, creating');
        this.createAppDataFile();
      });
    }
}

export default GoogleAPI;
