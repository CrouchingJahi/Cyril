import { useState } from 'react'
// import { ipcRenderer } from 'electron'
import { getUserAccounts, getTransactionCategories } from '~/database/db'
import Link, { BackToMenuLink } from '@/router/Link'

const formPhases = {
  menu: 'menu',
  uploadFile: 'uploadFile',
  uploadManual: 'uploadManual',
  categorize: 'categorize',
}

/**
 * Allows the user to upload transactions either via file or manually.
 */
export default async function UploadScreen () {
  const userAccounts = await getUserAccounts()
  const transactionCategories = await getTransactionCategories()
  const [formPhase, setFormPhase] = useState(formPhases.menu)
  const reader = new FileReader()
  reader.onload = () => {
    // ipcRenderer.send('file-upload', this.reader.result)
  }

  /*
    ipcRenderer.on('upload-complete', (event, data) => {
      this.setState({
        formPhase: 3
      })
      console.log('Upload data processed:', data)
    })
  */

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
    <footer>
      {/* <TransactionTabBar /> */}
    </footer>
  </div>
}

  function UploadMenu () {
    return <div>
      <p>What would you like to do?</p>
      <ul>
        <li><button onClick={() => setFormPhase(formPhases.uploadFile)}>Upload transaction files</button></li>
        <li><button onClick={() => setFormPhase(formPhases.uploadManual)}>Manually enter transactions</button></li>
      </ul>
    </div>
  }

function UploadFileForm({fileSelected, readFile, fileIsValid}) {
  return (
    <form>
      <p>Accepts .ofx, .qfx files</p>
      <p><input type="file" name="ofx" accept=".ofx, .qfx" onChange={fileSelected} /></p>
      <button type="button" onClick={readFile} disabled={!fileIsValid}>Upload</button>
    </form>
  )
}

function UploadManualForm() {
  return (
    <form>
      <fieldset>
        <label>Account:</label>
        <select>
          { userAccounts.map(acct => <option value={acct.id}>{ acct.name }</option>) }
        </select>
      </fieldset>
      <fieldset>
        <label>Category:</label>
        <CategoryDisplay categoryList={transactionCategories} selected={selectedCategory} selectFn={setSelectedCategory} />
      </fieldset>
      <fieldset>
        <input type="text" name="name" />
      </fieldset>
    </form>
  )
}

function UploadCategorizerForm() {
  return (
    <form></form>
  )
}
