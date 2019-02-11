import React from 'react'
import { RouteContext } from '@/router'

export default class Link extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <RouteContext.Consumer>
        {({currentRoute, changeRoute}) => (
          <button className={ this.props.className }
            onClick={() => changeRoute(this.props.to)}
            >
            { this.props.children }
          </button>
        )}
      </RouteContext.Consumer>
    )
  }
}

export class BackToMenuLink extends React.Component {
  render() {
    return (
      <Link className="link">Back to Menu</Link>
    )
  }
}
