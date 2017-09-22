import React from 'react'

import Link from '~/router/link'

let menuLinks = [
  { label: 'Spending', href: 'spending' },
  { label: 'Upload', href: 'upload' },
  // { label: 'Settings', href: 'settings' }
]

export default class MenuScreen extends React.Component {
  render() {
    return (
      <div id="menu">
        <h2>Menu</h2>
        <ul>
          { menuLinks.map((link) => <li key={ link.href }><Link to={ link.href }>{ link.label }</Link></li>) }
        </ul>
      </div>
    )
  }
}
