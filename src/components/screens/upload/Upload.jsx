import { useEffect, useState, useRef } from 'react'
import * as db from '~/database/db'
import { getPendingTransactions, savePendingTransactions } from '~/database/localStorage'
import parseTransactionFile from '~/utils/parseTransactionFile'
import AccountSelector from '@/forms/AccountSelector'
import RegexMatcherInput from '@/forms/RegexMatcherInput'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'
import { RouteContext } from '@/router'
import Link from '@/router/Link'
import { Header } from '@/ui/Layout'
import IconButton from '@/ui/IconButton'
import LoadingIcon from '@/ui/LoadingIcon'

const formPhases = {
  loading: 'loading',
  menu: 'menu',
  uploadFile: 'uploadFile',
  uploadManual: 'uploadManual',
  categorize: 'categorize',
  success: 'success',
}

/**
 * Allows the user to upload transactions either via file or manually.
 * 
 * @todo detect duplicate transactions on file upload
 * @todo auto-highlight matcher in RegexMatcherInput when one was auto matched
 */
export default function UploadScreen () {
  const [userAccounts, setUserAccounts] = useState(null)
  const [categories, setCategories] = useState(null)
  const [stringMatchers, setStringMatchers] = useState(null)
  const [formPhase, setFormPhase] = useState(formPhases.loading)
  const [pendingTransactions, setPendingTransactions] = useState(null)
  const [transactionDataToCategorize, setTransactionDataToCategorize] = useState(null)

  useEffect(() => {
    db.getUserAccounts().then(setUserAccounts)
    db.getCategories().then(setCategories)
    db.getStringMatchers().then(setStringMatchers)
    setPendingTransactions(getPendingTransactions())
  }, [])

  useEffect(() => {
    if (userAccounts && categories && stringMatchers && formPhase === formPhases.loading) {
      setFormPhase(formPhases.menu)
    }
  }, [userAccounts, categories, stringMatchers])

  // Callback for the server to send parsed transaction info that needs to be categorized
  function processFileTransactions (fileData) {
    setTransactionDataToCategorize(fileData)
    savePendingTransactions(fileData)
    RouteContext.changeRoute('categorize')
  }

  return <div id="upload">
    <Header>Upload</Header>
    <main>
      { formPhase === formPhases.loading ?
        <LoadingIcon />
       : formPhase === formPhases.menu ?
        <UploadMenu />
       : formPhase === formPhases.uploadFile ?
        <UploadFileForm uploadCallback={processFileTransactions} />
       : formPhase === formPhases.uploadManual ?
        <UploadManualForm
          userAccounts={userAccounts}
          setUserAccounts={setUserAccounts}
          categories={categories}
          stringMatchers={stringMatchers}
          setFormPhase={setFormPhase}
        />
       : formPhase === formPhases.categorize ?
        <UploadCategorizerForm
          userAccounts={userAccounts}
          setUserAccounts={setUserAccounts}
          categories={categories}
          stringMatchers={stringMatchers}
          transactionDataToCategorize={transactionDataToCategorize}
        />
       : formPhase === formPhases.success ?
        <UploadSuccessMessage />
       : <div className="danger">Error</div>
      }
    </main>
  </div>

  function UploadMenu () {
    return <div>
      <p>What would you like to do?</p>
      { pendingTransactions?.transactions.length > 0 && <div className="pad-bottom">
        <p>You already have transactions pending. Go to the Categorize screen to sort them out, or continue to add new transactions to the queue.</p>
        <Link className="button" to="categorize">Go To Categorize</Link>
      </div> }
      <div className="list width-fit">
        <button onClick={() => setFormPhase(formPhases.uploadFile)}>Upload transaction files</button>
        <button onClick={() => setFormPhase(formPhases.uploadManual)}>Manually enter transactions</button>        
      </div>
    </div>
  }

  function UploadSuccessMessage () {
    return <div>
      <p>Transaction upload successful!</p>
      <button onClick={() => setFormPhase(formPhases.menu)}>Upload More</button>
    </div>
  }
}

function UploadCategorizerForm ({ userAccounts, setUserAccounts, categories, stringMatchers, transactionDataToCategorize }) {
  if (!transactionDataToCategorize) {
    return <LoadingIcon />
  }
  const uploadCategorizerFormRef = useRef(null)
  const numOfTransactions = transactionDataToCategorize.transactions.length
  // If the file contains account id, check for a matching one in db. If none is created yet, preselect "Import" option
  const defaultAccountId = transactionDataToCategorize.account ? userAccounts.find(acct => acct.id == transactionDataToCategorize.account.id) || '_import' : userAccounts.length > 0 ? userAccounts[0] : ''
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId)
  const [selectedCategories, setSelectedCategories] = useState(Array.from({length: numOfTransactions}))
  const [txnIndex, setTxnIndex] = useState(0)
  const [allTxns, setAllTxns] = useState([])
  const thisTxn = transactionDataToCategorize.transactions[txnIndex]
  const autoMatch = stringMatchers.find(regex => thisTxn.name.match(regex.pattern))
  const txnAlreadySaved = allTxns.some(txn => txn.id == thisTxn.fitid)

  useEffect(() => {
    db.getTransactions().then(setAllTxns)
  }, [])

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
      })
    }

    if (formData.accountId === '_new_') {
      db.addUserAccount({
        id: formData.newAccountId,
        name: formData.newAccountName,
        org: formData.newAccountOrg,
      }).then((account) => {
        txnObject.accountId = account.id
        db.addTransaction(txnObject)
      })
    } else {
      db.addTransaction(txnObject)
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
        <AccountSelector name="accountId" accounts={userAccounts} setAccounts={setUserAccounts} selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId} importingAccount={transactionDataToCategorize.account} />
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

function UploadFileForm ({uploadCallback}) {
  const [selectedFile, setSelectedFile] = useState(null)

  function handleFileChange (event) {
    setSelectedFile(event.target.files[0])
  }

  function submitFile (event) {
    event.preventDefault()

    parseTransactionFile(selectedFile).then(uploadCallback)
  }

  return <form onSubmit={submitFile}>
    <p>Accepts .qfx & .csv files</p>
    <fieldset className="width-fit pad-bottom gap-s row">
      <label htmlFor="fileUpload">
        <div className="button">Upload File</div>
      </label>
      <input type="file"
        id="fileUpload"
        name="fileUpload"
        className={selectedFile ? 'border-accent' : ''}
        accept=".qfx,.csv"
        onChange={handleFileChange}
      />
      <p>{ selectedFile && `Selected: ${selectedFile.name}` }&nbsp;</p>
    </fieldset>
    <button type="submit" disabled={!selectedFile}>Process File</button>
  </form>
}
