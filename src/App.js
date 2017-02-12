import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import GoogleAPI from './GoogleAPI.js';
import {CLIENT_ID, DISCOVERY_DOCS, SCOPES, FILE_EXT, APP_NAME} from './config.js';
import File from './File';

class App extends Component {
  constructor() {
    super();

    this.api = new GoogleAPI();
    this.api.load(CLIENT_ID, DISCOVERY_DOCS, SCOPES).then(this.apiLoaded);
  }

  componentWillMount = () => {
    this.setState({spinnerClass: 'visible', apiLoadedClass: 'invisible', signedInClass: 'visible', signedOutClass: 'hidden'});
  }

  apiLoaded = () => {
    this.setState({spinnerClass: 'hidden', apiLoadedClass: 'visible'});
    if (this.api.isSignedIn()) {
      this.listFiles();
      this.setState({signedInClass: 'hidden', signedOutClass: 'visible'});
    }
  }

  render = () => {
    return (
      <div>
        <h1>{APP_NAME} Web Dashboard</h1>
        <i id='loading-spinner' className={"fa fa-circle-o-notch fast-spin fa-3x fa-fw " + this.state.spinnerClass}></i>
        <div className={this.state.apiLoadedClass}>
          <button className={this.state.signedInClass} onClick={this.handleSignInClick} id="authorize-button" >Authorize</button>
          <button className={this.state.signedOutClass} onClick={this.handleSignOutClick} id="signout-button" >Sign Out</button>
          <div id="inject"></div>
        </div>
      </div>
    );
  }

  handleSignInClick = (event) => {
    this.api.signIn().then(() => {
      this.setState({signedInClass: 'hidden', signedOutClass: 'visible'});
      this.listFiles();
    });
  }

  handleSignOutClick = (event) => {
    this.api.signOut().then(() => {
      document.getElementById('inject').innerHTML = '';
      this.setState({signedInClass: 'visible', signedOutClass: 'hidden'});
    });
  }

  listFiles = () => {
    const inject = document.getElementById('inject');

    this.api.getFilesByExt(FILE_EXT).then((resp) => {
      var files = resp.result.files.map((f) => {return <File key={f.id} id={f.id} name={f.name} />});
      ReactDOM.render(
        <div>
          <h2>Recent Files:</h2>
          {files}
        </div>,
        inject
        );
    });
  }
}

export default App;
