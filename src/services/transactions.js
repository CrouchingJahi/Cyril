import dbc from './utilities/dbc'

export default (event, data) => {
  // update transaction in data.account, data.transaction
  let account = dbc.getAccount(data.account)
  let ind = account.transactions.indexWhere((t) => t.id == data.transaction.id)
  let oldCategorization = Object.assign({}, account.transactions[ind].categorization)
  account.transactions[ind].categorization = data.transaction.categorization
  dbc.accounts.update(account)
  // update categories
  // If there is no longer a transaction that shares this 
  // let categories = dbc.getCategories()
  // event.sender.send('get-categories', dbc.categories.find())
}
