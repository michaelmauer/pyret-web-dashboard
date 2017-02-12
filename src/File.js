import React, { Component } from 'react';

import {EDITOR_REDIRECT_URL} from './config.js';


class File extends Component {
  render = () => {
    return (
        <div className="file" onClick={this.handleClick}>
            <i className="fa fa-file-code-o" aria-hidden="true"></i>
            <p>{this.props.name}</p>
        </div>
    );
  }
  handleClick = () => {
    window.open("http://code.pyret.org/editor#program=" + this.props.id,'_newtab');
  }
}

export default File;
