import { createContext, useEffect, useState } from 'react'
import { getCategories, getUserAccounts, getTransactions, getStringMatchers } from '~/database/db'

export const VaultContext = createContext()

/**
 * Handles data pulling from the vault.
 * Also exposes methods to pull again whenever the DB is updated.
 */
export default function VaultProvider ({ children }) {
  const [categories, setCategories] = useState()
  const [accounts, setAccounts] = useState()
  const [transactions, setTransactions] = useState()
  const [stringMatchers, setStringMatchers] = useState()
  const [isLoaded, setIsLoaded] = useState(false)

  const context = {
    categories, updateCategories,
    accounts, updateAccounts,
    transactions, updateTransactions,
    stringMatchers, updateStringMatchers,
    isLoaded,
  }

  useEffect(() => {
    Promise.all([
      updateCategories(),
      updateAccounts(),
      updateTransactions(),
      updateStringMatchers(),
    ]).then(_ => {
      setIsLoaded(true)
    })
  }, [])

  function updateCategories () {
    return getCategories().then(setCategories)
  }

  function updateAccounts () {
    return getUserAccounts().then(setAccounts)
  }

  function updateTransactions () {
    return getTransactions().then(setTransactions)
  }

  function updateStringMatchers () {
    return getStringMatchers().then(setStringMatchers)
  }

  return <VaultContext value={context}>
    { children }
  </VaultContext>
}
