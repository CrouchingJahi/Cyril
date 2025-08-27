import { BackToMenuLink } from '@/router/Link'

/*
Settings:
Spending Account (options to add/modify/remove, attach to APIs)
Transaction Categories (options to add/modify)
*/
export default function SettingsScreen () {
  return <div id="settings">
    <header>
      <BackToMenuLink />
      <h2>Settings</h2>
    </header>
  </div>
}
