import { Header } from '@/ui/Layout'
import Link from '@/router/Link'

const menuLinks = [
  { label: 'Settings', href: 'settings' },
  { label: 'Upload Transaction Data', href: 'upload'},
  { label: 'View Spending Summary', href: 'spending' },
  { label: 'Categorize pending transactions', href: 'categorize' },
]

export default function MenuScreen () {
  return <div id="menu">
    <Header useMenuLink={false}>Menu</Header>
    <main>
      <ul>
        { menuLinks.map(link =>
          <li key={link.href}><Link to={link.href}>{link.label}</Link></li>
        ) }
      </ul>
    </main>
  </div>
}
