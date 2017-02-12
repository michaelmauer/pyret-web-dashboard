import gapi from 'gapi-client';

class GoogleAPI {
    /**
     *  Load the client library. Return a promise to allow .then() in caller
     */
    load = (clientId, discoveryDocs, scope) => {
      return new Promise(function(resolve, reject) {
        gapi.load('client:auth2', function () {
          return gapi.client.init({
            discoveryDocs: discoveryDocs,
            clientId: clientId,
            scope: scope
          }).then(function () {
            resolve();
          });
        });
      });
    }

    isSignedIn = () => {
      return gapi.auth2.getAuthInstance().isSignedIn.get();
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
        pageSize: 10,
        fields: "nextPageToken, files(id, name)"
      });
    }

    /**
     * list files w/ extension [ext].
     */
    getFilesByExt = (ext) => {
      return gapi.client.drive.files.list({
        pageSize: 10,
        fields: "nextPageToken, files(id, name)",
        q: 'fileExtension="' + ext + '"'
      });
    }

    getAppDataFileID = (appDataFilename) => {
      return gapi.client.drive.files
        .list({
          q: 'name="' + appDataFilename + '"',
          spaces: 'appDataFolder',
          fields: '*'
        }).then((data) => {
            return data.result.files[0].id;
          }
        );
    }

    createAppDataFile = (appDataFilename) => {
      return gapi.client.drive.files
        .create({
          resource: {
            name: appDataFilename,
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
      return gapi.client.drive.files.update({
        path: '/upload/drive/v3/files/' + fileId,
        method: 'PATCH',
        params: {
          uploadType: 'media'
        },
        body: JSON.stringify(appData)
      });
    }

    updateAppDataParams = (key, value) => {
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
