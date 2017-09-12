import actions from './actions'

export const initialState = {
  route: 'splash',
  spendingCategories: {}
}

export default function reducer(state, action) {
  switch (action.type) {
    case actions.init: {
      return state
    }
    case actions.route: {
      return Object.assign({}, state, {route: action.to})
    }
    default: return initialState
  }
}
