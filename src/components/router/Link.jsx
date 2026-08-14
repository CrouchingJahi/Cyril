import { useContext } from 'react'
import { RouteContext, Routes } from '@/router'

import './link.scss'

export default function Link ({ to, disabled, className, children}) {
  const routeContext = useContext(RouteContext)
  const buttonClasses = className?.includes('button') ? className : ['unstyled link', className].join(' ')

  return <button className={ buttonClasses }
    onClick={() => routeContext.changeRoute(to)}
    disabled={disabled}
  >
    { children }
  </button>
}

export function BackToMenuLink () {
  return <Link className="back-to-menu" to={Routes.Menu}>&#8617; Back to Menu</Link>
}
