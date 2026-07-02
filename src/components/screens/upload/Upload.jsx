import { useContext, useEffect, useState } from 'react'

import { getPendingTransactions, savePendingTransactions } from '~/database/localStorage'
import parseTransactionFile, { dropDuplicateTransactionsFrom } from '~/utils/parseTransactionFile'
import { MessageContext } from '@/context/MessageContext'
import { VaultContext } from '@/context/VaultContext'
import { RouteContext, Routes } from '@/router'
import Link from '@/router/Link'

import UploadManualForm from './UploadManualForm'
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
  const {
    categories,
    accounts, updateAccounts,
    stringMatchers,
  } = useContext(VaultContext)
  const { changeRoute } = useContext(RouteContext)
  const { postMessage } = useContext(MessageContext)
  const [formPhase, setFormPhase] = useState(formPhases.loading)
  const [pendingTransactions, setPendingTransactions] = useState(null)

  useEffect(() => {
    setPendingTransactions(getPendingTransactions())
  }, [])

  useEffect(() => {
    if (accounts && categories && stringMatchers && formPhase === formPhases.loading) {
      setFormPhase(formPhases.menu)
    }
  }, [accounts, categories, stringMatchers])

  // Callback for the server to send parsed transaction info that needs to be categorized
  function processFileTransactions (fileData) {
    if (fileData?.transactions?.length > 0) {
      savePendingTransactions(fileData)
      changeRoute(Routes.Categorize)
    } else {
      postMessage('No new transactions contained in the uploaded file.')
    }
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
          userAccounts={accounts}
          updateAccounts={updateAccounts}
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
      { pendingTransactions?.transactions?.length > 0 && <div className="pad-bottom">
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
  const [actionForDuplicates, setActionForDuplicates] = useState()

  function handleFileChange (event) {
    setSelectedFile(event.target.files[0])
  }

  function submitFile (event) {
    event.preventDefault()

    parseTransactionFile(selectedFile).then((fileData) => {
      if (actionForDuplicates === 'keep') {
        uploadCallback(fileData)
      } else if (actionForDuplicates === 'drop') {
        uploadCallback(dropDuplicateTransactionsFrom(fileData))
      }
    })
  }

  function checkRadioActionForDuplicates (e) {
    setActionForDuplicates(e.target.value)
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
    <fieldset>
      <div>What to do with already-saved transactions:</div>
      <div className="list">
        <div>
          <input type="radio"
            id="duplicateAction--keep"
            name="duplicateAction"
            value="keep"
            checked={actionForDuplicates === 'keep'}
            onChange={checkRadioActionForDuplicates} />
          <label htmlFor="duplicateAction--keep">Keep To Recategorize</label>
        </div>
        <div>
          <input type="radio"
            id="duplicateAction--drop"
            name="duplicateAction"
            value="drop"
            checked={actionForDuplicates === 'drop'}
            onChange={checkRadioActionForDuplicates} />
          <label htmlFor="duplicateAction--drop">Automatically Drop Duplicates</label>
        </div>
      </div>
    </fieldset>
    <button type="submit" disabled={!selectedFile}>Process File</button>
  </form>
}
