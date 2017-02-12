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
    this.setState({apiLoaded: false, signedIn: false, files: []});
  }

  apiLoaded = () => {
    console.log('apiloaded');
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
    this.api.getFilesByExt(FILE_EXT).then((resp) => {
      this.setState({files: resp.result.files});
    });
  }

  handleNewFileClick = () => {
    window.open(EDITOR_REDIRECT_URL, '_newtab');
  }

  render = () => {
    return (
      <div>
        <h1>{APP_NAME} Web Dashboard</h1>
        <i id='loading-spinner' className={"fa fa-circle-o-notch fast-spin fa-3x fa-fw " + (this.state.apiLoaded ? 'hidden' : '')}></i>
        <div className={this.state.apiLoaded ? '' : 'hidden'}>
          <button className={this.state.signedIn ? 'hidden' : ''} onClick={this.handleSignInClick} id="signin-button" >Sign in</button>
          <button className={this.state.signedIn ? '' : 'hidden'} onClick={this.handleSignOutClick} id="signout-button" >Sign out</button>
          <div id="inject" className={this.state.signedIn ? '' : 'hidden'}>
            <div id="recent-files">
              <h2>Open a recent file:</h2>
              {this.state.files.map((f) => {return <File key={f.id} id={f.id} name={f.name} />})}
            </div>
            <div id="new-files">
              <h2>Create a new file:</h2>
              <button onClick={this.handleNewFileClick} >New File</button>
            </div>
            <div id="pick-file">
              <h2>Select a file from Google Drive:</h2>
              <button onClick={this.handleSelectFileClick} >Select File</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
