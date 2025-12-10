import { useEffect, useState, useRef } from 'react'
import { getTransactionCountForAccount, addUserAccount, modifyUserAccount, removeUserAccount } from '~/database/db'
import Modal from '@/ui/Modal'

export default function AccountOptions ({accounts, updateAccounts}) {
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
    getTransactionCountForAccount(account.id).then(trxCount => {
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
    addUserAccount(formData).then(res => {
      updateAccounts()
    })
    event.target.reset()
  }

  function handleEditAccount (event) {
    const formData = Object.fromEntries(new FormData(event.target))
    modifyUserAccount(formData).then(res => {
      updateAccounts()
      accountDetailsModalRef.current.close()
    })
  }

  function handleDeleteAccount () {
    confirmDeleteAccountDialogRef.current.open()
  }

  function confirmDeleteAccount (accountId) {
    removeUserAccount(accountId).then(([trxResult, acctResult]) => {
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
