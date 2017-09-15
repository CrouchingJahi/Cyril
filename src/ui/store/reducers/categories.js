import actions from '~/store/actions'

export default (state = {}, action) => {
  if (action.type == actions.init) {
    if (action.categories) {
      console.log(action.categories)
      return Object.assign({}, action.categories)
    }
    // else initialize is starting
  }
  return state
}
