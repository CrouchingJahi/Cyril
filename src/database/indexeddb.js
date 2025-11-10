// Interface with the IndexedDB API

// Constants
const dbVersion = 1
const DBAccessModes = {
  ReadWrite: 'readwrite',
  ReadOnly: 'readonly',
}
const DBTables = {
  Accounts: 'accounts',
  Categories: 'categories',
  StringMatchers: 'stringMatchers',
  Transactions: 'transactions',
}

// Stored Instance
let dbInstance

// Returns a connection to IndexedDB
export async function getIDB() {
  return new Promise((resolve, reject) => {
    // There is no direct way to test the connection status if dbInstance already exists so we gotta do this try-catch
    if (dbInstance) {
      // Test a dummy transaction to see if the DB connection is still open
      try {
        dbInstance.transaction('')
      } catch (err) {
        if (err.name === 'InvalidStateError') {
          reject(dbInstance)
        }
      }
      resolve(dbInstance)
    }
    else {
      const dbOpenRequest = indexedDB.open('vault', dbVersion)
      dbOpenRequest.onerror = (event) => {
        console.error('Error while loading database:', event)
        reject(event)
      }
      dbOpenRequest.onsuccess = () => {
        dbInstance = dbOpenRequest.result
        resolve(dbInstance)
      }
      dbOpenRequest.onupgradeneeded = async (event) => {
        dbInstance = event.target.result
        await migrateDB()
        resolve(dbInstance)
      }
    }
  })
}

// Initializes the database if it doesn't exist, or updates it when there's a version mismatch
async function migrateDB () {
  dbInstance.onerror = (event) => {
    console.error('Error while migrating database:', event)
  }

  // Not all fields need to be indexed
  const accountStore = dbInstance.createObjectStore('accounts', { keyPath: 'id' })
  accountStore.createIndex('name', 'name', { unique: false })
  accountStore.createIndex('org', 'org', { unique: false })

  const categoryStore = dbInstance.createObjectStore('categories', { keyPath: 'id', autoIncrement: true })
  categoryStore.createIndex('catName', 'catName', { unique: false })
  categoryStore.createIndex('catAncestry', 'catAncestry', { unique: false })

  const stringMatcherStore = dbInstance.createObjectStore('stringMatchers', { keyPath: 'id', autoIncrement: true })
  stringMatcherStore.createIndex('pattern', 'pattern', { unique: false })
  stringMatcherStore.createIndex('categoryId', 'categoryId', { unique: false })

  const transactionStore = dbInstance.createObjectStore('transactions', { keyPath: 'id' })
  transactionStore.createIndex('accountId', 'accountId', { unique: false })
  transactionStore.createIndex('categoryId', 'categoryId', { unique: false })
  transactionStore.createIndex('txnDate', 'txnDate', { unique: false })
  transactionStore.createIndex('txnName', 'txnName', { unique: false })
  transactionStore.createIndex('txnType', 'txnType', { unique: false })

  console.log('Database migration complete.')
}

// IndexedDB specific helper functions
// Return a transaction object on a specific store
async function getDBTransaction (storeName, accessMode = DBAccessModes.ReadOnly) {
  const db = await getIDB()
  return db.transaction(storeName, accessMode)
}
async function getStore (storeName, accessMode) {
  const transaction = await getDBTransaction(storeName, accessMode)
  return transaction.objectStore(storeName)
}
// Handles the boilerplate of creating a promise for the db operation results
async function wrapDBRequest (dbOperation, storeName, accessMode) {
  return new Promise(async (resolve) => {
    let store = await getStore(storeName, accessMode)
    let dbRequest
    if (dbOperation.constructor.name == 'AsyncFunction') {
      dbRequest = await dbOperation(store)
    } else {
      dbRequest = dbOperation(store)
    }
    dbRequest.onsuccess = () => {
      resolve(dbRequest.result)
    }
  })
}
// Wrapper for getting a store's size
async function getStoreCount (store) {
  return new Promise(async (resolve) => {
    const countReq = store.count()
    countReq.onsuccess = (event) => {
      resolve(event.target.result)
    }
  })
}

