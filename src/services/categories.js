import dbc from './utilities/dbc'

export default (event) => {
  event.sender.send('get-categories', dbc.getCategorizations())
}
