import { ipcMain } from 'electron'

import uploadHandler from './fileUpload'
import categoryHandler from './categories'

export default {
  listen () {
    ipcMain.on('file-upload', uploadHandler)
    ipcMain.on('request-categories', categoryHandler)
  }
}
