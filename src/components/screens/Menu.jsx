import { useContext } from 'react'
import { VaultContext } from '@/context/VaultContext'
import Link from '@/router/Link'
import { Routes } from '@/router'
import { Header } from '@/ui/Layout'
import { getPendingTransactions } from '~/database/localStorage'

export default function MenuScreen () {
  const { transactions } = useContext(VaultContext)
  const pendingTransactions = getPendingTransactions()?.transactions.length || 0

  const menuLinks = [
    {
      label: 'Settings',
      href: Routes.Settings,
    },
    {
      label: 'Upload Transaction Data',
      href: Routes.Upload,
    },
    {
      label: 'View Spending Summary' + (transactions.length === 0 ? ' - No saved transactions' : ''),
      href: Routes.Spending,
      disabled: transactions.length === 0,
    },
    {
      label: `Categorize pending transactions - ${pendingTransactions} currently pending`,
      href: Routes.Categorize,
      disabled: pendingTransactions === 0,
    },
  ]

  return <div id="menu">
    <Header useMenuLink={false}>Menu</Header>
    <main>
      <ul>
        { menuLinks.map(link =>
          <li key={link.href}>
            <Link to={link.href} disabled={link.disabled}>
              {link.label}
            </Link>
          </li>
        ) }
      </ul>
    </main>
  </div>
}
