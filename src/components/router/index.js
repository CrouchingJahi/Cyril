import { createContext } from 'react'
import SplashScreen from '@/screens/Splash'
import MenuScreen from '@/screens/Menu'
import SettingsScreen from '@/screens/Settings'
import UploadScreen from '@/screens/Upload'

export const routes = {
  splash: SplashScreen,
  menu: MenuScreen,
  settings: SettingsScreen,
  upload: UploadScreen,
}

export const defaultRoute = 'splash'

export const RouteContext = createContext()
