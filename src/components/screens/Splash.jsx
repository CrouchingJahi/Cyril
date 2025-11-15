import Link from '@/router/Link'

import cyrilLogo from '@assets/Cyril.png'
import './splash.scss'

export default function SplashScreen () {
  const version = window.cyrilAPI.getVersion()

  return <div id="splash" className="anim-fade-in">
    <h1>Cyril</h1>
    <p>Version {version}</p>
    <p>by CrouchingJahi</p>
    <img className='logo' src={cyrilLogo} />
    <p><button className="unstyled link" onClick={window.cyrilAPI.openGithubLink}>GitHub Page</button></p>
    <p><Link to="menu" className="button">Continue</Link></p>
  </div>
}
