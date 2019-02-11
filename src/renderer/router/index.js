import { createContext } from 'react'
import SplashScreen from '@/screens/Splash'
import MenuScreen from '@/screens/Menu'
import SettingsScreen from '@/screens/Settings'

export const defaultRoute = 'settings' // splash

export const routes = {
  splash: SplashScreen,
  menu: MenuScreen,
  settings: SettingsScreen,
}
export const RouteContext = createContext()
