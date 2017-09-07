import React from 'react'
import { ipcRenderer } from 'electron'

import { BackToMenuLink } from '~/router/link'

export default class UploadScreen extends React.Component {
  constructor (props) {
    super(props)

    this.fileSelected = this.fileSelected.bind(this)
    this.readFile = this.readFile.bind(this)

    this.state = {
      file: null
    }
    this.reader = new FileReader()
    this.reader.onload = () => {
      ipcRenderer.send('file-upload', this.reader.result)
    }
    ipcRenderer.on('upload-complete', (event, data) => {
      console.log(data.transactionsFound + ' records processed.')
    })
  }

  fileSelected (e) {
    this.setState({
      file: e.target.files[0]
    })
  }

  readFile() {
    var file = this.state.file
    if (file) {
      if (file.name.match(/\.(qfx|ofx)$/)) {
        this.reader.readAsText(file)
      }
    }
  }

  render () {
    return (
      <div id="upload">
        <BackToMenuLink />
        <h2>Upload</h2>
        <p><input type="file" name="ofx" accept=".ofx,.qfx" onChange={this.fileSelected} /></p>
        <button>Upload</button>
      </div>
    )
  }
}
