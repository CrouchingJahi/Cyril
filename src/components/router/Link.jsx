import { useContext } from 'react'
import { RouteContext } from '@/router'

import './link.scss'

export default function Link ({ to, className, children}) {
  const routeContext = useContext(RouteContext)
  const buttonClasses = className?.includes('button') ? className : ['link', className].join(' ')

  return <button className={ buttonClasses }
    onClick={() => routeContext.changeRoute(to)}
    >
    { children }
  </button>
}

export function BackToMenuLink () {
  return <Link to="menu">&#8617; Back to Menu</Link>
}
