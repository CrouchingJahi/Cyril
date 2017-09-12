import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import store from '~/store'
import { init } from '~/store/actions'
import Router from '~/router/router'
import SplashScreen from '~/screens/splash'
import MenuScreen from '~/screens/menu'
import UploadScreen from '~/screens/upload'

const routes = {
  'splash': SplashScreen,
  'menu': MenuScreen,
  'upload': UploadScreen,
}

store.dispatch(init)

document.addEventListener('DOMContentLoaded', () => {
  render(
    <Provider store={store}>
      <Router states={routes} />
    </Provider>
  , document.getElementById('cyril'))
})
