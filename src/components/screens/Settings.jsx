import { useEffect, useState } from 'react'
import { getUserAccounts, getTransactionCategories } from '~/database/db'
import { BackToMenuLink } from '@/router/Link'

import './settings.scss'

/*
Settings:
Spending Account (options to add/modify/remove, attach to APIs)
Transaction Categories (options to add/modify)
*/
export default function SettingsScreen () {
  const [userAccounts, setUserAccounts] = useState([])
  const [transactionCategories, setTransactionCategories] = useState([])

  useEffect(() => {
    getUserAccounts().then(setUserAccounts)
    getTransactionCategories().then(setTransactionCategories)
  }, [])

  function handleAddAccount (event) {
    const formData = Object.fromEntries(new FormData(event.target))
    event.preventDefault()
  }

  function handleAddCategory (event) {
    const formData = Object.fromEntries(new FormData(event.target))
    event.preventDefault()
  }

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
      <form id="add-account" onSubmit={handleAddAccount}>
        <h4>Add Account</h4>
        <label htmlFor="accountName">Nickname</label>
        <input name="accountName" />
        <label htmlFor="accountFid">Account Number</label>
        <input name="accountFid" />
      </form>
    </section>
    <section>
      <h3>Transaction Categories</h3>
      <ul>
        { transactionCategories.map(category => <CategoryDisplay category={category} />) }
      </ul>
      <form id="add-category" onSubmit={handleAddCategory}>
        <h4>Add Category</h4>
        <label htmlFor="categoryName">Name</label>
        <input name="categoryName" />
        <label htmlFor="categoryParent">Parent Category</label>
        <select name="categoryParent">
          <option value="">(None)</option>
          { transactionCategories.map(category => <option value={category.id}>{ category.name }</option>)}
        </select>
      </form>
    </section>
  </div>
}

function AccountDisplay (account) {
  return <li>{ account.id }</li>
}

function CategoryDisplay (category) {
  return <li>{ category.id }</li>
}
