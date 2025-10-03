import Link from '@/router/Link'

const menuLinks = [
  { label: 'Settings', href: 'settings' },
  { label: 'Upload Transaction Data', href: 'upload'},
  { label: 'View Spending Summary', href: 'spending' },
]

export default function MenuScreen () {
    return <div id="menu">
      <header>
        <h1>Menu</h1>
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
