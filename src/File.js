import React, { Component } from 'react';
import {EDITOR_REDIRECT_URL} from './config.js';

class File extends Component {
  render = () => {
    return (
        <div className="file" onClick={this.handleFileClick}>
            <i className="fa fa-file-code-o" aria-hidden="true"></i>
            <p>{this.props.name}</p>
        </div>
    );
  }

  handleFileClick = () => {
    window.open(EDITOR_REDIRECT_URL + this.props.id, '_newtab');
  }
}

export default File;
