import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import store from '~/store'
import { init } from '~/store/actions'
import Router from '~/router/router'
import SplashScreen from '~/screens/splash'
import MenuScreen from '~/screens/menu'
import SpendingScreen from '~/screens/spending'
import UploadScreen from '~/screens/upload'
import SummaryScreen from '~/screens/summary'

const routes = {
  'splash': SplashScreen,
  'menu': MenuScreen,
  'spending': SpendingScreen,
  'upload': UploadScreen,
  'summary': SummaryScreen,
}

document.addEventListener('DOMContentLoaded', () => {
  store.dispatch(init()).then(() => {
    render(
    <Provider store={store}>
      <Router states={routes} />
    </Provider>
  , document.getElementById('cyril'))
  })
})
