import { useEffect, useState, useRef } from 'react'
import * as db from '~/database/db'
import { BackToMenuLink } from '@/router/Link'
import Modal from '@/ui/Modal'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'

/**
 * Settings:
 * Spending Account (options to add/modify/remove, attach to APIs)
 * Transaction Categories (options to add/modify)
 * 
 * @todo finish clear data functions
 * @todo dont clear full form when a category is selected (add category name)
 * @todo fix screen update on modify category
 * @todo ability to transfer transactions to another account
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
      <h1>Settings</h1>
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
  const [confirmSavePath, setConfirmSavePath] = useState('')
  const backupConfirmSaveModalRef = useRef(null)
  const backupFileImportModalRef = useRef(null)
  const clearDataModalRef = useRef(null)

  // Open modals once their data is filled in
  useEffect(() => {
    if (backupFileImportData) {
      backupFileImportModalRef.current.open()
    }
  }, [backupFileImportData])

  useEffect(() => {
    if (confirmSavePath) {
      backupConfirmSaveModalRef.current.open()
    }
  }, [confirmSavePath])

  function handleLoadBackup (e) {
    e.preventDefault()
    setBackupFileImportData(null)
    if (e.target.files.length) {
      cyrilAPI.readBackupFile(e.target.files[0].path).then(data => {
        // validate data
        setBackupFileImportData(data)
      })
    } 
  }

  function checkForBackupFile (e) {
    e.preventDefault()
    setConfirmSavePath('')
    cyrilAPI.doesBackupFileExist().then(resp => {
      if (resp.fileExists) {
        setConfirmSavePath(resp.filePath)
      } else {
        handleSaveBackup()
      }
    })
  }

  function handleSaveBackup () {
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
    clearDataModalRef.current.open()
  }

  function handleClearAll () {}
  function handleClearTransactions () {}

  return <section>
    <h2>Data</h2>
    <div className="pad-bottom">
      <h4>Load Backup File</h4>
      <div>File: (.json)</div>
      <input id="backupFile"
        name="backupFile"
        type="file" accept="json"
        onChange={handleLoadBackup}
      />
      <label htmlFor="backupFile" className="block button width-fit">
        Upload Backup File
      </label>
      <BackupFileImportModal />
    </div>
    <div className="pad-bottom">
      <h4>Save Backup File</h4>
      <button className="width-fit" onClick={checkForBackupFile} disabled={!!backupSaved}>Save</button>
      <ConfirmSaveDataModal />
      { backupSaved && <>
        <div>Backup saved!<br/>{ backupSaved.filePath }</div>
      </> }
    </div>
    <div className="pad-bottom">
      <h4>Clear Cyril Data</h4>
      <button className="width-fit danger" onClick={handleClearDataModal}>Clear Data</button>
      <ClearDataModal />
    </div>
  </section>

  function BackupFileImportModal () {
    function handleConfirmImport (e) {
      if (e.nativeEvent.submitter.value != 'cancel') {
        let formData = Object.fromEntries(new FormData(e.target).entries())
        cyrilVault.loadFromBackup(Object.keys(formData).join(','))
      }
    }

    return <Modal modalId="backup-file-import-modal" modalRef={backupFileImportModalRef} closeFn={() => setBackupFileImportData(null)}>
      { !!backupFileImportData && <>
        <div>Choose which backup data to import</div>
        <form method="dialog" onSubmit={handleConfirmImport}>
          <div className="list narrow margin-y">
            <ImportDataTableCheckbox tableKey="accounts" tableName="Accounts" />
            <ImportDataTableCheckbox tableKey="categories" tableName="Categories" />
            <ImportDataTableCheckbox tableKey="stringMatchers" tableName="Regex Matchers" />
            <ImportDataTableCheckbox tableKey="transactions" tableName="Transactions" />
          </div>
          <div className="flex gap-s">
            <button name="action" value="import">Import Selected Tables</button>
            <button name="action" value="cancel" type="reset" className="light" onClick={() => backupFileImportModalRef.current.close()}>Cancel</button>
          </div>
        </form>
      </> }
    </Modal>

    function ImportDataTableCheckbox ({tableKey, tableName }) {
      return backupFileImportData[tableKey].length == 0 ? null : <div>
        <input type="checkbox" id={`import-${tableKey}`} name={tableKey} defaultChecked="on" tabIndex="0" />
        <label htmlFor={`import-${tableKey}`}>
          { tableName } ({ backupFileImportData[tableKey].length })
        </label>
      </div>
    }
  }

  // Confirm overwriting when a file already exists
  function ConfirmSaveDataModal () {
    return <Modal modalId="confirm-save-modal" modalRef={backupConfirmSaveModalRef}>
      <h3>Backup File Already Exists</h3>
      <p>{ confirmSavePath }</p>
      <p>The backup file already exists. Are you sure you want to overwrite it?</p>
      <p>This is your chance to rename and/or move the file in order to keep this version of it.</p>
      <div className="flex gap-m">
        <button onClick={() => handleSaveBackup()}>Overwrite File</button>
        <button onClick={() => backupConfirmSaveModalRef.current.close()}>Cancel</button>
      </div>
    </Modal>
  }

  function ClearDataModal () {
    return <Modal modalId="clear-data-modal" modalRef={clearDataModalRef} className="border-danger">
      <form method="dialog">
        <h3>Clear Cyril Data</h3>
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
          <button className="danger" onClick={handleClearAll}>Clear All</button>
          <button className="danger" onClick={handleClearTransactions}>Clear Transactions</button>
          <button value="cancel" onClick={() => clearDataModalRef.current.close()}>Cancel</button>
        </div>
      </form>
    </Modal>
  }
}

function AccountOptions ({accounts, setAccounts}) {
  const [activeAccount, setActiveAccount] = useState(null)
  const [activeAccountInfo, setActiveAccountInfo] = useState(null)
  const confirmDeleteAccountDialogRef = useRef(null)
  const accountDetailsModalRef = useRef(null)

  useEffect(() => {
    if (activeAccountInfo) {
      accountDetailsModalRef.current.open()
    }
  }, [activeAccountInfo])

  function handleOpenAccountDetails (account) {
    setActiveAccount(account)
    db.getTransactionCountForAccount(account.id).then(trxCount => {
      setActiveAccountInfo({
        trxCount
      })
    })
  }

  function handleAccountDetailsSubmit (event) {
    event.preventDefault()
    const btnClicked = event.nativeEvent.submitter.value
    if (btnClicked == 'edit') {
      handleEditAccount(event)
    } else if (btnClicked == 'delete') {
      handleDeleteAccount()
    } else if (btnClicked == 'cancel') {
      setActiveAccount(null)
      setActiveAccountInfo(null)
      accountDetailsModalRef.current.close()
    }
  }

  function handleAddAccount (event) {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(event.target))
    db.addUserAccount(formData).then(res => {
      setAccounts([...accounts, res])
    })
    event.target.reset()
  }

  function handleEditAccount (event) {
    const formData = Object.fromEntries(new FormData(event.target))
    db.editUserAccount(formData).then(res => {
      const acctIndex = accounts.indexOf(acct => acct.id == activeAccount.id)
      let accountsCopy = [...accounts]
      accountsCopy[acctIndex] = res;
      setAccounts(accountsCopy)
      accountDetailsModalRef.current.close()
    })
  }

  function handleDeleteAccount () {
    confirmDeleteAccountDialogRef.current.open()
  }

  function confirmDeleteAccount (accountId) {
    db.removeUserAccount(accountId).then(([trxResult, acctResult]) => {
      setAccounts(accounts.filter(acct => acct.id != acctResult.id))
      confirmDeleteAccountDialogRef.current.close()
      accountDetailsModalRef.current.close()
      setActiveAccount(null)
      setActiveAccountInfo(null)
    })
  }

  return <section>
    <h2>Accounts</h2>
    { accounts.length == 0 ? <p>No accounts have been created yet.</p> :
      <ul>
        { accounts.map(account => <li key={account.id} className="account-listing">
          <button type="button" className="unstyled link pad-s" onClick={() => handleOpenAccountDetails(account)}>{ account.name }</button>
        </li>) }
      </ul>
    }
    <AccountDetailsModal />
    <ConfirmDeleteAccountDialog />
    <form id="add-account" onSubmit={handleAddAccount}>
      <h3>Add Account</h3>
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

  function AccountDetailsModal () {
    const shouldRender = !!activeAccount
    return <Modal modalId="account-details-modal" modalRef={accountDetailsModalRef} closeFn={() => setActiveAccount(null)}>
      { shouldRender && <form method="dialog" onSubmit={handleAccountDetailsSubmit}>
        <h2>Account Details</h2>
        <p>This account has { activeAccountInfo?.trxCount || 0 } transactions associated with it.</p>
        {/* Transactions - Ability to transfer to another account? */}
        <div className="pad-bottom">
          <h4>Edit Account</h4>
          <fieldset>
            <div>Account number cannot be edited. Create a new account for a new FID.</div>
            <input name="id" type="hidden" value={activeAccount.id} />
          </fieldset>
          <fieldset>
            <label>Nickname</label>
            <input name="name" defaultValue={activeAccount.name} />
          </fieldset>
          <fieldset>
            <label>Organization</label>
            <input name="org" defaultValue={activeAccount.org} />
          </fieldset>
        </div>
        <div className="flex gap-s">
          <button value="edit">Edit Account</button>
          <button value="delete" className="danger">Delete Account</button>
          <button value="cancel" type="button" onClick={() => accountDetailsModalRef.current.close()}>Cancel</button>
        </div>
      </form> }
    </Modal>
  }

  function ConfirmDeleteAccountDialog () {
    const shouldRender = !!activeAccount
    return <Modal modalId="remove-account-confirmation" modalRef={confirmDeleteAccountDialogRef}>
      { shouldRender && <form method="dialog">
        <p>Are you sure you want to remove this account?</p>
        <p>{ activeAccount.name }</p>
        <div className="flex gap-s">
          <button onClick={() => confirmDeleteAccount(activeAccount.id)}>OK</button>
          <button value="cancel" onClick={() => confirmDeleteAccountDialogRef.current.close()}>Cancel</button>
        </div>
      </form> }
    </Modal>
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
      <h2>Transaction Categories</h2>
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
        <p>&nbsp;</p>
        <h3>Add Category</h3>
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
