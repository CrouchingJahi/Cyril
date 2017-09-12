import { createStore } from 'redux'

import app, { initialState } from './reducers'

export default createStore(app, initialState)
