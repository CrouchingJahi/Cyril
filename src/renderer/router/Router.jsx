import React from 'react'
import { defaultRoute, routes, RouteContext } from '@/router'

export default class Router extends React.Component {
  static contextType = RouteContext

  constructor(props) {
    super(props)
    this.state = {
      currentRoute: defaultRoute,
      changeRoute: this.changeRoute.bind(this)
    }
  }

  changeRoute(route) {
    if (!route || !routes[route]) {
      throw new Error(`Illegal route: "${route}"`)
    }
    this.setState({
      currentRoute: route
    })
  }

  render() {
    let Route = routes[this.state.currentRoute]
    return (
      <RouteContext.Provider value={this.state}>
        <Route />
      </RouteContext.Provider>
    )
  }
}
