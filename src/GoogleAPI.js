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

    createAppFolder = (appName) => {
      return gapi.client.drive.files.create({
        resource: {
          'name' : appName,
          'mimeType' : 'application/vnd.google-apps.folder'
        }
      });
    }

    getAppFolderID = (appName) => {
      return gapi.client.drive.files.list({
        q: 'not trashed and mimeType="application/vnd.google-apps.folder" and name ="' + appName + '"'
      });
    }

    createNewFile = (parentFolderId, fileName) => {
      var reqOpts = {
        'path': '/drive/v3/files',
        'method': 'POST',
        'body': {
          'parents': [parentFolderId],
          'mimeType': 'text/plain',
          'name': fileName
        }
      };
      return gapi.client.request(reqOpts);
    }

    /**
     * list files w/ extension [ext].
     */
    getRecentFilesByExt = (ext) => {
      return gapi.client.drive.files.list({
        fields: "files(id, name)",
        q: 'not trashed and fileExtension="' + ext + '"',
        pageSize: 6,
      });
    }

    getAppDataFileID = (appDataFilename) => {
      return gapi.client.drive.files.list({
        q: 'not trashed and name="' + appDataFilename + '"',
        spaces: 'appDataFolder'
      });
    }

    createAppDataFile = (appDataFilename) => {
      return gapi.client.drive.files.create({
        resource: {
          name: appDataFilename,
          parents: ['appDataFolder']
        }
      });
    }

    getAppDataFileContent = (fileId) => {
      return gapi.client.drive.files.get({
        fileId: fileId,
        // Download a file — files.get with alt=media file resource
        alt: 'media'
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
}

export default GoogleAPI;
