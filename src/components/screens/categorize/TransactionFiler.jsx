import { useContext, useEffect, useState, useRef } from 'react'

import { addCategory, addStringMatcher, addUserAccount, addTransaction } from '~/database/db'

import { VaultContext } from '@/context/VaultContext'
import AccountSelector from '@/forms/AccountSelector'
import RegexMatcherInput from '@/forms/RegexMatcherInput'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'
import IconButton from '@/ui/IconButton'
import Modal from '@/ui/Modal'

export default function TransactionFiler ({ transactionDataToCategorize, removeTransactionFn }) {
  const {
    categories, updateCategories,
    accounts, updateAccounts,
    stringMatchers, updateStringMatchers,
    transactions, updateTransactions,
  } = useContext(VaultContext)

  const numOfTransactions = transactionDataToCategorize.transactions.length
  // If the file contains account id, check for a matching one in db. If none is created yet, preselect "Import" option
  const defaultAccountId = transactionDataToCategorize.account ?
    accounts.find(acct => acct.id == transactionDataToCategorize.account.id) || '_import' :
    accounts.length > 0 ? accounts[0] : ''

  const uploadCategorizerFormRef = useRef(null)
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId)
  const [selectedCategories, setSelectedCategories] = useState(Array.from({length: numOfTransactions}))
  const [txnIndex, setTxnIndex] = useState(0)

  const thisTxn = transactionDataToCategorize.transactions[txnIndex]
  const autoMatch = thisTxn && stringMatchers.find(regex => thisTxn.name.match(regex.pattern))
  const txnAlreadySaved = thisTxn && transactions.find(txn => txn.id == thisTxn.fitid)

  useEffect(() => {
    // Auto select matching categories if one hasn't already been selected
    if (!selectedCategories[txnIndex]) {
      // Mark the current transaction's category
      if (txnAlreadySaved) {
        setSelectedCategoryAtIndex(txnIndex)(txnAlreadySaved.categoryId)
      } else if (autoMatch) {
        setSelectedCategoryAtIndex(txnIndex)(autoMatch.categoryId)
      }
    }
  }, [selectedCategories, txnIndex])

  function saveTransaction () {
    const formData = Object.fromEntries(new FormData(uploadCategorizerFormRef.current).entries())
    const txnObject = {
      id: formData.fitid,
      accountId: formData.accountId == '_new_' ? formData.newAccountId : formData.accountId,
      categoryId: formData.categoryId,
      txnDate: formData.date,
      txnAmount: formData.amount,
      txnName: formData.name,
      txnMemo: formData.memo,
      txnType: formData.type,
    }

    if (formData.regexMatch) {
      addStringMatcher({
        pattern: formData.regexMatch,
        categoryId: selectedCategories[txnIndex],
      }).then(() => {
        updateStringMatchers()
      })
    }

    if (formData.accountId === '_new_') {
      addUserAccount({
        id: formData.newAccountId,
        name: formData.newAccountName,
        org: formData.newAccountOrg,
      }).then((account) => {
        txnObject.accountId = account.id
        return addTransaction(txnObject)
      }).then(() => {
        console.log('transactions and new account added')
        updateAccounts()
        updateTransactions()
      })
    } else {
      addTransaction(txnObject).then(() => {
        console.log('transaction added')
        updateTransactions()
      })
    }
  }

  function removeTransactionAt (ind) {
    if (ind == numOfTransactions) {
      setTxnIndex(index => index - 1)
    }
    removeTransactionFn(ind)
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
      <input type="hidden" name="categoryId" value={selectedCategories[txnIndex] || ''} readOnly={true} />
      <div className="width-fit">
        { txnAlreadySaved ?
          <div>
            <button type="button" onClick={() => removeTransactionAt(txnIndex)}>Remove from Queue</button>
          </div> :
          <div>
          </div>
        }
        <AccountSelector name="accountId"
          accounts={accounts} updateAccounts={updateAccounts}
          selectedAccountId={selectedAccountId} selectAccountId={setSelectedAccountId}
          importingAccount={transactionDataToCategorize.account}
        />
      </div>
      <div className="transaction-list">
        <div className="pagination flex align-center">
          <IconButton preset="lArrow" className="text-l" fn={() => setTxnIndex(txnIndex - 1)} disabled={txnIndex == 0} />
          <h2>Transaction {txnIndex + 1} of {numOfTransactions}:</h2>
          <IconButton preset="rArrow" className="text-l" fn={() => setTxnIndex(txnIndex + 1)} disabled={txnIndex == numOfTransactions - 1} />
        </div>
        { txnAlreadySaved && <p className="text-accent">This transaction is already saved.</p> }
        <TransactionToCategorize key={txnIndex}
          transaction={thisTxn}
          categories={categories}
          updateCategories={updateCategories}
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

function TransactionToCategorize ({transaction, categories, updateCategories, selectedCategory, selectFn, autoMatch}) {
  const selectedCategoryObj = selectedCategory ? categories.find(cat => cat.id == selectedCategory) : null
  
  const addCategoryModalRef = useRef()
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
        <label>
          <h4>
            Category: { selectedCategoryObj ? selectedCategoryObj.catName : '(None Selected)' }
          </h4>
        </label>
        <IconButton preset="add" fn={() => addCategoryModalRef.current.open()} />
        <CategoryDisplay categoryList={categories} activeCatId={selectedCategory} setActiveFn={selectFn} />
      </fieldset>
      { selectedCategoryObj && <RegexMatcherInput txnName={modifiedFields.name || transaction.name} prefill={autoMatch?.pattern} /> }
    </div>
    <AddCategoryModal modalRef={addCategoryModalRef} activeCategory={selectedCategoryObj} updateCategories={updateCategories} />
  </div>
}

function AddCategoryModal ({ modalRef, activeCategory, updateCategories }) {
  const [catName, setCatName] = useState('')

  function addNewCategory () {
    const catAncestry = activeCategory.catAncestry ?
      activeCategory.catAncestry + ',' + activeCategory.id :
      activeCategory ? activeCategory.id : ''

    addCategory({
      catName,
      catAncestry,
    }).then(() => {
      updateCategories()
    })
  }

  return <Modal modalRef={modalRef} modalId="add-category-modal">
    <h3>Add Category</h3>
    <fieldset className="pad-bottom">
      <label>
        Category Name:
        { activeCategory && <>(Child of { activeCategory.catName })</> }
      </label>
      <input value={catName} onChange={(e) => setCatName(e.target.value)} />
    </fieldset>
    <div className="flex gap-s">
      <button onClick={addNewCategory}>Add Category</button>
      <button onClick={() => modalRef.current.close()}>Cancel</button>
    </div>
  </Modal>
}