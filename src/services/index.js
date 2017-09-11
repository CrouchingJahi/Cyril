import { ipcMain } from 'electron'

import uploadHandler from './fileUpload'

export default {
  listen () {
    ipcMain.on('file-upload', uploadHandler)
  }
}
