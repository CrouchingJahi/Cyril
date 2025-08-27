import path from 'path'
import fs from 'node:fs/promises'
import { app } from 'electron'

const defaultSettings = {
  dbLocation: app.getPath('userData'),
};

const settingsFilePath = path.join(app.getPath('userData'), 'cyril.json')

async function readUserSettings () {
  return fs.readFile(settingsFilePath, 'utf8').then((data) => {
    return data
  })
}

async function writeUserSettings (newSettings) {
  return fs.writeFile(settingsFilePath, JSON.stringify(newSettings)).then((data) => {
    console.log('writing user settings', newSettings, data)
  }).catch(err => {
    console.error(err)
  })
}

export const userSettings = {}

readUserSettings().then(data => {
  console.log('file read', data)
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
    writeUserSettings(userSettings)
  }
}).catch(err => {
  if (err.code == 'ENOENT') {
    // File doesn't exist yet; create it
    Object.assign(userSettings, defaultSettings)
    writeUserSettings(userSettings)
  } else {
    throw err
  }
})

