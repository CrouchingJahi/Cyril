import { useEffect, useState, useRef } from 'react'
import { getUserAccounts, getTransactionCategories } from '~/database/db'
import parseQfx from '~/utils/parseQfx'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'
import Link, { BackToMenuLink } from '@/router/Link'
import IconButton from '@/ui/IconButton'

const formPhases = {
  menu: 'menu',
  uploadFile: 'uploadFile',
  uploadManual: 'uploadManual',
  categorize: 'categorize',
}

/**
 * Allows the user to upload transactions either via file or manually.
 * 
 * @todo flesh out auto categorizer
 * @todo support more file formats - .ofx, .csv
 */
export default function UploadScreen () {
  const [userAccounts, setUserAccounts] = useState([])
  const [transactionCategories, setTransactionCategories] = useState([])
  const [formPhase, setFormPhase] = useState(formPhases.menu)
  const [transactionDataToCategorize, setTransactionDataToCategorize] = useState(null)

  useEffect(() => {
    getUserAccounts().then(setUserAccounts)
    getTransactionCategories().then(setTransactionCategories)
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
      { !userAccounts.length && <div>
          <p>No user accounts found. Go to the <Link to="settings">Settings</Link> page to add a user account.</p>
        </div>
      }
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
      <div className="list fit-width">
        <button onClick={() => setFormPhase(formPhases.uploadFile)}>Upload transaction files</button>
        <button onClick={() => setFormPhase(formPhases.uploadManual)}>Manually enter transactions</button>
      </div>
    </div>
  }

  function UploadManualForm() {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const selectedCategoryName = selectedCategory ? transactionCategories.find(cat => cat.id == selectedCategory).catName : '(None Selected)'

    function submitManual (event) {
      event.preventDefault()
      let formData = new FormData(event.target)
      let trx = Object.fromEntries(formData.entries())
      trx.categoryId = selectedCategory
      console.log(trx)
      // addTransaction(trx)
      // on success, show screen with button to go back to menu or upload another
      // setFormPhase(formPhases.menu)
    }

    return <form onSubmit={submitManual}>
      <fieldset>
        <label>Account:</label>
        <select name="accountId">
          { userAccounts.map(acct => <option key={acct.id} value={acct.id}>{ acct.name }</option>) }
        </select>
      </fieldset>
      <fieldset>
        <label>Category: { selectedCategoryName }</label>
        <CategoryDisplay categoryList={transactionCategories} selected={selectedCategory} selectFn={setSelectedCategory} />
      </fieldset>
      <fieldset>
        <label>Transaction Name:</label>
        <input name="trnName" type="text" />
      </fieldset>
      <fieldset>
        <label>Amount:</label>
        <input name="trnAmount" type="number" step="0.01" />
      </fieldset>
      <fieldset>
        <label>Memo:</label>
        <input name="trnMemo" type="text" />
      </fieldset>
      <fieldset>
        <label>Transaction Type:</label>
        <input name="trnType" type="text" />
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
      <fieldset className="fit-width">
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
      // Loading screen
      return null
    }
    const uploadCategorizerRef = useRef(null)
    const userAccountMatch = userAccounts.find(acct => acct.fid == transactionDataToCategorize.accountId)
    const numOfTransactions = transactionDataToCategorize.transactions.length
    const [selectedCategories, setSelectedCategories] = useState(Array.from({length: numOfTransactions}))
    const [trxIndex, setTrxIndex] = useState(0)

    function saveTransaction (selectedCategory) {
      const formData = Object.fromEntries(new FormData(uploadCategorizerRef.current).entries())

      console.log(formData, selectedCategory)
      /*
      addTransaction({
        accountId: formData.accountId,
        categoryId: selectedCategories[trxIndex],
      })
      */
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
        <div>{ numOfTransactions } transactions found to categorize</div>
        <fieldset>
          <label>Account:</label>
          <select name="accountId" defaultValue={userAccountMatch?.id}>
            { userAccounts.map(acct => <option key={acct.id} value={acct.id}>{ acct.name }</option>) }
            {/* Create new account option */}
          </select>
        </fieldset>
        <div className="transaction-list">
          Transaction {trxIndex + 1}
          <TransactionToCategorize
            transaction={transactionDataToCategorize.transactions[trxIndex]}
            saveFn={saveTransaction}
            selectedCategory={selectedCategories[trxIndex]}
            selectFn={setSelectedCategoryAtIndex(trxIndex)}
          />
          <div className="pagination">
            <IconButton preset="lArrow" fn={() => setTrxIndex(trxIndex - 1)} disabled={trxIndex == 0} />
            <IconButton preset="rArrow" fn={() => setTrxIndex(trxIndex + 1)} disabled={trxIndex == numOfTransactions - 1} />
          </div>
        </div>
      </form>
    </div>
  }

  function TransactionToCategorize ({transaction, saveFn, selectedCategory, selectFn}) {
    const selectedCategoryName = selectedCategory ? transactionCategories.find(cat => cat.id == selectedCategory).catName : '(None Selected)'
    const formattedDate = transaction.date.toISOString().split('T')[0]

    // should change this to controlled input that passes state up
    return <div>
      <fieldset>
        <label>Name:</label>
        <input name="trnName" defaultValue={transaction.name} />
      </fieldset>
      <fieldset>
        <label>Memo:</label>
        <input name="trnMemo" defaultValue={transaction.memo} />
      </fieldset>
      <fieldset>
        <label>Type:</label>
        <input name="trnType" defaultValue={transaction.type} />
      </fieldset>
      <fieldset>
        <label>Amount:</label>
        <input name="trnAmount" defaultValue={transaction.amount} />
      </fieldset>
      <fieldset>
        <label>Date:</label>
        <input name="trnDate" type="date" defaultValue={formattedDate} />
      </fieldset>
      <fieldset>
        <label>Category: { selectedCategoryName }</label>
        <CategoryDisplay categoryList={transactionCategories} selected={selectedCategory} selectFn={selectFn} />
      </fieldset>
      <button type="button" onClick={() => saveFn(selectedCategory)}>Save This Transaction</button>
    </div>
  }
}
