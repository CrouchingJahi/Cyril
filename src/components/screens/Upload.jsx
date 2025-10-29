import { useEffect, useState, useRef } from 'react'
import * as db from '~/database/db'
import parseTransactionFile from '~/utils/parseTransactionFile'
import AccountSelector from '@/forms/AccountSelector'
import RegexMatcherInput from '@/forms/RegexMatcherInput'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'
import TransactionMatcher from '@/transactionCategories/TransactionMatcher'
import { BackToMenuLink } from '@/router/Link'
import IconButton from '@/ui/IconButton'
import LoadingIcon from '@/ui/LoadingIcon'

const formPhases = {
  menu: 'menu',
  uploadFile: 'uploadFile',
  uploadManual: 'uploadManual',
  categorize: 'categorize',
  success: 'success',
}
const matcherOptions = {
  enterNew: 'enterNewMatcher',
  autoMatch: 'useAutoMatcher',
}

/**
 * Allows the user to upload transactions either via file or manually.
 * 
 * @todo flesh out auto categorizer
 * @todo detect duplicate transactions on file upload
 * @todo auto-highlight matcher in RegexMatcherInput when one was auto matched
 */
export default function UploadScreen () {
  const [userAccounts, setUserAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [stringMatchers, setStringMatchers] = useState([])
  const [formPhase, setFormPhase] = useState(formPhases.menu)
  const [transactionDataToCategorize, setTransactionDataToCategorize] = useState(null)

  useEffect(() => {
    db.getUserAccounts().then(setUserAccounts)
    db.getCategories().then(setCategories)
    db.getStringMatchers().then(setStringMatchers)
  }, [])

  // Callback for the server to send parsed transaction info that needs to be categorized
  function processFileTransactions (fileData) {
    setTransactionDataToCategorize(fileData)
    setFormPhase(formPhases.categorize)
  }

  return <div id="upload">
    <header>
      <BackToMenuLink />
      <h1>Upload</h1>
    </header>
    <main>
      { formPhase === formPhases.menu ? <UploadMenu />
       : formPhase === formPhases.uploadFile ? <UploadFileForm />
       : formPhase === formPhases.uploadManual ? <UploadManualForm />
       : formPhase === formPhases.categorize ? <UploadCategorizerForm />
       : formPhase === formPhases.success ? <UploadSuccessMessage />
       : <div>Error</div>
      }
    </main>
  </div>

  function UploadMenu () {
    return <div>
      <p>What would you like to do?</p>
      <div className="list width-fit">
        <button onClick={() => setFormPhase(formPhases.uploadFile)}>Upload transaction files</button>
        <button onClick={() => setFormPhase(formPhases.uploadManual)}>Manually enter transactions</button>
      </div>
    </div>
  }

  function UploadManualForm () {
    const defaultMatcherOption = stringMatchers.length > 0 ? matcherOptions.autoMatch : matcherOptions.enterNew
    const [txnName, setTxnName] = useState('')
    const [selectedAccountId, setSelectedAccountId] = useState('')
    const [selectedRegexMatcher, setSelectedRegexMatcher] = useState(defaultMatcherOption)
    const [selectedCategoryId, setSelectedCategoryId] = useState(null)
    const selectedCategory = selectedCategoryId ? categories.find(cat => cat.id == selectedCategoryId) : null
    
    function submitManual (event) {
      event.preventDefault()
      let formData = Object.fromEntries(new FormData(event.target))
      let txn = {
        ...formData,
        categoryId: selectedCategoryId,
      }

      db.addTransaction(txn).then(() => {
        setFormPhase(formPhases.success)
      })
    }

    function handleMatcherChecked (event) {
      setSelectedRegexMatcher(event.target.value)
    }

    return <form onSubmit={submitManual}>
      <div className="grid cols-2">
        <AccountSelector name="accountId" accounts={userAccounts} setAccounts={setUserAccounts} selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId} />
        <fieldset>
          <label>Date:</label>
          <input name="txnDate" type="date" />
        </fieldset>
        <fieldset>
          <label>FITID:</label>
          <input name="id" type="text" />
        </fieldset>
        <fieldset>
          <label>Amount:</label>
          <input name="txnAmount" type="number" step="0.01" />
        </fieldset>
        <fieldset>
          <label>Memo:</label>
          <input name="txnMemo" type="text" />
        </fieldset>
        <fieldset>
          <label>Transaction Type:</label>
          <input name="txnType" type="text" />
        </fieldset>
        <fieldset>
          <label>Transaction Name:</label>
          <input name="txnName" type="text" value={txnName} onChange={e => setTxnName(e.target.value)} />
        </fieldset>
        <fieldset>
          <MatcherRadioOption optionName={matcherOptions.autoMatch}>
            Automatically Match Name To Category?
          </MatcherRadioOption>
          <MatcherRadioOption optionName={matcherOptions.enterNew}>
            Enter New Matcher?
          </MatcherRadioOption>
        </fieldset>
        <fieldset>
          <label><h4>Category: { selectedCategory ? selectedCategory.catName : '(None Selected)' }</h4></label>
          <CategoryDisplay categoryList={categories} activeCatId={selectedCategoryId} setActiveFn={setSelectedCategoryId} />
        </fieldset>
        { selectedRegexMatcher == matcherOptions.autoMatch && <fieldset>
          <TransactionMatcher stringMatchers={stringMatchers} categories={categories} transactionName={txnName} />
        </fieldset> }
        { selectedRegexMatcher == matcherOptions.enterNew && <RegexMatcherInput txnName={txnName} />}
      </div>
      <button>Add Transaction</button>
    </form>

    function MatcherRadioOption ({ optionName, children }) {
      return <div>
        <input type="radio" id={`regexMatcher-${optionName}`}
          name="regexMatcher" value={optionName}
          checked={selectedRegexMatcher == optionName}
          onChange={handleMatcherChecked}
        />
        <label htmlFor={`regexMatcher-${optionName}`}>{ children }</label>
      </div>
    }
  }

  function UploadFileForm () {
    const [selectedFile, setSelectedFile] = useState(null)

    function handleFileChange (event) {
      setSelectedFile(event.target.files[0])
    }

    function submitFile (event) {
      event.preventDefault()

      parseTransactionFile(selectedFile).then(processFileTransactions)
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

  function UploadCategorizerForm () {
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

  function TransactionToCategorize ({transaction, selectedCategory, selectFn, autoMatch}) {
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

  function UploadSuccessMessage () {
    return <div>
      <p>Transaction upload successful!</p>
      <button onClick={() => setFormPhase(formPhases.menu)}>Upload More</button>
    </div>
  }
}
