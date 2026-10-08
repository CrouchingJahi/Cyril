import * as IDB from './indexeddb'

const dbInstance = await initDB()

export default dbInstance

async function initDB () {
  const dbInstance = await IDB.getIDB()

  window.dispatchEvent(new CustomEvent('VaultLoaded'))

  // Expose API
  return {
    // DB
    dbInstance,
    // CRUD
    getUserAccounts, addUserAccount,
    modifyUserAccount, removeUserAccount,
    getCategories, addCategory,
    modifyCategory,
    getStringMatchers, addStringMatcher,
    getTransactions, addTransaction,
    // Stats
    getTransactionCountForAccount,
    // Utility
    createBackup, loadFromBackup,
  }
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
async function createBackup () {
  return createBackupObject().then(backupObj => {
    return window.cyrilAPI.createBackupFile(backupObj).then(filePath => {
      return { filePath, backupObj }
    })
  })
}
function loadFromBackup (whichCollections) {
  window.cyrilAPI.readBackupFile().then(backupData => {
    IDB.loadFromBackup(backupData, whichCollections)
  })
}

// Passthrough methods for DB API
async function getUserAccounts () {
  return IDB.getUserAccounts()
}
async function addUserAccount (newAccount) {
  return IDB.addUserAccount(newAccount)
}
async function modifyUserAccount (account) {
  return IDB.modifyUserAccount(account)
}
async function removeUserAccount (accountId) {
  return IDB.removeUserAccount(accountId)
}
async function getCategories () {
  return IDB.getCategories()
}
async function addCategory (newCategory) {
  // Remove unnecessary fields - catParent is part of the formData, but catAncestry is formed from its data
  const formattedCategory = {
    catName: newCategory.catName,
    catAncestry: newCategory.catAncestry,
  }
  return IDB.addCategory(formattedCategory)
}
async function modifyCategory (category) {
  return IDB.modifyCategory(category)
}
// accountId is optional - if null, return all transactions
async function getTransactions(accountId) {
  return IDB.getTransactions(accountId)
}
async function getTransactionCountForAccount (accountId) {
  return IDB.getTransactionCountForAccount(accountId)
}
async function addTransaction (newTransaction) {
  return IDB.addTransaction(newTransaction)
}
async function getStringMatchers () {
  return IDB.getStringMatchers()
}
async function addStringMatcher (matcher) {
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
