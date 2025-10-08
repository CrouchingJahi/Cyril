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
    },
    stringMatchers: {
      schema: {
        version: 0,
        title: 'regex string matchers schema',
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: { type: 'string', maxLength: 10 },
          pattern: { type: 'string' },
          categoryId: { type: 'string' },
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
  let result = await db.accounts.insert({
    id: newAccount.accountFid,
    name: newAccount.accountName,
    org: newAccount.accountOrg,
  })
  return result.toJSON()
}
export async function removeUserAccount (db, accountId) {
  let trxResult = await db.transactions.find({
    selector: {
      accountId: { $eq: accountId }
    }
  }).remove()
  let acctResult = await db.accounts.findOne(accountId).remove()
  return [trxResult, acctResult]
}

export async function getCategories (db) {
  let results = await db.categories.find().exec()
  return results.map(rxDocument => rxDocument.toJSON())
}
export async function addCategory (db, newCategory) {
  let categoryId = await db.categories.count().exec()
  let result = await db.categories.insert({
    id: '' + categoryId,
    catName: newCategory.catName,
    catAncestry: newCategory.catAncestry,
  })
  return result.toJSON()
}
export async function modifyCategory(db, category) {
  let foundCategory = await db.categories.findOne(category.id).exec()
  let result = await foundCategory.patch(category)
  return result.toJSON()
}

export async function getTransactions (db, accountId) {
  let query;
  if (accountId) {
    query = {
      selector: {
        accountId: { $eq: accountId }
      }
    }
  }
  let results = await db.transactions.find(query).exec()
  return results.map(rxDocument => rxDocument.toJSON())
}
export async function getTransactionCountForAccount (db, accountId) {
  let results = db.transactions.count({
    selector: {
      accountId: { $eq: accountId }
    }
  }).exec()
  return results
}
export async function addTransaction (db, newTransaction) {
  return db.transactions.insert(newTransaction)
}

export async function addBulkTransactions (db, newTransactions) {
  return db.transactions.bulkInsert(newTransactions)
}

export async function getStringMatchers (db) {
  let results = await db.stringMatchers.find().exec()
  return results.map(rxDocument => rxDocument.toJSON())
}

export async function addStringMatcher (db, matcher) {
  let id = await db.stringMatchers.count().exec()
  let result = await db.stringMatchers.insert({ id, ...matcher })
  return result.toJSON()
}

export async function loadFromBackup (db, backupData, whichCollections) {
  function loadCollection (name) {
    if (backupData[name].length > 0) {
      db[name].bulkInsert(backupData[name])
    }
  }
  if (!whichCollections || whichCollections == 'all') {
    loadCollection('accounts')
    loadCollection('categories')
    loadCollection('stringMatchers')
    loadCollection('transactions')
  } else {
    whichCollections.split(',').forEach(coll => loadCollection(coll))
  }
}
