import Link from '@/router/Link'

import cyrilLogo from '@assets/Cyril.png'
import './splash.scss'

export default function SplashScreen () {
  const version = window.cyrilAPI.getVersion()

  return <div id="splash">
    <h1>Cyril</h1>
    <p>Version {version}</p>
    <img className='logo' src={cyrilLogo} />
    <p>by Jahi Crouch</p>
    <p><button className="link" onClick={window.cyrilAPI.openGithubLink}>GitHub Page</button></p>
    <p><Link to="menu" className="button">Continue</Link></p>
  </div>
}
