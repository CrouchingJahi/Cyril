import actions from '~/store/actions'

export default (state = [], action) => {
  if (action.type == actions.getAccounts) {
    if (action.accounts) {
      return action.accounts.slice()
    }
  }
  return state
}
