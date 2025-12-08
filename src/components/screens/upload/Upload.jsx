import { useEffect, useState } from 'react'

import * as db from '~/database/db'
import { getPendingTransactions, savePendingTransactions } from '~/database/localStorage'
import parseTransactionFile from '~/utils/parseTransactionFile'
import { RouteContext, Routes } from '@/router'
import Link from '@/router/Link'
import { Header } from '@/ui/Layout'
import LoadingIcon from '@/ui/LoadingIcon'

const formPhases = {
  loading: 'loading',
  menu: 'menu',
  uploadFile: 'uploadFile',
  uploadManual: 'uploadManual',
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
    savePendingTransactions(fileData)
    RouteContext.changeRoute(Routes.Categorize)
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
        <Link className="button" to={Routes.Categorize}>Go To Categorize</Link>
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
