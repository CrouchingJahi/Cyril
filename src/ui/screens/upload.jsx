import React from 'react'
import { ipcRenderer } from 'electron'

import { BackToMenuLink } from '~/router/link'
import { Categorizer } from '~/components/categorizer'

export default class UploadScreen extends React.Component {
  constructor (props) {
    super(props)

    this.fileSelected = this.fileSelected.bind(this)
    this.readFile = this.readFile.bind(this)

    this.state = {
      formPhase: 1,
      fileIsValid: false,
      file: null,
      newTransactions: [],
      currentTransaction: 0
    }
    this.reader = new FileReader()
    this.reader.onload = () => {
      ipcRenderer.send('file-upload', this.reader.result)
    }
    ipcRenderer.on('upload-complete', (event, data) => {
      this.setState({
        formPhase: 2,
        newTransactions: data.newTransactions
      })
      console.log('Upload data processed:', data)
      // console.log(data.transactionsFound + ' records processed.')
    })

    this.previousTransaction = this.previousTransaction.bind(this)
    this.nextTransaction = this.nextTransaction.bind(this)
  }

  fileSelected (e) {
    this.setState({
      fileIsValid: !!e.target.files[0] && e.target.value.match(/\.(qfx|ofx)$/),
      file: e.target.files[0]
    })
  }

  readFile () {
    var file = this.state.file
    if (!!file && file.name.match(/\.(qfx|ofx)$/)) {
      this.reader.readAsText(file)
    }
  }

  previousTransaction () {
    this.setState({
      currentTransaction: this.state.currentTransaction - 1
    })
  }

  nextTransaction () {
    this.setState({
      currentTransaction: this.state.currentTransaction + 1
    })
  }

  render () {
    return (
      <div id="upload">
        <BackToMenuLink />
        <h2>Upload</h2>
        { this.state.formPhase == 1 ? (
            <div v-if="this.state.formPhase == 1">
              <p>Accepts .ofx, .qfx files</p>
              <p><input type="file" name="ofx" accept=".ofx, .qfx" onChange={this.fileSelected} disabled={this.state.formPhase != 1} /></p>
              <button type="button" onClick={this.readFile} disabled={!this.state.fileIsValid}>Upload</button>
            </div>
          ) : this.state.formPhase == 2 ? (
            <div>
              { this.state.newTransactions.length } new transactions have been found. Now, you may categorize them:
              <div className="categorization-box">
                <button disabled={ this.state.currentTransaction == 0 } onClick={this.previousTransaction}>&lt; Prev</button>
                <span>{this.state.currentTransaction + 1}/{this.state.newTransactions.length}</span>
                <button disabled={ this.state.currentTransaction == this.state.newTransactions.length - 1 } onClick={this.nextTransaction}>Next &gt;</button>
                <Categorizer transaction={ this.state.newTransactions[this.state.currentTransaction] } />
              </div>
            </div>
          ) : (
            <div></div>
          )
        }
      </div>
    )
  }
}
