import { useState } from 'react'
// import { ipcRenderer } from 'electron'
import { BackToMenuLink } from '@/router/Link'

export default function UploadScreen () {
  const [formPhase, setFormPhase] = useState('menu')
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

  function UploadMenu () {
    return <div>
      <p>What would you like to do?</p>
      <ul>
        <li><button className="link" onClick={() => setFormPhase('uploadFile')}>Upload transaction files</button></li>
        <li><button className="link" onClick={() => setFormPhase('uploadManual')}>Manually enter a transaction</button></li>
      </ul>
    </div>
  }

  return <div id="upload">
    <header>
      <BackToMenuLink />
      <h2>Upload</h2>
    </header>
    <main>
      { formPhase === 'menu' ? (
        <UploadMenu />
      ) : formPhase === 'uploadFile' ? (
        <UploadFileForm />
      ) : formPhase === 'uploadManual' ? (
        <UploadManualForm />
      ) : (
        <UploadCategorizerForm />
      )
      }
    </main>
    <footer>
      {/* <TransactionTabBar /> */}
    </footer>
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
    <form></form>
  )
}

function UploadCategorizerForm() {
  return (
    <form></form>
  )
}
