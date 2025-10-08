import path from 'path'
import fs from 'node:fs/promises'
import { app, screen } from 'electron'

let initialized = false
const userSettings = {}

const settingsFilePath = path.join(app.getPath('userData'), 'cyril.json')

async function readSettingsFile () {
  return fs.readFile(settingsFilePath, 'utf8').then((data) => {
    return JSON.parse(data)
  })
}
async function writeSettingsFile (newSettings) {
  return fs.writeFile(settingsFilePath, JSON.stringify(newSettings))
}

function createDefaultSettings () {
  const thisDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  return {
    backupFile: {
      filePath: path.join(app.getPath('userData'), 'vault.json')
    },
    windowPosition: {
      x: thisDisplay.bounds.x,
      y: thisDisplay.bounds.y,
      w: thisDisplay.workAreaSize.width / 2,
      h: thisDisplay.workAreaSize.height,
    },
  }
}
async function initializeSettings () {
  const defaultSettings = createDefaultSettings()

  return readSettingsFile().then(data => {
    Object.assign(userSettings, data || {})

    // Update stored settings with any missing keys
    let keyDifferences = false
    for (let sKey in defaultSettings) {
      if (!userSettings.hasOwnProperty(sKey)) {
        userSettings[sKey] = defaultSettings[sKey]
        keyDifferences = true
      }
    }
    if (keyDifferences) {
      writeSettingsFile(userSettings)
    }
  }).catch(err => {
    if (err.code == 'ENOENT') {
      // File doesn't exist yet; create it
      Object.assign(userSettings, defaultSettings)
      writeSettingsFile(userSettings)
    } else {
      throw err
    }
  })
}

export async function getUserSettings () {
  if (initialized) {
    return userSettings
  } else {
    await initializeSettings()
    initialized = true
    return userSettings
  }
}

export async function saveUserWindowPosition (position) {
  Object.assign(userSettings, {
    windowPosition: {
      x: position.x,
      y: position.y,
      w: position.width,
      h: position.height,
    }
  })
  writeSettingsFile(userSettings)
}
