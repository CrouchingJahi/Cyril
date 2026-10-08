import { createContext, useCallback, useEffect, useState } from 'react'
import db from '~/database/db'

export const VaultContext = createContext()

/**
 * Handles data pulling from the vault.
 * Also exposes methods to pull again whenever the DB is updated.
 */
export default function VaultProvider ({ children }) {
  const [dbInstance, setDbInstance] = useState()
  const [categories, setCategories] = useState()
  const [accounts, setAccounts] = useState()
  const [transactions, setTransactions] = useState()
  const [stringMatchers, setStringMatchers] = useState()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (isMounted) {
        setDbInstance(db)
      }
    }

    let isMounted = true
    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (dbInstance) {
      updateData()
    }
  }, [dbInstance])

  // Functions to refresh context from db
  const updateData = useCallback(() => {
    Promise.all([
      updateCategories(),
      updateAccounts(),
      updateTransactions(),
      updateStringMatchers(),
    ]).then(_ => {
      setIsLoaded(true)
    })
  }, [dbInstance])

  const updateCategories = useCallback(() => {
    dbInstance?.getCategories().then(setCategories)
  }, [dbInstance])

  const updateAccounts = useCallback(() => {
    dbInstance?.getUserAccounts().then(setAccounts)
  }, [dbInstance])

  const updateTransactions = useCallback(() => {
    dbInstance?.getTransactions().then(setTransactions)
  }, [dbInstance])

  const updateStringMatchers = useCallback(() => {
    dbInstance?.getStringMatchers().then(setStringMatchers)
  }, [dbInstance])

  const addCategory = useCallback((category) => {
    dbInstance?.addCategory(category).then(updateCategories)
  }, [dbInstance])

  const addUserAccount = useCallback((userAccount) => {
    dbInstance?.addUserAccount(userAccount).then(updateAccounts)
  }, [dbInstance])

  const addTransaction = useCallback((transaction) => {
    dbInstance?.addTransaction(transaction).then(updateTransactions)
  }, [dbInstance])

  const addStringMatcher = useCallback((stringMatcher) => {
    dbInstance?.addStringMatcher(stringMatcher).then(updateStringMatchers)
  }, [dbInstance])

  // API
  const context = {
    categories, updateCategories, addCategory,
    accounts, updateAccounts, addUserAccount,
    transactions, updateTransactions, addTransaction,
    stringMatchers, updateStringMatchers, addStringMatcher,
    isLoaded,
  }

  return <VaultContext value={context}>
    { children }
  </VaultContext>
}
