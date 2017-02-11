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

      return gapi.load('client:auth2', () => {
        return gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
          clientId: CLIENT_ID,
          scope: SCOPES
        });
      });
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    updateSigninStatus = (isSignedIn) => {
      if (isSignedIn) {
        return true;
      } else {
        return false;
      }
    }

    /**
     *  Sign in the user upon button click.
     */
    signIn = (event) => {
      return gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    signOut = (event) => {
      return gapi.auth2.getAuthInstance().signOut();
    }

    /**
     * list files.
     */
    getFiles = () => {
      return gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': "nextPageToken, files(id, name)"
      });
    }

    getAppDataFileID = () => {
      return gapi.client.drive.files
        .list({
          q: 'name="pyret-teacher-dashboard.json"',
          spaces: 'appDataFolder',
          fields: '*'
        }).then((data) => {
            // console.log(data);
            return data.result.files[0].id;
          }
        );
    }

    createAppDataFile = () => {
      return gapi.client.drive.files
        .create({
          resource: {
            name: 'pyret-teacher-dashboard.json',
            parents: ['appDataFolder']
          },
          fields: 'id'
        }).then((data) => {
          return {
            fileId: data.result.id
          };
        });
    }

    getAppDataFileContent = (fileId) => {
      return gapi.client.drive.files
        .get({
          fileId: fileId,
          // Download a file — files.get with alt=media file resource
          alt: 'media'
        }).then((data) => {
          return {
            fileId: fileId,
            appData: data.result
          };
        });
    }

    saveAppData = (fileId, appData) => {
      return gapi.client.request({
        path: '/upload/drive/v3/files/' + fileId,
        method: 'PATCH',
        params: {
          uploadType: 'media'
        },
        body: JSON.stringify(appData)
      });
    }

    updateAppDataParams  = (key, value) => {
      this.getAppDataFileID().then((fileID) => {
        this.getAppDataFileContent(fileID).then((resp) => {
          const data = resp.appData;
          data[key] = value;
          this.saveAppData(fileID, data).then((resp) => {
            // this.getAppDataFileContent(fileID).then((resp) => {
              // console.log(resp);
            // });
          });
        });
      }, (reason) => {
        this.createAppDataFile();
      });
    }
}

export default GoogleAPI;
