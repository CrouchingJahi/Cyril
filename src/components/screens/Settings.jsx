import { useEffect, useState } from 'react'
import { getUserAccounts, getCategories, addUserAccount, addCategory, removeUserAccount } from '~/database/db'
import { BackToMenuLink } from '@/router/Link'
import IconButton from '@/ui/IconButton'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'

import './settings.scss'

/*
Settings:
Spending Account (options to add/modify/remove, attach to APIs)
Transaction Categories (options to add/modify)
*/
export default function SettingsScreen () {
  const [userAccounts, setUserAccounts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getUserAccounts().then(setUserAccounts)
    getCategories().then(setCategories)
  }, [])

  function handleAddAccount (event) {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(event.target))
    addUserAccount(formData).then(res => console.log(res))
    event.target.reset()
  }

  function buildAncestryString (parentId) {
    if (!parentId) return ''
    let ancestorCategory = categories.find(cat => cat.id == parentId)
    if (ancestorCategory.catAncestry.length > 0) {
      return `${parentId},${ancestorCategory.catAncestry}`
    } else {
      return parentId
    }
  }

  function handleAddCategory (event) {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(event.target))
    formData.categoryAncestry = buildAncestryString(formData.categoryParent)
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
      <CategoryDisplay categoryList={categories} />
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
            { categories.map(category => <option key={category.id} value={category.id}>{ category.catName }</option>)}
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
    <IconButton preset="close" className="text-accent" label="Delete Account" fn={() => removeUserAccount(account.id)} />
  </li>
}
