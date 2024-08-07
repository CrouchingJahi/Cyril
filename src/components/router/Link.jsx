import { useContext } from 'react'
import { RouteContext } from '@/router'

import './link.scss'

export default function Link ({ to, className, children}) {
  const routeContext = useContext(RouteContext)
  const buttonClasses = ['link', className].join(' ')

  return <button className={ buttonClasses }
    onClick={() => routeContext.changeRoute(to)}
    >
    { children }
  </button>
}

export function BackToMenuLink () {
  return <Link to="menu">&#x25c4; Back to Menu</Link>
}
