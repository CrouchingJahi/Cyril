import React from 'react'
import { ipcRenderer } from 'electron'

import { BackToMenuLink } from '~/router/link'
import { Categorizer } from '~/components/categorizer'

export default class UploadScreen extends React.Component {
  constructor (props) {
    super(props)

    this.fileSelected = this.fileSelected.bind(this)
    this.readFile = this.readFile.bind(this)

    /*
    this.state = {
      formPhase: 1,
      fileIsValid: false,
      file: null,
      newTransactions: [],
      currentTransaction: 0
    }
    */
    this.state = {
      formPhase: 2,
      fileIsValid: false,
      file: null,
      newTransactions: [
        {"amount":9.45,"date":"2016-11-02T16:00:00.000Z","id":"20161102234836346617","memo":"24164076306937331457685; 05814; ;","name":"A AND F WEXNER51223097 NEW ALBAN","type":"DEBIT"},
        {"amount":3,"date":"2016-11-02T16:00:00.000Z","id":"20161102234836346626","memo":"24164076306937331466124; 05814; ;","name":"A AND F WEXNER51223097 NEW ALBAN","type":"DEBIT"},
        {"amount":4.91,"date":"2016-11-03T16:00:00.000Z","id":"20161104000837429344","memo":"24610436307010187494585; 05200; ;","name":"THE HOME DEPOT #3831 DUBLIN OH","type":"DEBIT"}
      ],
      currentPosition: 0,
      currentTransaction: {"amount":9.45,"date":"2016-11-02T16:00:00.000Z","id":"20161102234836346617","memo":"24164076306937331457685; 05814; ;","name":"A AND F WEXNER51223097 NEW ALBAN","type":"DEBIT"}
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
    })

    this.previousTransaction = this.previousTransaction.bind(this)
    this.nextTransaction = this.nextTransaction.bind(this)
    this.changeTransaction = this.changeTransaction.bind(this)
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
      currentPosition: this.state.currentPosition - 1
    })
  }

  nextTransaction () {
    this.setState({
      currentPosition: this.state.currentPosition + 1
    })
  }

  changeTransaction (state) {
    let newTransactions = this.state.newTransactions.slice()
    newTransactions[this.state.currentPosition] = Object.assign(newTransactions[this.state.currentPosition], state)
    this.setState({
      newTransactions
    })
  }

  render () {
    return (
      <div id="upload">
        <BackToMenuLink />
        <h2>Upload</h2>
        { this.state.formPhase == 1 ? (
            <div>
              <p>Accepts .ofx, .qfx files</p>
              <p><input type="file" name="ofx" accept=".ofx, .qfx" onChange={this.fileSelected} disabled={this.state.formPhase != 1} /></p>
              <button type="button" onClick={this.readFile} disabled={!this.state.fileIsValid}>Upload</button>
            </div>
          ) : this.state.formPhase == 2 ? (
            <div>
              { this.state.newTransactions.length } new transactions have been found. Now, you may categorize them:
              <div className="categorization-box">
                <button disabled={ this.state.currentPosition == 0 } onClick={this.previousTransaction}>&lt; Prev</button>
                <span>{this.state.currentPosition + 1}/{this.state.newTransactions.length}</span>
                <button disabled={ this.state.currentPosition == this.state.newTransactions.length - 1 } onClick={this.nextTransaction}>Next &gt;</button>
                <Categorizer key={this.state.newTransactions[this.state.currentPosition].id} transaction={this.state.newTransactions[this.state.currentPosition]}
                             onChange={this.changeTransaction} />
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
