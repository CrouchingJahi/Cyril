import actions from '~/store/actions'

export default (state = 'splash', action) => {
  if (action.type == actions.route) {
    return action.to    
  }
  return state
}
