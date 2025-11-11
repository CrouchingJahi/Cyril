import { useEffect, useState } from 'react'
import * as db from '~/database/db'
import { BackToMenuLink } from '@/router/Link'
import DataOptions from './DataOptions'
import AccountOptions from './AccountOptions'
import CategoryOptions from './CategoryOptions'

/**
 * Settings:
 * Spending Account (options to add/modify/remove, attach to APIs)
 * Transaction Categories (options to add/modify)
 * 
 * @todo add loading state to fix jumping on page load
 * @todo finish clear data functions
 * @todo dont clear full form when a category is selected (add category name)
 * @todo fix screen update on modify category
 * @todo ability to transfer transactions to another account
 */
export default function SettingsScreen () {
  const [userAccounts, setUserAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [stringMatchers, setStringMatchers] = useState([])

  useEffect(() => {
    db.getUserAccounts().then(setUserAccounts)
    db.getCategories().then(setCategories)
    db.getStringMatchers().then(setStringMatchers)
  }, [])

  return <div id="settings">
    <header>
      <BackToMenuLink />
      <h1>Settings</h1>
    </header>
    <main className="grid cols-2">
      <DataOptions />
      <AccountOptions
        accounts={userAccounts} setAccounts={setUserAccounts}
      />
      {/* <TransactionOptions /> */}
      {/* <SpendingOptions /> */}
      <CategoryOptions
        categories={categories} setCategories={setCategories}
        stringMatchers={stringMatchers} setStringMatchers={setStringMatchers}
      />
    </main>
  </div>
}
