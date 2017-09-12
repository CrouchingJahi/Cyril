const actions = {
  init: 'INITIALIZE',
  route: 'ROUTE'
}

export default actions

export const init = {
  type: actions.init
}

export const route = (to) => {
  return {
    type: actions.route,
    to
  }
}
