// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'

/*
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
})
*/

contextBridge.exposeInMainWorld('cyrilAPI', {
  getVersion: () => ipcRenderer.sendSync('getVersion'),
  openGithubLink: () => ipcRenderer.send('openGithubLink'),
  loginUser: (localUser) => ipcRenderer.send('loginUser', localUser),
  createBackupFile: async (backupObj) => await ipcRenderer.invoke('createBackupFile', backupObj),
  readBackupFile: async (filePath) => await ipcRenderer.invoke('readBackupFile', filePath),
  openAppFolder: () => ipcRenderer.send('openAppFolder'),
})

/*
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
*/
