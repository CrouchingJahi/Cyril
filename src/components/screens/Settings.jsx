import { useEffect, useState } from 'react'
import { getUserAccounts, getTransactionCategories, addUserAccount, addCategory, removeUserAccount } from '~/database/db'
import { BackToMenuLink } from '@/router/Link'
import IconButton from '@/ui/IconButton'

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
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(event.target))
    addUserAccount(formData).then(res => console.log(res))
    event.target.reset()
  }

  function handleAddCategory (event) {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(event.target))
    addCategory(formData)
    event.target.reset()
  }

  return <div id="settings">
    <header>
      <BackToMenuLink />
      <h2>Settings</h2>
    </header>
    <section>
      <h3>Accounts</h3>
      <ul>
        { userAccounts.map(account => <AccountDisplay account={account} key={account.id} />) }
      </ul>
      <form id="add-account" onSubmit={handleAddAccount}>
        <h4>Add Account</h4>
        <fieldset>
          <label htmlFor="accountName">Nickname</label>
          <input name="accountName" id="accountName" required />
        </fieldset>
        <fieldset>
          <label htmlFor="accountFid">Account Number</label>
          <input name="accountFid" id="accountFid" required />
        </fieldset>
        <button>Add Account</button>
      </form>
    </section>
    <section>
      <h3>Transaction Categories</h3>
      <ul>
        { transactionCategories.map(category => <CategoryDisplay category={category} key={category.id} />) }
      </ul>
      <form id="add-category" onSubmit={handleAddCategory}>
        <h4>Add Category</h4>
        <fieldset>
          <label htmlFor="categoryName">Name</label>
          <input name="categoryName" id="categoryName" required />
        </fieldset>
        <fieldset>
          <label htmlFor="categoryParent">Parent Category</label>
          <select name="categoryParent" id="categoryParent">
            <option value="">(None)</option>
            { transactionCategories.map(category => <option key={category.id} value={category.id}>{ category.name }</option>)}
          </select>
        </fieldset>
        <button>Add Category</button>
      </form>
    </section>
  </div>
}

function AccountDisplay ({account}) {
  return <li className="account-listing">
    { account.name }
    <IconButton preset="close" label="Delete Account" fn={() => removeUserAccount(account.id)} />
  </li>
}

function CategoryDisplay ({category}) {
  return <li>{ category.id }</li>
}
