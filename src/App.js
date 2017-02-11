import React, { Component } from 'react';
import './App.css';
import GoogleAPI from './GoogleAPI.js';

class App extends Component {
  constructor() {
    super();
    this.api = new GoogleAPI();

    // This binding is necessary to make `this` work in the callback
    this.handleSignInClick = this.handleSignInClick.bind(this);
    this.handleSignOutClick = this.handleSignOutClick.bind(this);
  }
  render() {
    return (
      <div>
        <p>Drive API Quickstart</p>
        <button onClick={this.handleSignInClick} id="authorize-button" >Authorize</button>
        <button onClick={this.handleSignOutClick} id="signout-button" >Sign Out</button>
        <div id="content"></div>
      </div>
    );
  }
  handleSignInClick(event) {
    console.log(this);
    this.api.signIn();
  }
  handleSignOutClick(event) {
    this.api.signOut();
    document.getElementById('content').innerHTML = '';
  }

  // componentDidMount() {
  //   const content = document.getElementById('content');
  //   var files = this.api.getFiles();
  //   content.appendChild(files);
  // }
}

export default App;
