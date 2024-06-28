import React from 'react'
import { BackToMenuLink } from '@/router/Link'

export default class SettingsScreen extends React.Component {
  render() {
    return (
      <div id="settings">
        <header>
          <BackToMenuLink />
          <h2>Settings</h2>
        </header>
      </div>
    )
  }
}
