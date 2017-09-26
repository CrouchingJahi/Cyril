import { ipcMain } from 'electron'

import uploadHandler from './fileUpload'
import categoryHandler from './categories'
import accountHandler from './accounts'

export default {
  listen () {
    ipcMain.on('file-upload', uploadHandler)
    ipcMain.on('request-categories', categoryHandler)
    ipcMain.on('request-accounts', accountHandler)
  }
}
