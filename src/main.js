import { app, BrowserWindow, ipcMain, shell } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import path from 'node:path';

import style from './components/theme.module.scss';
import { userSettings } from './utils/userSettings';
import getDB from './database/db';

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: 'assets/Cyril.ico',
    backgroundColor: style.bgColor,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  return installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('Extension error occurred: ', err));
}).then(() => {

  // Init storage
  const db = getDB();
  // console.log(db.exec('SELECT * FROM users'))+

  // Backend API functions
  ipcMain.on('getVersion', (event) => {
    event.returnValue = app.getVersion();
  });

  ipcMain.on('openGithubLink', () => {
    //TODO import this from package json
    const githubLink = 'https://github.com/CrouchingJahi/Cyril';
    shell.openExternal(githubLink);
  });

  ipcMain.on('loginUser', (event, localUser) => {
    console.log('login user call', localUser);
    // grab localStorage data from event call
    if (localUser) {
      // match local user?
      event.returnValue = userSettings;
    }
  });

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
