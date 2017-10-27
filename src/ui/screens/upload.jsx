import React from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

import { updateTransaction } from '~/store/actions'
import { BackToMenuLink } from '~/router/link'
import { Categorizer } from '~/components/categorizer'

export class UploadScreen extends React.Component {
  constructor (props) {
    super(props)

    this.fileSelected = this.fileSelected.bind(this)
    this.readFile = this.readFile.bind(this)

    this.state = {
      formPhase: 1,
      fileIsValid: false,
      file: null,
      account: '',
      newTransactions: [],
      currentPosition: 0
    }
    this.reader = new FileReader()
    this.reader.onload = () => {
      ipcRenderer.send('file-upload', this.reader.result)
    }
    ipcRenderer.on('upload-complete', (event, data) => {
      this.setState({
        formPhase: 2,
        account: data.account,
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
    this.props.dispatch(updateTransaction(this.state.account, newTransactions[this.state.currentPosition]))
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
                <Categorizer key={this.state.newTransactions[this.state.currentPosition].id}
                             account={this.state.account}
                             transaction={this.state.newTransactions[this.state.currentPosition]}
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

export default connect()(UploadScreen)
