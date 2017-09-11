require('babel-register');
const { app, BrowserWindow } = require('electron');
const { client } = require('electron-connect');
const API = require('./services').default;

var win;

API.listen();

app.on('ready', () => {
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    // icon: 'images/icon.png',
    title: 'Cyril',
    backgroundColor: '#333B3D'
  });
  win.loadURL(`file://${__dirname}/index.html`);
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });

  client.create(win);
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
