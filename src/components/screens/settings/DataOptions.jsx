import { useEffect, useState, useRef } from 'react'
import Modal from '@/ui/Modal'

export default function DataOptions () {
  const [backupFileImportData, setBackupFileImportData] = useState(null)
  const [backupSaved, setBackupSaved] = useState(null)
  const [confirmSavePath, setConfirmSavePath] = useState('')
  const backupConfirmSaveModalRef = useRef(null)
  const backupFileImportModalRef = useRef(null)
  const clearDataModalRef = useRef(null)

  // Open modals once their data is filled in
  useEffect(() => {
    if (backupFileImportData) {
      backupFileImportModalRef.current.open()
    }
  }, [backupFileImportData])

  useEffect(() => {
    if (confirmSavePath) {
      backupConfirmSaveModalRef.current.open()
    }
  }, [confirmSavePath])

  function handleLoadBackup (e) {
    e.preventDefault()
    setBackupFileImportData(null)
    if (e.target.files.length) {
      cyrilAPI.readBackupFile(e.target.files[0].path).then(data => {
        // validate data
        setBackupFileImportData(data)
      })
    } 
  }

  function checkForBackupFile (e) {
    e.preventDefault()
    setConfirmSavePath('')
    cyrilAPI.doesBackupFileExist().then(resp => {
      if (resp.fileExists) {
        setConfirmSavePath(resp.filePath)
      } else {
        handleSaveBackup()
      }
    })
  }

  function handleSaveBackup () {
    db.createBackup().then(resp => {
      setBackupSaved({
        filePath: resp.filePath,
        accounts: resp.backupObj.accounts.length,
        categories: resp.backupObj.categories.length,
        stringMatchers: resp.backupObj.stringMatchers.length,
        transactions: resp.backupObj.transactions.length,
      })
    })
  }

  function handleClearDataModal (e) {
    e.preventDefault()
    clearDataModalRef.current.open()
  }

  function handleClearAll () {}
  function handleClearTransactions () {}

  return <section>
    <h2>Data</h2>
    <div className="pad-bottom">
      <h4>Load Backup File</h4>
      <div>File: (.json)</div>
      <input id="backupFile"
        name="backupFile"
        type="file" accept="json"
        onChange={handleLoadBackup}
      />
      <label htmlFor="backupFile" className="block button width-fit">
        Upload Backup File
      </label>
      <BackupFileImportModal />
    </div>
    <div className="pad-bottom">
      <h4>Save Backup File</h4>
      <button className="width-fit" onClick={checkForBackupFile} disabled={!!backupSaved}>Save</button>
      <ConfirmSaveDataModal />
      { backupSaved && <>
        <div>Backup saved!<br/>{ backupSaved.filePath }</div>
      </> }
    </div>
    <div className="pad-bottom">
      <h4>Clear Cyril Data</h4>
      <button className="width-fit danger" onClick={handleClearDataModal}>Clear Data</button>
      <ClearDataModal />
    </div>
  </section>

  function BackupFileImportModal () {
    function handleConfirmImport (e) {
      if (e.nativeEvent.submitter.value != 'cancel') {
        let formData = Object.fromEntries(new FormData(e.target).entries())
        cyrilVault.loadFromBackup(Object.keys(formData).join(','))
      }
    }

    return <Modal modalId="backup-file-import-modal" modalRef={backupFileImportModalRef} closeFn={() => setBackupFileImportData(null)}>
      { !!backupFileImportData && <>
        <div>Choose which backup data to import</div>
        <form method="dialog" onSubmit={handleConfirmImport}>
          <div className="list narrow margin-y">
            <ImportDataTableCheckbox tableKey="accounts" tableName="Accounts" />
            <ImportDataTableCheckbox tableKey="categories" tableName="Categories" />
            <ImportDataTableCheckbox tableKey="stringMatchers" tableName="Regex Matchers" />
            <ImportDataTableCheckbox tableKey="transactions" tableName="Transactions" />
          </div>
          <div className="flex gap-s">
            <button name="action" value="import">Import Selected Tables</button>
            <button name="action" value="cancel" type="reset" className="light" onClick={() => backupFileImportModalRef.current.close()}>Cancel</button>
          </div>
        </form>
      </> }
    </Modal>

    function ImportDataTableCheckbox ({tableKey, tableName }) {
      return backupFileImportData[tableKey].length == 0 ? null : <div>
        <input type="checkbox" id={`import-${tableKey}`} name={tableKey} defaultChecked="on" tabIndex="0" />
        <label htmlFor={`import-${tableKey}`}>
          { tableName } ({ backupFileImportData[tableKey].length })
        </label>
      </div>
    }
  }

  // Confirm overwriting when a file already exists
  function ConfirmSaveDataModal () {
    return <Modal modalId="confirm-save-modal" modalRef={backupConfirmSaveModalRef}>
      <h3>Backup File Already Exists</h3>
      <p>{ confirmSavePath }</p>
      <p>The backup file already exists. Are you sure you want to overwrite it?</p>
      <p>This is your chance to rename and/or move the file in order to keep this version of it.</p>
      <div className="flex gap-m">
        <button onClick={() => handleSaveBackup()}>Overwrite File</button>
        <button onClick={() => backupConfirmSaveModalRef.current.close()}>Cancel</button>
      </div>
    </Modal>
  }

  function ClearDataModal () {
    return <Modal modalId="clear-data-modal" modalRef={clearDataModalRef} className="border-danger">
      <form method="dialog">
        <h3>Clear Cyril Data</h3>
        <p>Are you sure you cant to clear all data? This cannot be undone, so make sure your backup is created.</p>
        <p></p>
        <p>This includes:</p>
        <ul>
          <li>Accounts</li>
          <li>Categories</li>
          <li>Transactions</li>
          <li>Regex Matchers</li>
        </ul>
        <p></p>
        <div className="flex gap-s">
          <button className="danger" onClick={handleClearAll}>Clear All</button>
          <button className="danger" onClick={handleClearTransactions}>Clear Transactions</button>
          <button value="cancel" onClick={() => clearDataModalRef.current.close()}>Cancel</button>
        </div>
      </form>
    </Modal>
  }
}
