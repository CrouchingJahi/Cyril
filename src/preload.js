// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('cyrilAPI', {
  getVersion: () => ipcRenderer.sendSync('getVersion'),
  openGithubLink: () => ipcRenderer.send('openGithubLink'),
  loginUser: (localUser) => ipcRenderer.send('loginUser', localUser),
  getUserSettings: async () => await ipcRenderer.invoke('getUserSettings'),
  createBackupFile: async (backupObj) => await ipcRenderer.invoke('createBackupFile', backupObj),
  readBackupFile: async (filePath) => await ipcRenderer.invoke('readBackupFile', filePath),
  doesBackupFileExist: async () => await ipcRenderer.invoke('doesBackupFileExist'),
  openAppFolder: () => ipcRenderer.send('openAppFolder'),
})
