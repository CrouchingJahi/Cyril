import { StrictMode } from 'react'
import Router from '@/router/Router'
import VaultProvider from '@/context/VaultContext'

import './cyril.scss'

export default function App () {
  return <StrictMode>
    <VaultProvider>
      <Router />
    </VaultProvider>
  </StrictMode>
}
