import { useEffect, useRef } from 'react'
import Modal from '@/ui/Modal'
import { addUserAccount } from '~/database/db'

export default function AccountSelector ({ name, accounts, setAccounts, selectedAccountId, setSelectedAccountId}) {
  const newAccountModalRef = useRef(null)

  useEffect(() => {
    if (selectedAccountId == '_new') {
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
        <option value="_new">(Create New)</option>
      </select>
    </fieldset>
    <Modal modalId="new-account-modal" modalRef={newAccountModalRef} className="width-m">
      <form method="dialog" onSubmit={handleAddAccount}>
        <h4>Add Account</h4>
        <fieldset>
          <label htmlFor="accountName">Nickname</label>
          <input name="accountName" data-field="name" required />
        </fieldset>
        <fieldset>
          <label htmlFor="accountFid">Account Number</label>
          <input name="accountFid" data-field="id" required />
        </fieldset>
        <fieldset>
          <label htmlFor="accountOrg">Account Organization</label>
          <input name="accountOrg" data-field="org" required />
        </fieldset>
        <div className="flex gap-s">
          <button type="submit">Add Account</button>
          <button type="button" onClick={handleCancelModal}>Cancel</button>
        </div>
      </form>
    </Modal>
  </div>
}
