import { ipcRenderer } from 'electron'

const actions = {
  init: 'INITIALIZE',
  route: 'ROUTE',
}

export default actions

export const init = (data) => {
  return (dispatch) => {
    let action = {
      type: actions.init
    }
    if (!data) {
      ipcRenderer.send('request-categories')
      ipcRenderer.once('get-categories', (event, categories) => {
        dispatch(init(categories))
      })
    }
    else {
      action.categories = data
    }
    return action
  }
}

export const route = (to) => {
  return {
    type: actions.route,
    to
  }
}
