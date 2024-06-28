import React from 'react'
import Link from '@/router/Link'

import cyrilLogo from '@assets/Cyril.png'
import './splash.scss'

export default function SplashScreen () {
  const version = window.cyrilAPI.version()

  return <div id="splash">
    <h1>Cyril</h1>
    <p>Version {version}</p>
    <img className='logo' src={cyrilLogo} />
    <p>by Jahi Crouch</p>
    <p><a onClick={window.cyrilAPI.openGithubLink}>GitHub Page</a></p>
    <p><Link to="menu">Continue</Link></p>
  </div>
}
