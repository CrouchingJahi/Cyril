import React from 'react';
import { render } from 'react-dom';

import Router from '~/router/router';
import SplashScreen from '~/screens/splash';
import MenuScreen from '~/screens/menu';

const routes = {
  'splash': SplashScreen,
  'menu': MenuScreen,
};

document.addEventListener("DOMContentLoaded", () => {
  render(
    <Router states={routes} default="menu" />
  , document.getElementById('cyril'));
});
