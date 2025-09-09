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
    Object.assign(db, {
      getUserAccounts, addUserAccount, removeUserAccount,
      getTransactionCategories, addCategory
    })
  }
  return db
}

export async function getUserAccounts () {
  await waitForInit()
  let results = await db.accounts.find().exec()
  return results.map(rxDocument => rxDocument.toJSON())
}
export async function addUserAccount (newAccount) {
  await waitForInit()
  let accountId = await db.accounts.count().exec()
  db.accounts.insert({
    id: accountId,
    name: newAccount.accountName,
    fid: newAccount.accountFid,
  }).then((res) => {
    console.log(res)
    return 'Successfully added account: ' + newAccount.name
  })
}
export async function removeUserAccount (accountId) {
  // Check for any transactions under this account
  console.log('removing account', accountId)
}

export async function getTransactionCategories () {
  await waitForInit()
  let results = await db.transactions.find().exec()
  return results.map(rxDocument => rxDocument.toJSON())
}
export async function addCategory (newCategory) {
  await waitForInit()
  let categoryId = await db.categories.count().exec()
  db.categories.insert({
    id: categoryId,
    catName: newCategory.categoryName,
    catParent: newCategory.categoryParent,
  }).then((res) => {
    console.log(res)
    return 'Successfully added category: ' + newCategory.catName
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
