import { useState } from 'react'
import { defaultRoute, Routes, RouteContext } from '@/router'
import SplashScreen from '@/screens/Splash'
import MenuScreen from '@/screens/Menu'
import CategorizeScreen from '@/screens/categorize/Categorize'
import SettingsScreen from '@/screens/settings/Settings'
import SpendingScreen from '@/screens/spending/Spending'
import UploadScreen from '@/screens/upload/Upload'

function getRoutedComponent (route) {
  switch (route) {
    case Routes.Splash:
      return SplashScreen
    case Routes.Menu:
      return MenuScreen
    case Routes.Settings:
      return SettingsScreen
    case Routes.Spending:
      return SpendingScreen
    case Routes.Upload:
      return UploadScreen
    case Routes.Categorize:
      return CategorizeScreen
    default:
      throw new Error(`Illegal route: ${route}`)
  }
}

export default function Router () {
  const [currentRoute, setCurrentRoute] = useState(defaultRoute)
  const Route = getRoutedComponent(currentRoute)

  const context = { currentRoute, changeRoute }

  function changeRoute (route) {
    setCurrentRoute(route)
  }

  return <RouteContext value={context}>
    <Route />
  </RouteContext>
}
