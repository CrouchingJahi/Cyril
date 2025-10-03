import { useEffect, useState } from 'react'
import * as db from '~/database/db'
import { BackToMenuLink } from '@/router/Link'
import IconButton from '@/ui/IconButton'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'

import './settings.scss'

/**
 * Settings:
 * Spending Account (options to add/modify/remove, attach to APIs)
 * Transaction Categories (options to add/modify)
 * 
 * @todo dont clear full form when a category is selected (add category name)
 * @todo fix screen update on modify category
 */
export default function SettingsScreen () {
  const [userAccounts, setUserAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [stringMatchers, setStringMatchers] = useState([])
  const [activeCategoryId, setActiveCategoryId] = useState(null)

  useEffect(() => {
    db.getUserAccounts().then(setUserAccounts)
    db.getCategories().then(setCategories)
    db.getStringMatchers().then(setStringMatchers)
  }, [])

  return <div id="settings">
    <header>
      <BackToMenuLink />
      <h2>Settings</h2>
    </header>
    <main>
      <AccountOptions />
      <SpendingOptions />
      {/* When this is separated into a component, the CategoryDisplay resets when selecting a category */}
      {/* <CategoryOptions /> */}
      <section>
        <h3>Transaction Categories</h3>
        { categories.length == 0 ? <p>No categories exist yet.</p> :
          <>
            <CategoryDisplay categoryList={categories} activeCatId={activeCategoryId} setActiveFn={setActiveCategoryId} />
            <h4>Selected Category: { activeCategoryId ? categories.find(cat => cat.id == activeCategoryId).catName : '(None Selected)' }</h4>
          </>
        }
      </section>
      <ModifyCategoryForm />
      <AddCategoryForm />
      <CategoryMatcherOptions />
    </main>
  </div>

  function AccountOptions () {
    const [confirmationDialogItem, setConfirmationDialogItem] = useState(null)
    const [transactionsForDeletionAccount, setTransactionsForDeletionAccount] = useState(0)
    useEffect(() => {
      if (confirmationDialogItem) {
        db.getTransactionCountForAccount(confirmationDialogItem.id).then(setTransactionsForDeletionAccount)
      } else {
        setTransactionsForDeletionAccount(0)
      }
    }, [confirmationDialogItem])

    function handleAddAccount (event) {
      event.preventDefault()
      const formData = Object.fromEntries(new FormData(event.target))
      db.addUserAccount(formData).then(res => {
        setUserAccounts([...userAccounts, res])
      })
      event.target.reset()
    }

    function confirmDeleteAccount(accountId) {
      db.removeUserAccount(accountId).then(([trxResult, acctResult]) => {
        setUserAccounts(userAccounts.filter(acct => acct.id != acctResult.id))
      })
    }

    function ConfirmDeleteAccountDialog () {
      return <dialog id="remove-account-confirmation" open={!!confirmationDialogItem} onClose={() => setConfirmationDialogItem(null) }>
        <p>Are you sure you want to remove this account?</p>
        <p>{ confirmationDialogItem.name }</p>
        { transactionsForDeletionAccount > 0 && <p>This account has {transactionsForDeletionAccount} transactions associated with it that will also be removed.</p> }
        <div className="flex gap-s">
          <button onClick={() => confirmDeleteAccount(confirmationDialogItem.id)}>OK</button>
          <button value="cancel" onClick={() => setConfirmationDialogItem(null)}>Cancel</button>
        </div>
      </dialog>
    }

    return <section>
      <h3>Spending Accounts</h3>
      { userAccounts.length == 0 ? <p>No accounts have been created yet.</p> :
        <ul>
          { userAccounts.map(account => <li key={account.id} className="account-listing">
            { account.name }
            <IconButton preset="close" className="text-accent" label="Delete Account" fn={() => setConfirmationDialogItem(account)} />
          </li>) }
        </ul>
      }
      { confirmationDialogItem && <ConfirmDeleteAccountDialog /> }
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
        <fieldset>
          <label htmlFor="accountOrg">Account Organization</label>
          <input name="accountOrg" id="accountOrg" required />
        </fieldset>
        <button>Add Account</button>
      </form>
    </section>
  }

  // Options for the spending display screen - currently placeholder
  function SpendingOptions () {
    return <section></section>
  }
  
  // Category picker, then the options that depend on having an active category
  /*
  function CategoryOptions () {
    return <>
      <section>
        <h3>Transaction Categories</h3>
        { categories.length == 0 ? <p>No categories exist yet.</p> :
          <>
            <CategoryDisplay categoryList={categories} activeCatId={activeCategoryId} setActiveFn={setActiveCategoryId} />
            <h4>Selected Category: { activeCategoryId ? categories.find(cat => cat.id == activeCategoryId).catName : '(None Selected)' }</h4>
          </>
        }
      </section>
      <AddCategoryForm />
      <ModifyCategoryForm />
      <CategoryMatcherOptions />
    </>
  }
  */

  function buildAncestryString (parentId) {
    if (!parentId) return ''
    let ancestorCategory = categories.find(cat => cat.id == parentId)
    if (ancestorCategory.catAncestry.length > 0) {
      return `${parentId},${ancestorCategory.catAncestry}`
    } else {
      return parentId
    }
  }
  // if modifying, do not use activeCategoryId
  function CategoryParentSelector ({elementId, selectedParentId, setSelectedParentId, modifying}) {
    // const parentOptions = modifying ? categories.filter(cat => cat.id != activeCategoryId) : categories
    return <select name="catParent" id={elementId}
      value={selectedParentId}
      onChange={(e) => setSelectedParentId(e.target.value)}
    >
      <option value="">(None)</option>
      { categories.map(category => <option key={category.id} value={category.id} disabled={modifying && category.id == activeCategoryId}>{ category.catName }</option>)}
    </select>
  }

  function ModifyCategoryForm () {
    if (!activeCategoryId) {
      return <section />
    }
    const selectedCategory = categories.find(cat => cat.id == activeCategoryId)
    const [selectedParentId, setSelectedParentId] = useState(selectedCategory.catAncestry.split(',').shift())

    function handleModifyCategory (event) {
      event.preventDefault()
      const formData = Object.fromEntries(new FormData(event.target))
      db.modifyCategory({
        id: activeCategoryId,
        ...formData,
        catAncestry: buildAncestryString(selectedParentId)
      }).then(res => {
        let newCategories = [...categories]
        newCategories[categories.indexOf(cat => cat.id == activeCategoryId)] = res
        setCategories(newCategories)
      })
    }

    return <section>
      <form onSubmit={handleModifyCategory}>
        <fieldset>
          <label>Category Name</label>
          <input name="catName" defaultValue={selectedCategory.catName} />
        </fieldset>
        <fieldset>
          <label htmlFor="modifyCategoryParent">Category Parent</label>
          <CategoryParentSelector elementId="modifyCategoryParent" selectedParentId={selectedParentId} setSelectedParentId={setSelectedParentId} modifying={true} />
        </fieldset>
        <button>Modify Category</button>
      </form>
    </section>
  }

  function AddCategoryForm () {
    const [selectedParentId, setSelectedParentId] = useState('')
    useEffect(() => {
      if (activeCategoryId) {
        setSelectedParentId(activeCategoryId)
      }
    }, [activeCategoryId])

    function handleAddCategory (event) {
      event.preventDefault()
      const formData = Object.fromEntries(new FormData(event.target))
      db.addCategory({
        ...formData,
        catAncestry: buildAncestryString(selectedParentId)
      }).then(res => {
        setCategories([...categories, res])
      })
      event.target.reset()
    }

    return <section>
      <form id="add-category" onSubmit={handleAddCategory}>
        <h4>Add Category</h4>
        <fieldset>
          <label htmlFor="catName">Name</label>
          <input name="catName" required />
        </fieldset>
        <fieldset>
          <label htmlFor="newCategoryParent">Parent Category</label>
          <CategoryParentSelector elementId="newCategoryParent" selectedParentId={selectedParentId} setSelectedParentId={setSelectedParentId} />
        </fieldset>
        <button>Add Category</button>
      </form>
    </section>
  }

  function CategoryMatcherOptions () {
    function handleAddMatcher (e) {
      const formData = Object.fromEntries(new FormData(event.target))
      e.preventDefault()

      db.addStringMatcher({
        ...formData,
        categoryId: activeCategoryId
      }).then(res => {
        setStringMatchers([...stringMatchers, res])
      })
      e.target.reset()
    }
    return <section>
      <h3>Transaction Category Matchers</h3>
      { stringMatchers.length == 0 ? <p>No category matchers have been created yet.</p> :
        <ul>
          { stringMatchers.map(matcher => <li key={matcher.id}>
            { matcher.pattern } &#8702; { categories.find(cat => cat.id == matcher.categoryId).catName }
          </li>)}
          {/* Delete button */}
        </ul>
      }
      <form id="add-category-matcher" onSubmit={handleAddMatcher}>
        <fieldset>
          <label>Regex pattern to match:</label>
          <input name="pattern" />
        </fieldset>
        <button disabled={!activeCategoryId}>Create Matcher</button>
      </form>
    </section>
  }
}
