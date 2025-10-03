import fs from 'node:fs/promises'
import path from 'path'
import { app } from 'electron'

const fileName = 'vault.json'
const filePath = path.join(app.getPath('userData'), fileName)

/**
 * Backend function to write the given backup object to a json file
 */
export async function createBackupFile (backupObject) {
  return fs.writeFile(filePath, JSON.stringify(backupObject))
}

export async function readBackupFile () {
  let fileString = await fs.readFile(filePath, 'utf8')
  return JSON.parse(fileString)
}