// Wrappers for common request types
// Find one object by id
async function wrapGetOneRequest (storeName, objId) {
  return wrapDBRequest((store) => {
    return store.get(objId)
  }, storeName)
}
// Get all of the given store that matches the query
// query should be an object of type { index: value } such as { accountId: 'foo' }
// Only supports one query index at a time. A compound index can be created if needed
async function wrapGetQueryRequest (storeName, query) {
  return wrapDBRequest((store) => {
    let queryKey = Object.keys(query)[0]
    return store.index(queryKey).getAll(query[queryKey])
  }, storeName)
}
// Get all of the given store
async function wrapGetAllRequest (storeName) {
  return wrapDBRequest((store) => {
    return store.getAll()
  }, storeName)
}
async function wrapAddOneRequest (storeName, newObj) {
  return wrapDBRequest(async (store) => {
    if (store.autoIncrement) {
      const currentCount = await getStoreCount(store)
      return store.add(Object.assign({id: '' + currentCount}, newObj))
    } else {
      return store.add(newObj)
    }
  }, storeName, DBAccessModes.ReadWrite)
}
async function wrapModifyOneRequest (storeName, obj) {
  return wrapDBRequest((store) => {
    return store.put(obj)
  }, storeName, DBAccessModes.ReadWrite)
}
async function wrapRemoveOneRequest (storeName, objId) {
  return wrapDBRequest((store) => {
    return store.delete(objId)
  }, storeName, DBAccessModes.ReadWrite)
}


// API methods
export async function loadFromBackup (backupData, whichCollections = 'accounts,categories,stringMatchers,transactions') {
  function loadCollection (name) {
    return new Promise(async (resolve, reject) => {
      if (backupData[name].length > 0) {
        let dbTransaction = await getDBTransaction(name, DBAccessModes.ReadWrite)
        dbTransaction.oncomplete = (event) => {
          resolve(event)
        }
        dbTransaction.onerror = (event) => {
          reject(event)
        }
        let thisStore = dbTransaction.objectStore(name)
        for (let item of backupData[name]) {
          thisStore.add(item)
        }
      }
    })
  }

  const collectionList = whichCollections.split(',')
  return Promise.all(collectionList.map(coll => {
    return loadCollection(coll)
  }))
}

export async function getUserAccounts () {
  return wrapGetAllRequest(DBTables.Accounts)
}
export async function addUserAccount (newAccount) {
  return wrapAddOneRequest(DBTables.Accounts, newAccount)
}
export async function modifyUserAccount (account) {
  return wrapModifyOneRequest(DBTables.Accounts, account)
}
export async function removeUserAccount (accountId) {
  return wrapRemoveOneRequest(DBTables.Accounts, accountId)
}

export async function getCategories () {
  return wrapGetAllRequest(DBTables.Categories)
}
export async function addCategory (newCategory) {
  return wrapAddOneRequest(DBTables.Categories, newCategory)
}
export async function modifyCategory (category) {
  return wrapModifyOneRequest(DBTables.Categories, category)
}
export async function removeCategory (categoryId) {
  return wrapRemoveOneRequest(DBTables.Categories, categoryId)
}

export async function getTransactions (accountId) {
  if (accountId) {
    return wrapGetQueryRequest(DBTables.Transactions, { accountId })
  } else {
    return wrapGetAllRequest(DBTables.Transactions)
  }
}
export async function getTransactionCountForAccount (accountId) {
  return wrapDBRequest((store => {
    return store.index('accountId').count(accountId)
  }), DBTables.Transactions)
}
export async function addTransaction (newTransaction) {
  return wrapAddOneRequest(DBTables.Transactions, newTransaction)
}

export async function getStringMatchers () {
  return wrapGetAllRequest(DBTables.StringMatchers)
}
export async function addStringMatcher (newMatcher) {
  return wrapAddOneRequest(DBTables.StringMatchers, newMatcher)
}
