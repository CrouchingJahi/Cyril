import React from 'react';
import { remote, shell } from 'electron';
import Radium from 'radium';

import Link from '~/router/link';

const css = {
  main: {
    'textAlign': 'center'
  },
  logo: {
    'width': '35vw'
  }
};

@Radium
export default class SplashScreen extends React.Component {
  openGitHub(e) {
    e.preventDefault();
    shell.openExternal('https://github.com/CrouchingJahi/Cyril/');
  }

  version() {
    return remote.app.getVersion();
  }

  render() {
    return (
      <div id="splash" style={css.main}>
        <h1>Cyril</h1>
        <p>Version { this.version() }</p>
        <img style={css.logo} src="ui/assets/Cyril.png" />
        <p>by Jahi Crouch</p>
        <p><a href onClick={ this.openGitHub }>GitHub Page</a></p>
        <p><Link to="menu">Continue</Link></p>
      </div>
    );
  }
}
