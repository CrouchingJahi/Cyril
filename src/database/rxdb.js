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
          id: { type: 'string', maxLength: 32 },
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
