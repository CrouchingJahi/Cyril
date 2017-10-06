import { combineReducers } from 'redux'

import route from './route'
import categories from './categories'
import accounts from './accounts'
import session from './session'

export default combineReducers({
  route,
  categories,
  accounts,
  session,
})
