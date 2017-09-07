import React from 'react'

import Link from '~/router/link'

let menuLinks = [
  { label: 'Upload', href: 'upload' }
]

export default class MenuScreen extends React.Component {
  render() {
    return (
      <div id="menu">
        <h2>Menu</h2>
        { menuLinks.map((link) => <Link key={ link.href } to={ link.href }>{ link.label }</Link>) }
      </div>
    )
  }
}
