// import { getUserSettings } from '~/utils/userSettings'
import { getRxDB } from './rxdb'

// const userSettings = await getUserSettings()

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
    db = await getRxDB()
  }
  return db
}

export async function getUserAccounts () {
  await waitForInit()
  return db.accounts.find().exec()
}
export async function addUserAccount (newAccount) {
  await waitForInit()
  db.accounts.insert({
    id: db.accounts.count(),
    name: newAccount.name,
    fid: newAccount.fid,
  })
}

export async function getTransactionCategories () {
  await waitForInit()
  return db.transactions.find().exec()
}
export async function addCategory (newCategory) {
  await waitForInit()
  db.categories.insert({
    id: db.categories.count(),
    catName: newCategory.catName,
    catParent: newCategory.catParent,
  })
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
  catParent: string (references parent's id)
}
transactions {
  id: string,
  trnDate: Date,
  trnAmount: number,
  name: string,
  memo: string,
  trnType: string,
  trnCategory: string (references category id)
}
*/
