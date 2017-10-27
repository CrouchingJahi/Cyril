import dbc from './utilities/dbc'

export default (event, data) => {
  event.sender.send('get-accounts', dbc.accounts.find())
}
