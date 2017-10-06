import actions from '~/store/actions'

let initialState = {
  account: ''
}

export default function (state = initialState, action) {
  if (action.type == actions.selectAccount) {
    return Object.assign({}, state, { account: action.account })
  }
  return state
}
