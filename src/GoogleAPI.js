import gapi from 'gapi-client';

class GoogleAPI {
    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    constructor(client_id, discovery_docs, scopes) {
      return gapi.load('client:auth2', () => {
        return gapi.client.init({
          discoveryDocs: discovery_docs,
          clientId: client_id,
          scope: scopes
        });
      });
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
