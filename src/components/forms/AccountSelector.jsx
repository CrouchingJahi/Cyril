import { useEffect, useRef, useState } from 'react'
import Modal from '@/ui/Modal'
import { addUserAccount } from '~/database/db'

/**
 * A selector that lets the user choose between existing accounts, or to open a modal and create a new one
 * @param name the field name for the form element
 * @param importingAccount (opt) When the file import option is being used for the Upload screen, this will be an object containing the imported account data
 */
export default function AccountSelector ({ name, accounts, setAccounts, selectedAccountId, setSelectedAccountId, importingAccount}) {
  const [accountName, setAccountName] = useState('')
  const [accountFid, setAccountFid] = useState('')
  const [accountOrg, setAccountOrg] = useState('')
  const newAccountModalRef = useRef(null)
  const importingAccountAlreadyExists = importingAccount && accounts.some(acct => acct.id == importingAccount.id)

  useEffect(() => {
    if (selectedAccountId == '_new') {
      newAccountModalRef.current.open()
    } else if (selectedAccountId == '_import') {
      setAccountFid(importingAccount.id)
      setAccountOrg(importingAccount.org)
      newAccountModalRef.current.open()
    }
  }, [selectedAccountId])

  function handleAccountSelection (e) {
    setSelectedAccountId(e.target.value)
  }

  function handleAddAccount (event) {
    event.stopPropagation()
    const formData = Object.fromEntries(new FormData(event.target))
    addUserAccount(formData).then(res => {
      setAccounts([...accounts, res])
      setSelectedAccountId(res.id)
    })
    event.target.reset()
  }

  function handleCancelModal () {
    setSelectedAccountId(accounts[0]?.id || '')
    newAccountModalRef.current.close()
  }

  return <div>
    <fieldset>
      <label htmlFor={name}>Account:</label>
      <select name={name} value={selectedAccountId} onChange={handleAccountSelection}>
        { accounts.map(acct => <option key={acct.id} value={acct.id}>{ acct.name }</option>) }
        { accounts.length == 0 && <option value="">(No accounts exist)</option> }
        { importingAccount && !importingAccountAlreadyExists && <option value="_import">(Import from file)</option> }
        <option value="_new">(Create New)</option>
      </select>
    </fieldset>
    <Modal modalId="new-account-modal" modalRef={newAccountModalRef} className="width-m">
      <form method="dialog" onSubmit={handleAddAccount}>
        <h4>Add Account</h4>
        { importingAccount && <p>Account data was found in this file that isn't yet saved. Please name this account.</p> }
        <fieldset>
          <label htmlFor="accountName">Nickname</label>
          <input name="accountName" required
            value={accountName} onChange={(e) => setAccountName(e.target.value)}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="accountFid">Account Number</label>
          <input name="accountFid" required
            value={accountFid} onChange={(e) => setAccountFid(e.target.value)}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="accountOrg">Account Organization</label>
          <input name="accountOrg" required
            value={accountOrg} onChange={(e) => setAccountOrg(e.target.value)}
          />
        </fieldset>
        <div className="flex gap-s">
          <button type="submit">Add Account</button>
          <button type="button" onClick={handleCancelModal}>Cancel</button>
        </div>
      </form>
    </Modal>
  </div>
}
