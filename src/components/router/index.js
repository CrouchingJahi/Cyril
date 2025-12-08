import { createContext } from 'react'

export const Routes = {
  Splash: 'splash',
  Menu: 'menu',
  Settings: 'settings',
  Spending: 'spending',
  Upload: 'upload',
  Categorize: 'categorize',
}

export const defaultRoute = Routes.Splash

export const RouteContext = createContext({ currentRoute: defaultRoute })
