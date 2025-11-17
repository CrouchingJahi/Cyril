import { BackToMenuLink } from '@/router/Link'

/**
 * General layout components that are shared between many pages
 */
export function Header ({ useMenuLink = true, children }) {
  return <header>
    { useMenuLink && <BackToMenuLink /> }
    <h1>{ ...children }</h1>
  </header>
}
