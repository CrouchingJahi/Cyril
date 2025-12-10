import * as IDB from './indexeddb'

let db;

export async function getDB () {
  if (!db)  {
    db = await IDB.getIDB()
    // Add methods to global object for debug purposes
    Object.assign(db, {
      getUserAccounts, addUserAccount, removeUserAccount,
      getCategories, addCategory,
      getStringMatchers, addStringMatcher,
      getTransactions, addTransaction,
      createBackup, loadFromBackup,
    })
    window.dispatchEvent(new CustomEvent('VaultLoaded'))
  }
  return db
}

// An object containing the database's contents, with the collections as the keys
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
export async function createBackup () {
  return createBackupObject().then(backupObj => {
    return window.cyrilAPI.createBackupFile(backupObj).then(filePath => {
      return { filePath, backupObj }
    })
  })
}
export function loadFromBackup (whichCollections) {
  window.cyrilAPI.readBackupFile().then(backupData => {
    IDB.loadFromBackup(backupData, whichCollections)
  })
}

// Passthrough methods for DB API
export async function getUserAccounts () {
  return IDB.getUserAccounts()
}
export async function addUserAccount (newAccount) {
  return IDB.addUserAccount(newAccount)
}
export async function modifyUserAccount (account) {
  return IDB.modifyUserAccount(account)
}
export async function removeUserAccount (accountId) {
  return IDB.removeUserAccount(accountId)
}
export async function getCategories () {
  return IDB.getCategories()
}
export async function addCategory (newCategory) {
  // Remove unnecessary fields - catParent is part of the formData, but catAncestry is formed from its data
  const formattedCategory = {
    catName: newCategory.catName,
    catAncestry: newCategory.catAncestry,
  }
  return IDB.addCategory(formattedCategory)
}
export async function modifyCategory (category) {
  return IDB.modifyCategory(category)
}
// accountId is optional - if null, return all transactions
export async function getTransactions(accountId) {
  return IDB.getTransactions(accountId)
}
export async function getTransactionCountForAccount (accountId) {
  return IDB.getTransactionCountForAccount(accountId)
}
export async function addTransaction (newTransaction) {
  return IDB.addTransaction(newTransaction)
}
export async function getStringMatchers () {
  return IDB.getStringMatchers()
}
export async function addStringMatcher (matcher) {
  return IDB.addStringMatcher(matcher)
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
