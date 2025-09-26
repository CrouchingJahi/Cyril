import { createRxDatabase } from 'rxdb'
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage'

export async function getRxDB () {
  const db = await createRxDatabase({
    name: 'vault',
    storage: getRxStorageLocalstorage(),
  })

  if (!db.collections.accounts) {
    await initializeDB(db)
  }

  console.debug('RxDB initialized')

  return db
}

async function initializeDB (db) {
  await db.addCollections({
    accounts: {
      schema: {
        version: 0,
        title: 'bank account schema',
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: { type: 'string', maxLength: 4 },
          fid: { type: 'string' },
          name: { type: 'string' },
        }
      }
    },
    categories: {
      schema: {
        version: 0,
        title: 'spending category schema',
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: { type: 'string', maxLength: 4 },
          catName: { type: 'string' },
          catAncestry: { type: 'string' },
        }
      }
    },
    transactions: {
      schema: {
        version: 0,
        title: 'transaction schema',
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: { type: 'string', maxLength: 32 },
          accountId: { type: 'string' },
          trnDate: { type: 'datetime' },
          trnAmount: { type: 'number' },
          name: { type: 'string' },
          memo: { type: 'string' },
          trnType: { type: 'string' },
          trnCategoryId: { type: 'string' },
        }
      }
    }
  })
}

export async function getUserAccounts (db) {
  let results = await db.accounts.find().exec()
  return results.map(rxDocument => rxDocument.toJSON())
}
export async function addUserAccount (db, newAccount) {
  let accountId = await db.accounts.count().exec()
  db.accounts.insert({
    id: '' + accountId,
    name: newAccount.accountName,
    fid: newAccount.accountFid,
  }).then((res) => {
    console.log(res)
    return 'Successfully added account: ' + newAccount.name
  })
}
export async function removeUserAccount (db, accountId) {
  // Check for any transactions under this account
  console.log('removing account', accountId)
}

export async function getTransactionCategories (db) {
  let results = await db.categories.find().exec()
  return results.map(rxDocument => rxDocument.toJSON())
}
export async function addCategory (db, newCategory) {
  let categoryId = await db.categories.count().exec()
  db.categories.insert({
    id: '' + categoryId,
    catName: newCategory.categoryName,
    catAncestry: newCategory.categoryAncestry,
  }).then((res) => {
    console.log(res)
    return 'Successfully added category: ' + newCategory.catName
  })
}

export async function addTransaction (db, newTransaction) {
  db.transactions.insert({
    id: newTransaction.fitid,
    accountId: newTransaction.accountId,
    categoryId: newTransaction.categoryId,
    trnDate: newTransaction.trnDate,
    trnAmount: newTransaction.trnAmount,
    trnName: newTransaction.trnName,
    trnMemo: newTransaction.trnMemo,
    trnType: newTransaction.trnType,
  })
}

export async function seedMockData (db) {
  db.categories.bulkInsert([
    {
      id: '0',
      catName: 'root 1',
      catAncestry: '',
    },
    {
      id: '1',
      catName: 'broad cat 1',
      catAncestry: '0',
    },
    {
      id: '2',
      catName: 'root 2',
      catAncestry: ''
    },
    {
      id: '3',
      catName: 'root 3',
      catAncestry: ''
    },
    {
      id: '4',
      catName: 'leaf 1',
      catAncestry: '1,0'
    },
    {
      id: '5',
      catName: 'leaf 2',
      catAncestry: '1,0'
    },
    {
      id: '6',
      catName: 'other leaf',
      catAncestry: '3'
    },
  ])
}