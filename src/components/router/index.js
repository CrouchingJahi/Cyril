import { createContext } from 'react'
import SplashScreen from '@/screens/Splash'
import MenuScreen from '@/screens/Menu'
import CategorizeScreen from '@/screens/categorize/Categorize'
import SettingsScreen from '@/screens/settings/Settings'
import SpendingScreen from '@/screens/Spending'
import UploadScreen from '@/screens/Upload'

export const routes = {
  splash: SplashScreen,
  menu: MenuScreen,
  settings: SettingsScreen,
  spending: SpendingScreen,
  upload: UploadScreen,
  categorize: CategorizeScreen,
}

export const defaultRoute = 'splash'

export const RouteContext = createContext({ currentRoute: defaultRoute })
