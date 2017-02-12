import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';
import {CLIENT_ID, DISCOVERY_DOCS, SCOPES, FILE_EXT, APP_NAME, AUTH_FLOW} from './config.js';
import File from './File';
import {EDITOR_REDIRECT_URL} from './config.js';

class App extends Component {
  constructor() {
    super();

    if (AUTH_FLOW === 'client') {
      this.api = new GoogleAPI();
      this.api.load(CLIENT_ID, DISCOVERY_DOCS, SCOPES).then(this.apiLoaded);
    }
  }

  componentWillMount = () => {
    this.setState({apiLoaded: false, signedIn: false, files: [], newFileName: ''});
  }

  apiLoaded = () => {
    this.setState({apiLoaded: true});
    if (this.api.isSignedIn()) {
      this.setState({signedIn: true});
      this.updateRecentFiles();
    }
  }

  handleSignInClick = (event) => {
    this.api.signIn().then(() => {
      this.setState({signedIn: true});
      this.updateRecentFiles();
    });
  }

  handleSignOutClick = (event) => {
    this.api.signOut().then(() => {
      this.setState({signedIn: false});
    });
  }

  updateRecentFiles = () => {
    this.api.getRecentFilesByExt(FILE_EXT).then((resp) => {
      this.setState({files: resp.result.files});
    });
  }

  handleNewFilenameChange = (event) => {
    this.setState({newFileName: event.target.value});
  }

  handleCreateNewFile = (event) => {
    event.preventDefault();
    if (this.state.newFileName) {
      this.api.getAppFolderID(APP_NAME).then((resp) => {
        var files = resp.result.files;

        // App Folder did not yet exist
        if (files.length === 0) {
          this.api.createAppFolder(APP_NAME).then((resp) => {
            return this.api.createNewFile(resp.result.id, this.state.newFileName + '.arr').then((resp)=> {
              window.location.assign(EDITOR_REDIRECT_URL + resp.result.id);
            });
          });
        }

        // App Folder already existed
        else {
          return this.api.createNewFile(files[0].id, this.state.newFileName + '.arr').then((resp) => {
            console.log(resp);
            window.location.assign(EDITOR_REDIRECT_URL + resp.result.id);
          });
        }
      });
    }
  }

  render = () => {
    return (
      <div className='body-wrap'>
        <div id='header' className=''>
          <div className='container cf'>
            <h1 className='logo-text'>{APP_NAME} – Web Dashboard</h1>
            <div className='auth-button-wrapper'>
              <button className={'auth-button ' + (this.state.signedIn ? 'hidden' : '')} onClick={this.handleSignInClick} id="signin-button" >Sign in</button>
            </div>
            <div className='auth-button-wrapper'>
              <button className={'auth-button ' + (this.state.signedIn ? '' : 'hidden')} onClick={this.handleSignOutClick} id="signout-button" >Sign out</button>
            </div>
          </div>
        </div>
        <i id='loading-spinner' className={"fa fa-circle-o-notch fast-spin fa-3x fa-fw " + (this.state.apiLoaded ? 'hidden' : '')}></i>
        <div className={'content-wrap container ' + (this.state.apiLoaded ? '' : 'hidden')}>
          <div id="inject" className={'welcome ' + (this.state.signedIn ? 'hidden' : '')}>
            <h1 className='inverted'>Welcome</h1>
          </div>
          <div id="inject" className={this.state.signedIn ? '' : 'hidden'}>
            <h1 className='inverted'>Select an option:</h1>
            <div id="recent-files" className={'file-option ' + ((this.state.files.length > 0) ? '' : 'hidden')}>
              <h2>Open a recent file:</h2>
              {this.state.files.map((f) => {return <File key={f.id} id={f.id} name={f.name} />})}
            </div>
            <div id="new-file" className='file-option'>
              <h2>Create a new file:</h2>
              <form onSubmit={this.handleCreateNewFile}>
                <div>
                  <input className="form block centered" type="text" value={this.state.newFileName} onChange={this.handleNewFilenameChange} /><span>.arr</span>
                </div>
                <input className="button " type="submit" value="New file" />
              </form>
            </div>
            <div id="pick-file" className='file-option'>
              <h2>Select a file from Google Drive:</h2>
              <button className='' onClick={this.handleSelectFileClick} >Select File</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
