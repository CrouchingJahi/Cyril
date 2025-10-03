import Link from '@/router/Link'

import './menu.scss'

const menuLinks = [
  { label: 'Settings', href: 'settings' },
  { label: 'Upload Transaction Data', href: 'upload'},
  { label: 'View Spending Summary', href: 'spending' },
]

export default function MenuScreen () {
    return <div id="menu">
      <header>
        <h2>Menu</h2>
      </header>
      <main>
        <ul>
          { menuLinks.map(link =>
            <li key={link.href}><Link to={link.href}>{link.label}</Link></li>
          ) }
        </ul>
      </main>
    </div>
}
