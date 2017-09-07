import React from 'react'

import { newRoutingEvent } from './router'

export default class Link extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (e) {
    e.preventDefault()
    this.link.dispatchEvent(newRoutingEvent(this.props.to))
  }

  render () {
    return <a href
              className={this.props.className}
              ref={elem => this.link = elem}
              onClick={this.handleClick}>
              { this.props.children }
           </a>
  }
}

export class BackToMenuLink extends React.Component {
  render () {
    return <Link className="small" to="menu">&#x25c4; Back to Menu</Link>
  }
}
