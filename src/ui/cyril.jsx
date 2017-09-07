import React from 'react'
import { render } from 'react-dom'

import Router from '~/router/router'
import SplashScreen from '~/screens/splash'
import MenuScreen from '~/screens/menu'
import UploadScreen from '~/screens/upload'

const routes = {
  'splash': SplashScreen,
  'menu': MenuScreen,
  'upload': UploadScreen,
}

document.addEventListener("DOMContentLoaded", () => {
  render(
    <Router states={routes} default="splash" />
  , document.getElementById('cyril'))
})
