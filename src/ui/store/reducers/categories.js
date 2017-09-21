import actions from '~/store/actions'

export default (state = {}, action) => {
  if (action.type == actions.getCategories) {
    if (action.categories) {
      return Object.assign({}, action.categories)
    }
  }
  return state
}
