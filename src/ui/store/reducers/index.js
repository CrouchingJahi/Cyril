import { combineReducers } from 'redux'

import route from './route'
import categories from './categories'
import accounts from './accounts'

export default combineReducers({
  route,
  categories,
  accounts,
})
