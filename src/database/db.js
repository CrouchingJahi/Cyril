import * as RxDB from './rxdb'

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
      getTransactionCategories, addCategory,
      seedMockData,
    })
    window.dispatchEvent(new CustomEvent('VaultLoaded'))
  }
  return db
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
export async function getTransactionCategories () {
  await waitForInit()
  return RxDB.getTransactionCategories(db)
}
export async function addCategory (newCategory) {
  await waitForInit()
  return RxDB.addCategory(db, newCategory)
}
export async function seedMockData () {
  await waitForInit()
  return RxDB.seedMockData(db)
}

/* Schemas
accounts {
  id: string,
  fid: string,
  name: string,
}
categories {
  id: string,
  catName: string,
  catAncestry: string, // comma separated list of category's parent ids, in ascending order, until root
}
transactions {
  id: string,
  accountId: string, // id of account this transaction is listed under
  trnDate: Date,
  trnAmount: number,
  name: string,
  memo: string,
  trnType: string,
  trnCategoryId: string, // references category id
}
*/
