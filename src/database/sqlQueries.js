/*
Currently unused, but keeping in case this switches to an sqlite type
*/
export async function dbHasRecords () {
  return await db.exec('SELECT * FROM users');
}

export async function initializeDB (db) {
  console.log('DB init started');

  console.log(MAIN_WINDOW_VITE_DEV_SERVER_URL);

  
  console.log('DB collections init');
  console.log(db);
  // Create a transactions collection for each account
  const usersCreateTableQuery = 'CREATE TABLE users (' +
    'userID text PRIMARY KEY' +
    ')';
  const accountsCreateTableQuery = 'CREATE TABLE accounts (' +
    'userID text REFERENCES users (userID), ' +
    'accountID text PRIMARY KEY, ' +
    'fid text'
    ')';
  const categoriesCreateTableQuery = 'CREATE TABLE categories (' +
    'catID text NOT NULL PRIMARY KEY, ' +
    'catName text, ' +
    'catParent text REFERENCES categories(catID), ' +
    ')';
  const transactionsCreateTableQuery = 'CREATE TABLE transactions (' +
    'fitid PRIMARY KEY, ' +
    'trnDate DATE, ' +
    'trnAmount DEC(12, 2), ' +
    'name text, ' +
    'memo text, ' +
    'trnType text, ' +
    ')';

  await db.exec(usersCreateTableQuery);
  await db.exec(accountsCreateTableQuery);
  await db.exec(categoriesCreateTableQuery);
  await db.exec(transactionsCreateTableQuery);

  // Ensure default user data exists
  const users = await db.exec('SELECT * FROM users');
  console.log('Users db query');
  console.log(users);
}
