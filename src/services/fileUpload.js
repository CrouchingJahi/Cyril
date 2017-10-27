import dbc from './utilities/dbc'
import parse from './utilities/parseOfx'

export default (event, data) => {
  parse(data).then((parsed) => {

    let results = {
      accountExisted: !!dbc.accounts.findOne({id: parsed.account}),
      transactionsFound: parsed.transactions.length,
      duplicatesFound: 0,
      newTransactions: [],
      account: parsed.account
    }
    let account = dbc.getAccount(parsed.account)

    parsed.transactions.forEach(transaction => {
      if (account.transactions.find(t => t.id == transaction.id)) {
        results.duplicatesFound++
      }
      else {
        // TODO process and categorize the type of transaction and attach relevant data
        transaction.category = {}
        account.transactions.push(transaction)
        results.newTransactions.push(transaction)
      }
    })

    event.sender.send('upload-complete', results)
  })
}
