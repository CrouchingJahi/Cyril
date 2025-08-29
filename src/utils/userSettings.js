import path from 'path'
import fs from 'node:fs/promises'
import { app } from 'electron'

const defaultSettings = {
  dbLocation: app.getPath('userData'),
};

const settingsFilePath = path.join(app.getPath('userData'), 'cyril.json')

async function readSettingsFile () {
  return fs.readFile(settingsFilePath, 'utf8').then((data) => {
    return data
  })
}

async function writeSettingsFile (newSettings) {
  return fs.writeFile(settingsFilePath, JSON.stringify(newSettings))
}

const userSettings = {}

let initialized = false

async function initializeSettings () {
  return readSettingsFile().then(data => {
    if (data) {
      Object.assign(userSettings, JSON.parse(data))
    }

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
