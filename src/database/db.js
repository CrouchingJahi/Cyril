import * as RxDB from './rxdb'
import createBackupObject from './createBackupObject'

let db;

async function waitForInit () {
  return new Promise((resolve) => {
    if (db) {
      resolve(true)
    } else {
      window.addEventListener('VaultLoaded', function () {
        resolve(true)
      }, { once: true })
    }
  })
}

export async function getDB () {
  if (!db)  {
    db = await RxDB.getRxDB()
    // Add methods to global object for debug purposes
    Object.assign(db, {
      getUserAccounts, addUserAccount, removeUserAccount,
      getCategories, addCategory,
      getStringMatchers, addStringMatcher,
      createBackup, loadFromBackup,
    })
    window.dispatchEvent(new CustomEvent('VaultLoaded'))
  }
  return db
}

/**
 * 
 * @returns An object containing the database's contents, with the collections as the keys
 */
async function createBackupObject () {
  const backupObject = {}
  return Promise.all([
    getUserAccounts(),
    getCategories(),
    getStringMatchers(),
    getTransactions(),
  ]).then(([accounts, categories, stringMatchers, transactions]) => {
    backupObject.accounts = accounts
    backupObject.categories = categories
    backupObject.stringMatchers = stringMatchers
    backupObject.transactions = transactions
    return backupObject
  })
}
export function createBackup () {
  createBackupObject().then(backupObj => {
    window.cyrilAPI.createBackupFile(backupObj)
  })
}
export function loadFromBackup () {
  window.cyrilAPI.readBackupFile().then(backupData => {
    RxDB.loadFromBackup(db, backupData)
  })
}

// Passthrough methods for DB API
export async function getUserAccounts () {
  await waitForInit()
  return RxDB.getUserAccounts(db)
}
export async function addUserAccount (newAccount) {
  await waitForInit()
  return RxDB.addUserAccount(db, newAccount)
}
export async function removeUserAccount (accountId) {
  await waitForInit()
  return RxDB.removeUserAccount(db, accountId)
}
export async function getCategories () {
  await waitForInit()
  return RxDB.getCategories(db)
}
export async function addCategory (newCategory) {
  await waitForInit()
  return RxDB.addCategory(db, newCategory)
}
export async function modifyCategory (category) {
  await waitForInit()
  return RxDB.modifyCategory(db, category)
}
// accountId is optional - if null, return all transactions
export async function getTransactions(accountId) {
  await waitForInit()
  return RxDB.getTransactions(db, accountId)
}
export async function getTransactionCountForAccount (accountId) {
  await waitForInit()
  return RxDB.getTransactionCountForAccount(db, accountId)
}
export async function addTransaction (newTransaction) {
  await waitForInit()
  return RxDB.addTransaction(db, newTransaction)
}
export async function getStringMatchers () {
  await waitForInit()
  return RxDB.getStringMatchers(db)
}
export async function addStringMatcher (matcher) {
  await waitForInit()
  return RxDB.addStringMatcher(db, matcher)
}
export async function seedMockData () {
  await waitForInit()
  return RxDB.seedMockData(db)
}

/* Schemas
accounts {
  id: string,
  name: string,
  org: string,
}
categories {
  id: string,
  catName: string,
  catAncestry: string, // comma separated list of category's parent ids, in ascending order, until root
}
transactions {
  id: string,
  accountId: string, // id of account this transaction is listed under
  categoryId: string, // references category id
  txnDate: string, // ISO string YYYY-MM-DD
  txnAmount: number,
  txnName: string,
  txnMemo: string,
  txnType: string,
}
stringMatchers {
  id: string,
  pattern: string, // RegExp to match transaction name
  categoryId: string, // references category id
}
*/
