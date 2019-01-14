'use strict'

import { app, BrowserWindow } from 'electron'
// import { locals as style } from '../style/theme.scss'
/* TODO
  importing style directly is clashing with dev environment because
  babel-register cannot handle a .scss import. Need to figure out
  alternative for main process dev. Prod works fine since webpack picks
  up the import statement instead of babel
*/

const isDev = process.env.NODE_ENV !== 'production'

const windowOptions = {
  width: 1024,
  height: 768,
  // icon: 'images/icon.png',
  title: 'Cyril',
  // backgroundColor: style.bg,
  backgroundColor: '#333B3D',
  webPreferences: {
    nodeIntegration: false,
    // webSecurity: false,
  }
}

let mainWindow

function createWindow () {
  var win = new BrowserWindow(windowOptions)

  if (isDev) {
    win.webContents.openDevTools()
    win.loadURL(`http://localhost:9001`)
  } else {
    // may need to change this to something platform agnostic (format from 'url')
    win.loadURL(`file://${__dirname}/index.html`)
  }

  win.on('closed', () => {
    mainWindow = null
  })

  /*win.webContents.on('devtools-opened', () => {
    win.focus()
    setImmediate(() => {
      win.focus()
    })
  })*/

  return win
}

app.on('ready', () => {
  mainWindow = createWindow()
})

app.on('activate', () => {
  if (mainWindow === null) {
    mainWindow = createWindow()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
