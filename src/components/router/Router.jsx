import { useState } from 'react'
import { defaultRoute, routes, RouteContext } from '@/router'

export default function Router () {
  const [route, setRoute] = useState(defaultRoute)
  const routerContext = {currentRoute: route, changeRoute: setRoute}

  if (!route || !routes[route]) {
    throw new Error(`Illegal route: "${route}"`)
  }
  const CurrentRoute = routes[route]

  return <RouteContext.Provider value={routerContext}>
    <CurrentRoute />
  </RouteContext.Provider>
}
