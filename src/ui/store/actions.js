import { ipcRenderer } from 'electron'

const actions = {
  init: 'INITIALIZE',
  route: 'ROUTE',
  getCategories: 'GET_CATEGORIES',
  updateCategories: 'UPDATE_CATEGORIES',
}

export default actions

export const getCategories = (data) => {
  return (dispatch) => {
    let action = {
      type: actions.getCategories
    }
    if (!data) {
      ipcRenderer.send('request-categories')
      ipcRenderer.once('get-categories', (event, categories) => {
        dispatch(getCategories(categories))
      })
    }
    else {
      action.categories = data.categories
    }
    return action
  }
}

export const updateCategories = (data) => {
  return (dispatch) => {
    ipcRenderer.send('update-categories', data)
    ipcRenderer.once('get-categories', (event, categories) => {
      dispatch(getCategories(categories))
    })
    return {
      type: actions.updateCategories
    }
  }
}

export const init = () => {
  return (dispatch) => {
    dispatch(getCategories())
    return {
      type: actions.init
    }
  }
}

export const route = (to) => {
  return {
    type: actions.route,
    to
  }
}
