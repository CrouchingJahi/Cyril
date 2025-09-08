import { useEffect, useState } from 'react'
import { getUserAccounts, getTransactionCategories } from '~/database/db'
import { BackToMenuLink } from '@/router/Link'

/*
Settings:
Spending Account (options to add/modify/remove, attach to APIs)
Transaction Categories (options to add/modify)
*/
export default function SettingsScreen () {
  const [userAccounts, setUserAccounts] = useState([])
  const [transactionCategories, setTransactionCategories] = useState([])

  useEffect(() => {
    setUserAccounts(getUserAccounts())
    setTransactionCategories(getTransactionCategories())
  }, [])

  return <div id="settings">
    <header>
      <BackToMenuLink />
      <h2>Settings</h2>
    </header>
    <section>
      <h3>Accounts</h3>
      <ul>
        { userAccounts.map(account => <AccountDisplay account={account} />) }
      </ul>
    </section>
    <section>
      <h3>Transaction Categories</h3>
      <ul>
        { transactionCategories.map(category => <CategoryDisplay category={category} />) }
      </ul>
    </section>
  </div>
}

function AccountDisplay (account) {
  return <li>{ account.id }</li>
}

function CategoryDisplay (category) {
  return <li>{ category.id }</li>
}
