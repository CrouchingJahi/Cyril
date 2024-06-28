import React from 'react'
import Link from '@/router/Link'

const menuLinks = [
  // { label: 'Spending', href: 'spending' }
  { label: 'Settings', href: 'settings' }
]

export default class MenuScreen extends React.Component {
  render() {
    return (
      <div id="menu">
        <h2>Menu</h2>
        <ul className="nav-menu">
          { menuLinks.map(link => <li key={link.href}><Link to={link.href}>{link.label}</Link></li>) }
        </ul>
      </div>
    )
  }
}
