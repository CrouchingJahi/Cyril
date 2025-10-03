import { useEffect, useState, useRef } from 'react'
import { getUserAccounts, getCategories, addUserAccount, addTransaction, addStringMatcher } from '~/database/db'
import parseQfx from '~/utils/parseQfx'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'
import CategoryMatcher from '../transactionCategories/CategoryMatcher'
import { BackToMenuLink } from '@/router/Link'
import IconButton from '@/ui/IconButton'
import LoadingIcon from '@/ui/LoadingIcon'

const formPhases = {
  menu: 'menu',
  uploadFile: 'uploadFile',
  uploadManual: 'uploadManual',
  categorize: 'categorize',
}

/**
 * Allows the user to upload transactions either via file or manually.
 * 
 * @todo create AccountSelector component with option to create new
 * @todo flesh out auto categorizer
 * @todo detect duplicate transactions on file upload
 * @todo support more file formats - .ofx, .csv
 */
export default function UploadScreen () {
  const [userAccounts, setUserAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [formPhase, setFormPhase] = useState(formPhases.menu)
  const [transactionDataToCategorize, setTransactionDataToCategorize] = useState(null)

  useEffect(() => {
    getUserAccounts().then(setUserAccounts)
    getCategories().then(setCategories)
  }, [])

  // Callback for the server to send parsed transaction info that needs to be categorized
  function processFileTransactions (fileData) {
    setTransactionDataToCategorize(fileData)
    setFormPhase(formPhases.categorize)
  }

  return <div id="upload">
    <header>
      <BackToMenuLink />
      <h2>Upload</h2>
    </header>
    <main>
      { formPhase === formPhases.menu ? <UploadMenu />
       : formPhase === formPhases.uploadFile ? <UploadFileForm />
       : formPhase === formPhases.uploadManual ? <UploadManualForm />
       : formPhase === formPhases.categorize ? <UploadCategorizerForm />
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

  function UploadManualForm() {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const selectedCategoryName = selectedCategory ? categories.find(cat => cat.id == selectedCategory).catName : '(None Selected)'

    function submitManual (event) {
      event.preventDefault()
      let formData = Object.fromEntries(new FormData(event.target))
      let txn = {
        ...formData,
        categoryId: selectedCategory,
      }

      console.log(txn)
      addTransaction(txn)
      // on success, show screen with button to go back to menu or upload another
      // setFormPhase(formPhases.menu)
    }

    return <form onSubmit={submitManual}>
      <fieldset>
        <label>Account:</label>
        <select name="accountId">
          { userAccounts.map(acct => <option key={acct.id} value={acct.id}>{ acct.name }</option>) }
          {/* New account - create AccountSelector component */}
        </select>
      </fieldset>
      <fieldset>
        <label>Category: { selectedCategoryName }</label>
        <CategoryDisplay categoryList={categories} activeCatId={selectedCategory} setActiveFn={setSelectedCategory} />
      </fieldset>
      <fieldset>
        <label>FITID:</label>
        <input name="id" type="text" />
      </fieldset>
      <fieldset>
        <label>Date:</label>
        <input name="txnDate" type="date" />
      </fieldset>
      <fieldset>
        <label>Transaction Name:</label>
        <input name="txnName" type="text" />
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
      <button>Add Transaction</button>
    </form>
  }

  function UploadFileForm () {
    const [selectedFile, setSelectedFile] = useState(null)

    function handleFileChange (event) {
      setSelectedFile(event.target.files[0])
    }

    function submitFile (event) {
      event.preventDefault()

      parseQfx(selectedFile).then(processFileTransactions)
    }

    return <form onSubmit={submitFile}>
      <p>Accepts .qfx files</p>
      <fieldset className="width-fit no-padding">
        <label htmlFor="fileUpload">
          <div className="button">Upload File</div>
        </label>
        <input type="file"
          id="fileUpload"
          name="fileUpload"
          accept=".qfx"
          onChange={handleFileChange}
        />
      </fieldset>
      <p>{ selectedFile && `Selected: ${selectedFile.name}` }&nbsp;</p>
      <button type="submit" disabled={!selectedFile}>Process File</button>
    </form>
  }

  function UploadCategorizerForm () {
    if (!transactionDataToCategorize) {
      return <LoadingIcon />
    }
    const uploadCategorizerRef = useRef(null)
    const userAccountMatch = userAccounts.find(acct => acct.fid == transactionDataToCategorize.accountId)
    const numOfTransactions = transactionDataToCategorize.transactions.length
    const [selectedCategories, setSelectedCategories] = useState(Array.from({length: numOfTransactions}))
    const [txnIndex, setTxnIndex] = useState(0)

    function saveTransaction () {
      const formData = Object.fromEntries(new FormData(uploadCategorizerRef.current).entries())
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
        addStringMatcher({
          pattern: formData.regexMatch,
          categoryId: selectedCategories[txnIndex],
        })
      }

      if (formData.accountId === '_new_') {
        addUserAccount({
          id: formData.newAccountId,
          name: formData.newAccountName,
          org: formData.newAccountOrg,
        }).then((account) => {
          txnObject.accountId = account.id
          addTransaction(txnObject)
        })
      } else {
        addTransaction(txnObject)
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
      <form ref={uploadCategorizerRef}>
        <fieldset>
          <label>Account:</label>
          <select name="accountId" className="width-m" defaultValue={userAccountMatch?.id}>
            { userAccounts.map(acct => <option key={acct.id} value={acct.id}>{ acct.name }</option>) }
            {/* { !userAccountMatch && <option value="_new_">(Create New)</option> } */}
          </select>
        </fieldset>
        <div className="transaction-list">
          <div className="pagination flex align-center">
            <IconButton preset="lArrow" className="text-l" fn={() => setTxnIndex(txnIndex - 1)} disabled={txnIndex == 0} />
            <h4>Transaction {txnIndex + 1} of {numOfTransactions}:</h4>
            <IconButton preset="rArrow" className="text-l" fn={() => setTxnIndex(txnIndex + 1)} disabled={txnIndex == numOfTransactions - 1} />
          </div>
          <TransactionToCategorize key={txnIndex}
            transaction={transactionDataToCategorize.transactions[txnIndex]}
            selectedCategory={selectedCategories[txnIndex]}
            selectFn={setSelectedCategoryAtIndex(txnIndex)}
          />
          <div className="flex padding-s">
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

  function TransactionToCategorize ({transaction, selectedCategory, selectFn}) {
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
        { selectedCategoryObj && <CategoryMatcher txnName={modifiedFields.name || transaction.name} /> }
      </div>
    </div>
  }
}
