import React from 'react'
import { BackToMenuLink } from '@/router/Link'

export default class SettingsScreen extends React.Component {
  render() {
    return (
      <div id="settings">
        <header>
          <BackToMenuLink />
        </header>
        <h2>Settings</h2>
      </div>
    )
  }
}
