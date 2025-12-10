import { useContext, useEffect, useState, useRef } from 'react'

import * as db from '~/database/db'
import { getPendingTransactions } from '~/database/localStorage'
import { VaultContext } from '@/context/VaultContext'
import AccountSelector from '@/forms/AccountSelector'
import RegexMatcherInput from '@/forms/RegexMatcherInput'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'
import { Header } from '@/ui/Layout'
import IconButton from '@/ui/IconButton'

/**
 * Categorize transactions that are staged from the last file upload
 * 
 * @todo flesh out auto categorizer
 */
export default function CategorizeScreen () {
  const [stagedTransactions, setStagedTransactions] = useState(null)

  useEffect(() => {
    const localTransactions = getPendingTransactions()
    if (localTransactions) {
      setStagedTransactions(localTransactions)
    }
  }, [])

  return <div id="categorize">
    <Header>Categorize</Header>
    <main>
      { stagedTransactions?.transactions.length > 0 ?
        <UploadCategorizerForm
          transactionDataToCategorize={stagedTransactions}
        /> :
        <div>
          <p>There are no transactions pending to categorize.</p>
        </div>
      }
    </main>
  </div>
}

function UploadCategorizerForm ({ transactionDataToCategorize }) {
  const {
    categories,
    accounts, updateAccounts,
    stringMatchers,
    transactions,
  } = useContext(VaultContext)
  const uploadCategorizerFormRef = useRef(null)
  const numOfTransactions = transactionDataToCategorize.transactions.length
  // If the file contains account id, check for a matching one in db. If none is created yet, preselect "Import" option
  const defaultAccountId = transactionDataToCategorize.account ?
    accounts.find(acct => acct.id == transactionDataToCategorize.account.id) || '_import' :
    accounts.length > 0 ? accounts[0] : ''

  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId)
  const [selectedCategories, setSelectedCategories] = useState(Array.from({length: numOfTransactions}))
  const [txnIndex, setTxnIndex] = useState(0)

  const thisTxn = transactionDataToCategorize.transactions[txnIndex]
  const autoMatch = stringMatchers.find(regex => thisTxn.name.match(regex.pattern))
  const txnAlreadySaved = transactions.some(txn => txn.id == thisTxn.fitid)

  useEffect(() => {
    // Auto select matching categories if one hasn't already been selected
    if (!selectedCategories[txnIndex] && autoMatch) {
      setSelectedCategoryAtIndex(txnIndex)(autoMatch.categoryId)
    }
  }, [txnIndex])

  function saveTransaction () {
    const formData = Object.fromEntries(new FormData(uploadCategorizerFormRef.current).entries())
    const txnObject = {
      id: formData.fitid,
      accountId: formData.accountId == '_new_' ? formData.newAccountId : formData.accountId,
      categoryId: selectedCategories[txnIndex],
      txnDate: formData.date,
      txnAmount: formData.amount,
      txnName: formData.name,
      txnMemo: formData.memo,
      txnType: formData.type,
    }

    if (formData.regexMatch) {
      db.addStringMatcher({
        pattern: formData.regexMatch,
        categoryId: selectedCategories[txnIndex],
      }).then(() => {
        console.log('op complete', arguments)
        // updateStringMatchers()
      })
    }

    if (formData.accountId === '_new_') {
      db.addUserAccount({
        id: formData.newAccountId,
        name: formData.newAccountName,
        org: formData.newAccountOrg,
      }).then((account) => {
        txnObject.accountId = account.id
        return db.addTransaction(txnObject)
      }).then(() => {
        console.log('transactions and new account added')
        // updateAccounts()
        // updateTransactions()
      })
    } else {
      db.addTransaction(txnObject).then(() => {
        console.log('transaction added')
        // updateTransactions()
      })
    }
  }

  function setSelectedCategoryAtIndex (ind) {
    return (newCat) => {
      let arrCopy = [...selectedCategories]
      arrCopy[ind] = newCat
      setSelectedCategories(arrCopy)
    }
  }

  return <div className="upload-categorizer">
    <form ref={uploadCategorizerFormRef}>
      <div className="width-fit">
        <AccountSelector name="accountId"
          accounts={accounts} updateAccounts={updateAccounts}
          selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId}
          importingAccount={transactionDataToCategorize.account}
        />
      </div>
      <div className="transaction-list">
        <div className="pagination flex align-center">
          <IconButton preset="lArrow" className="text-l" fn={() => setTxnIndex(txnIndex - 1)} disabled={txnIndex == 0} />
          <h3>Transaction {txnIndex + 1} of {numOfTransactions}:</h3>
          <IconButton preset="rArrow" className="text-l" fn={() => setTxnIndex(txnIndex + 1)} disabled={txnIndex == numOfTransactions - 1} />
        </div>
        { txnAlreadySaved && <p className="text-accent">This transaction is already saved.</p> }
        <TransactionToCategorize key={txnIndex}
          transaction={thisTxn}
          categories={categories}
          selectedCategory={selectedCategories[txnIndex]}
          selectFn={setSelectedCategoryAtIndex(txnIndex)}
          autoMatch={autoMatch}
        />
        <div className="flex pad-s">
          <button type="button" className="width-fit" onClick={saveTransaction}>
            Save This Transaction
          </button>
          {/* Success icon */}
        </div>
      </div>
    </form>
  </div>
}

