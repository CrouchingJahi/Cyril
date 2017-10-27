import React from 'react'
import { remote, shell } from 'electron'

import Link from '~/router/link'

export default class SplashScreen extends React.Component {
  openGitHub(e) {
    e.preventDefault()
    shell.openExternal('https://github.com/CrouchingJahi/Cyril/')
  }

  version() {
    return remote.app.getVersion()
  }

  render() {
    return (
      <div id="splash">
        <h1>Cyril</h1>
        <p>Version { this.version() }</p>
        <img className="logo" src="ui/assets/Cyril.png" />
        <p>by Jahi Crouch</p>
        <p><a href onClick={ this.openGitHub }>GitHub Page</a></p>
        <p><Link to="menu">Continue</Link></p>
      </div>
    )
  }
}
