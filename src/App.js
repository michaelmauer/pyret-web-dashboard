import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import GoogleAPI from './GoogleAPI.js';
import {CLIENT_ID, DISCOVERY_DOCS, SCOPES} from './config.js';
import File from './File';


class App extends Component {
  constructor() {
    super();
    this.api = new GoogleAPI();

    this.api.load(CLIENT_ID, DISCOVERY_DOCS, SCOPES).then(this.apiLoaded);
  }

  componentWillMount = () => {
    localStorage.setItem('gapi_loaded', false);
    this.setState({signedInClass: '', signedOutClass: 'hidden'});
  }

  apiLoaded = () => {
    if (this.api.isSignedIn()) {
      this.listFiles();
      this.setState({signedInClass: 'hidden', signedOutClass: ''});
    }
  }

  render = () => {
    return (
      <div>
        <div >
          <h1>Pyret Web Dashboard</h1>
          <button className={this.state.signedInClass} onClick={this.handleSignInClick} id="authorize-button" >Authorize</button>
          <button className={this.state.signedOutClass} onClick={this.handleSignOutClick} id="signout-button" >Sign Out</button>
          <div id="inject"></div>
        </div>
      </div>
    );
  }

  handleSignInClick = (event) => {
    this.api.signIn().then(() => {
      this.setState({signedInClass: 'hidden', signedOutClass: ''});
      this.listFiles();
    });
  }

  handleSignOutClick = (event) => {
    this.api.signOut().then(() => {
      document.getElementById('inject').innerHTML = '';
      this.setState({signedInClass: '', signedOutClass: 'hidden'});
    });
  }

  listFiles = () => {
    const inject = document.getElementById('inject');

    this.api.getPyretFiles().then((resp) => {
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