function EditableField ({fieldName, type = 'text', transaction, modifiedFields, setModifiedFields}) {
  return <>{ modifiedFields[fieldName] ?
    <input name={fieldName}
      type={type}
      value={modifiedFields[fieldName]}
      onChange={(e) => setModifiedFields({...modifiedFields, [fieldName]: e.target.value})}
    /> :
    <div>
      <IconButton preset="edit" fn={() => setModifiedFields({...modifiedFields, [fieldName]: transaction[fieldName]})} />
      { transaction[fieldName] }
      <input type="hidden" name={fieldName} value={transaction[fieldName]} readOnly />
    </div>
  }</>
}

function TransactionToCategorize ({transaction, categories, selectedCategory, selectFn, autoMatch}) {
  const selectedCategoryObj = selectedCategory ? categories.find(cat => cat.id == selectedCategory) : null
  const [modifiedFields, setModifiedFields] = useState({})

  // should change this to controlled input that passes state up
  return <div className="transaction-to-categorize">
    <div className="grid cols-2">
      <fieldset>
        <label>FITID:</label>
        <EditableField key="fitid"
          fieldName="fitid"
          transaction={transaction}
          modifiedFields={modifiedFields}
          setModifiedFields={setModifiedFields}
        />
      </fieldset>
      <fieldset>
        <label>Amount:</label>
        <EditableField key="amount"
          fieldName="amount"
          transaction={transaction}
          modifiedFields={modifiedFields}
          setModifiedFields={setModifiedFields}
        />
      </fieldset>
      <fieldset>
        <label>Name:</label>
        <EditableField key="name"
          fieldName="name"
          transaction={transaction}
          modifiedFields={modifiedFields}
          setModifiedFields={setModifiedFields}
        />
      </fieldset>
      <fieldset>
        <label>Type:</label>
        <EditableField key="type"
          fieldName="type"
          transaction={transaction}
          modifiedFields={modifiedFields}
          setModifiedFields={setModifiedFields}
        />
      </fieldset>
      <fieldset>
        <label>Date:</label>
        <EditableField key="date"
          fieldName="date"
          type="date"
          transaction={transaction}
          modifiedFields={modifiedFields}
          setModifiedFields={setModifiedFields}
        />
      </fieldset>
      <fieldset>
        <label>Memo:</label>
        <EditableField key="memo"
          fieldName="memo"
          transaction={transaction}
          modifiedFields={modifiedFields}
          setModifiedFields={setModifiedFields}
        />
      </fieldset>
      <fieldset>
        <label><h4>Category: { selectedCategoryObj ? selectedCategoryObj.catName : '(None Selected)' }</h4></label>
        <CategoryDisplay categoryList={categories} activeCatId={selectedCategory} setActiveFn={selectFn} />
      </fieldset>
      { selectedCategoryObj && <RegexMatcherInput txnName={modifiedFields.name || transaction.name} prefill={autoMatch?.pattern} /> }
    </div>
  </div>
}
