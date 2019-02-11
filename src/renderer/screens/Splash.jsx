import React from 'react'
import { remote, shell } from 'electron'
import Link from '@/router/Link'

const githubLink = 'https://github.com/CrouchingJahi/Cyril'

export default class SplashScreen extends React.Component {
  openGithub(e) {
    e.preventDefault()
    shell.openExternal(githubLink)
  }

  render() {
    return (
      <div id="splash">
        <h1>Cyril</h1>
        <p>Version {remote.app.getVersion()}</p>
        {/* <img className='logo' src='@/assets/Cyril.png' */}
        <p>by Jahi Crouch</p>
        <p><a onClick={this.openGithub} title={githubLink}>GitHub Page</a></p>
        <p><Link to="menu">Continue</Link></p>
      </div>
    )
  }
}
