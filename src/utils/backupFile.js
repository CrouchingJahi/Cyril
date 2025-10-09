import fs from 'node:fs/promises'
import { getUserSettings } from '~/utils/userSettings'

/**
 * Backend function to write the given backup object to a json file
 */
export async function createBackupFile (backupObject) {
  const userSettings = await getUserSettings()
  const filePath = userSettings.backupFile.filePath
  await fs.writeFile(filePath, JSON.stringify(backupObject))
  return filePath
}

export async function readBackupFile (pathName) {
  const userSettings = await getUserSettings()
  const filePath = pathName || userSettings.backupFile.filePath
  let fileString = await fs.readFile(filePath, 'utf8')
  return JSON.parse(fileString)
}
