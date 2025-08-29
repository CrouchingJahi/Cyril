import { createRxDatabase } from 'rxdb'
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage'

export async function getRxDB () {
  const db = await createRxDatabase({
    name: 'vault',
    storage: getRxStorageLocalstorage(),
  })

  if (!db.accounts) {
    await initializeDB()
  }

  console.log('db initialized', db)

  return db
}

async function initializeDB () {
  console.log('initializing db')
  await db.addCollections({
    accounts: {
      schema: {
        version: 0,
        title: 'bank account schema',
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: { type: 'string' },
          fid: { type: 'string' },
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
          id: { type: 'string' },
          catName: { type: 'string' },
          catParent: { type: 'string' },
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
          id: { type: 'string' },
          trnDate: { type: 'datetime' },
          trnAmount: { type: 'number' },
          name: { type: 'string' },
          memo: { type: 'string' },
          trnType: { type: 'string' },
          trnCategory: { type: 'string' },
        }
      }
    }
  })
}
