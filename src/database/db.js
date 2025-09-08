// import { getUserSettings } from '~/utils/userSettings'
import { getRxDB } from './rxdb'

// const userSettings = await getUserSettings()

let db;

export async function getDB () {
  if (!db)  {
    db = await getRxDB()
  }
  return db
}

export async function getUserAccounts () {
  return db.accounts.find().exec()
}

export async function getTransactionCategories () {
  return db.transactions.find().exec()
}

/* Schemas
accounts {
  id: string,
  fid: string,
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
