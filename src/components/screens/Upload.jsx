import React from 'react'
// import { ipcRenderer } from 'electron'
import { BackToMenuLink } from '@/router/Link'
import TransactionTabBar from '@/transactionTabBar/TransactionTabBar'

// const { ipcRenderer } = window.require('electron')

export default class UploadScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      formPhase: 0
    }
    this.reader = new FileReader()
    this.reader.onload = () => {
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
  }

  setPhase(phase) {
    this.setState({
      formPhase: phase
    })
  }

  render() {
    return (
      <div id="upload">
        <header>
          <BackToMenuLink />
          <h2>Upload</h2>
        </header>
        <main>
          { state.formPhase === 0 ? (
            <div>
              <p>What would you like to do?</p>
              <ul>
                <li><button className="link" onClick={setPhase(1)}>Upload transaction files</button></li>
                <li><button className="link" onClick={setPhase(2)}>Manually enter a transaction</button></li>
              </ul>
            </div>
          ) : state.formPhase === 1 ? (
            <UploadFileForm />
          ) : state.formPhase === 2 ? (
            <UploadManualForm />
          ) : (
            <UploadCategorizerForm />
          )
          }
        </main>
        <footer>
          <TransactionTabBar />
        </footer>
      </div>
    )
  }
}

function UploadFileForm(props) {
  return (
    <form>
      <p>Accepts .ofx, .qfx files</p>
      <p><input type="file" name="ofx" accept=".ofx, .qfx" onChange={props.fileSelected} /></p>
      <button type="button" onClick={props.readFile} disabled={!props.fileIsValid}>Upload</button>
    </form>
  )
}

function UploadManualForm(props) {
  return (
    <form></form>
  )
}

function UploadCategorizerForm(props) {
  return (
    <form></form>
  )
}
