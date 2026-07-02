import { StrictMode } from 'react'
import Router from '@/router/Router'
import VaultProvider from '@/context/VaultContext'
import MessageProvider from '@/context/MessageContext'

import './cyril.scss'

export default function App () {
  return <StrictMode>
    <VaultProvider>
      <MessageProvider>
        <Router />
      </MessageProvider>
    </VaultProvider>
  </StrictMode>
}
