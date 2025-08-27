import path from 'path';
import { Database, open } from 'sqlite';

import { userSettings } from '../utils/userSettings';
import * as queries from './sqlQueries';

/*
const userStore = new Store(userStoreSettings);
export const userSettings = userStore.get('settings');
export function updateUserSettings (newSettings) {
  console.log('Updating user settings');
  userStore.set('settings', newSettings);
}
*/

export default async function getDB () {
  console.log('getDB call')
  // Get the settings object
  const db = await open({
    filename: path.join(userSettings.dbLocation, 'vault.db'),
    driver: Database
  });
  // If db is empty
  const dbHasRecords = queries.dbHasRecords()
  console.log('db has records?', dbHasRecords);
  if (!dbHasRecords) {
    queries.initDatabase(db);
  }
  return db;
}
