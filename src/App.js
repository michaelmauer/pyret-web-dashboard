import React, { Component } from 'react';
import './App.css';
import GoogleAPI from './GoogleAPI.js';

class App extends Component {
  constructor() {
    super();
    this.api = new GoogleAPI();
  }

  render = () => {
    return (
      <div>
        <p>Drive API Quickstart</p>
        <button onClick={this.handleSignInClick} id="authorize-button" >Authorize</button>
        <button onClick={this.handleSignOutClick} id="signout-button" >Sign Out</button>
        <div id="content"></div>
      </div>
    );
  }

  handleSignInClick = (event) => {
    console.log(this);
    this.api.signIn().then(this.listFiles);
  }

  handleSignOutClick = (event) => {
    this.api.signOut();
    document.getElementById('content').innerHTML = '';
  }

  listFiles = () => {
    const content = document.getElementById('content');

    this.api.getFiles().then((resp) => {
      console.log(resp.result.files);
      content.innerHTML = JSON.stringify(resp.result.files);
    });
  }
}

export default App;
