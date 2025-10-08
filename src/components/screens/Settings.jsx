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
    <main className="grid cols-2">
      <DataOptions />
      <AccountOptions
        accounts={userAccounts} setAccounts={setUserAccounts}
      />
      {/* <TransactionOptions /> */}
      {/* <SpendingOptions /> */}
      <CategoryOptions
        categories={categories} setCategories={setCategories}
        stringMatchers={stringMatchers} setStringMatchers={setStringMatchers}
      />
    </main>
  </div>
}

function DataOptions () {
  const [backupFileImportData, setBackupFileImportData] = useState(null)
  const [backupSaved, setBackupSaved] = useState(null)
  const [openClearDataModal, setOpenClearDataModal] = useState(false)

  function handleLoadBackup (e) {
    e.preventDefault()
    if (e.target.files.length) {
      cyrilAPI.readBackupFile(e.target.files[0].path).then(data => {
        // validate data
        setBackupFileImportData(data)
      })
    } 
  }

  function handleSaveBackup (e) {
    e.preventDefault()
    db.createBackup().then(resp => {
      setBackupSaved({
        filePath: resp.filePath,
        accounts: resp.backupObj.accounts.length,
        categories: resp.backupObj.categories.length,
        stringMatchers: resp.backupObj.stringMatchers.length,
        transactions: resp.backupObj.transactions.length,
      })
    })
  }

  function handleClearDataModal (e) {
    e.preventDefault()
    setOpenClearDataModal(true)
  }

  function handleClearAll () {}
  function handleClearTransactions () {}

  return <section>
    <h3>Data</h3>
    <div>
      <h4>Load Backup File</h4>
        <div>File: (.json)</div>
        <fieldset className="width-fit">
          <label htmlFor="backupFile" className="button">
            Upload Backup File
          </label>
          <input id="backupFile"
            name="backupFile"
            type="file" accept="json"
            onChange={handleLoadBackup}
          />
        </fieldset>
        { backupFileImportData && <BackupFileImportModal /> }
    </div>
    <div>
      <h4>Save Backup File</h4>
      <fieldset className="width-fit">
        <button onClick={handleSaveBackup} disabled={!!backupSaved}>Save</button>
      </fieldset>
      { backupSaved && <span>Backup saved: { backupSaved.filePath }</span> }
    </div>
    <div>
      <h4>Clear Cyril Data</h4>
      <fieldset className="width-fit">
        <button className="danger" onClick={handleClearDataModal}>Clear Data</button>
      </fieldset>
      { openClearDataModal && <ClearDataModal /> }
    </div>
  </section>

  function BackupFileImportModal () {
    function handleConfirmImport (e) {
      e.preventDefault()
      let formData = Object.fromEntries(new FormData(e.target).entries())
      cyrilVault.loadFromBackup(Object.keys(formData).join(','))
    }

    return <dialog id="backup-file-input-modal" open={!!backupFileImportData} onClose={() => setBackupFileImportData(null)}>
      <div>Choose which backup data to import</div>
      <form onSubmit={handleConfirmImport}>
        <ul className="list narrow margin-y">
          <ImportDataTableCheckbox tableKey="accounts" tableName="Accounts" />
          <ImportDataTableCheckbox tableKey="categories" tableName="Categories" />
          <ImportDataTableCheckbox tableKey="stringMatchers" tableName="Regex Matchers" />
          <ImportDataTableCheckbox tableKey="transactions" tableName="Transactions" />
        </ul>
        <div className="flex gap-s">
          <button>Import All</button>
          <button value="cancel" className="secondary" onClick={() => backupFileImportData(null)}>Cancel</button>
        </div>
      </form>
    </dialog>

    function ImportDataTableCheckbox ({tableKey, tableName }) {
      return backupFileImportData[tableKey].length == 0 ? null : <li>
        <label className="flex" htmlFor={tableKey}>
          <input type="checkbox" name={tableKey} />
          { tableName } ({ backupFileImportData[tableKey].length })
        </label>
      </li>
    }
  }

  function ClearDataModal () {
    return <dialog id="clear-data-modal" open={!!openClearDataModal} onClose={() => setOpenClearDataModal(false)}>
      <h4>Clear Cyril Data</h4>
      <p>Are you sure you cant to clear all data? This cannot be undone, so make sure your backup is created.</p>
      <p></p>
      <p>This includes:</p>
      <ul>
        <li>Accounts</li>
        <li>Categories</li>
        <li>Transactions</li>
        <li>Regex Matchers</li>
      </ul>
      <p></p>
      <div className="flex gap-s">
        <button onClick={handleClearAll}>Clear All</button>
        <button onClick={handleClearTransactions}>Clear Transactions</button>
        <button value="cancel" onClick={() => setOpenClearDataModal(false)}>Cancel</button>
      </div>
    </dialog>
  }
}

function AccountOptions ({accounts, setAccounts}) {
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
      setAccounts([...accounts, res])
    })
    event.target.reset()
  }

  function confirmDeleteAccount(accountId) {
    db.removeUserAccount(accountId).then(([trxResult, acctResult]) => {
      setAccounts(accounts.filter(acct => acct.id != acctResult.id))
    })
  }

  return <section>
    <h3>Accounts</h3>
    { accounts.length == 0 ? <p>No accounts have been created yet.</p> :
      <ul>
        { accounts.map(account => <li key={account.id} className="account-listing">
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
}

// Options for the spending display screen - currently placeholder
function SpendingOptions () {
  return <section></section>
}

// Category picker, then the options that depend on having an active category
function CategoryOptions ({categories, setCategories, stringMatchers, setStringMatchers}) {
  const [activeCategoryId, setActiveCategoryId] = useState(null)

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
  function CategoryParentSelector ({elementId, selectedParentId, setSelectedParentId, isModifying}) {
    return <select name="catParent" id={elementId}
      value={selectedParentId}
      onChange={(e) => setSelectedParentId(e.target.value)}
    >
      <option value="">(None)</option>
      { categories.map(category => <option key={category.id} value={category.id} disabled={isModifying && category.id == activeCategoryId}>{ category.catName }</option>)}
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
          <CategoryParentSelector elementId="modifyCategoryParent" selectedParentId={selectedParentId} setSelectedParentId={setSelectedParentId} isModifying={true} />
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
