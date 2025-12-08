import { Header } from '@/ui/Layout'
import Link from '@/router/Link'
import { Routes } from '@/router'

export default function MenuScreen () {
  const menuLinks = [
    { label: 'Settings', href: Routes.Settings },
    { label: 'Upload Transaction Data', href: Routes.Upload },
    { label: 'View Spending Summary', href: Routes.Spending },
    { label: 'Categorize pending transactions', href: Routes.Categorize },
  ]

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
