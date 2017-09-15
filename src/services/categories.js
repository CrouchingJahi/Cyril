import dbc from './dbc'

export default (event) => {
  event.sender.send('get-categories', dbc.getCategories())
}
