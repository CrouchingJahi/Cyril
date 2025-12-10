import { useContext } from 'react'

import { VaultContext } from '@/context/VaultContext'

import { Header } from '@/ui/Layout'
import LoadingIcon from '@/ui/LoadingIcon'
import DataOptions from './DataOptions'
import AccountOptions from './AccountOptions'
import CategoryOptions from './CategoryOptions'

/**
 * Settings:
 * Spending Account (options to add/modify/remove, attach to APIs)
 * Transaction Categories (options to add/modify)
 * 
 * @todo finish clear data functions
 * @todo dont clear full form when a category is selected (add category name)
 * @todo fix screen update on modify category
 * @todo a way to edit, re-categorize existing transactions
 * @todo settings for pending transactions
 */
export default function SettingsScreen () {
  const {
    categories, updateCategories,
    accounts, updateAccounts,
    stringMatchers, updateStringMatchers,
  } = useContext(VaultContext)

  return <div id="settings">
    <Header>Settings</Header>
    { accounts && categories && stringMatchers ?
      <main className="grid cols-2">
        <DataOptions />
        <AccountOptions
          accounts={accounts} updateAccounts={updateAccounts}
        />
        {/* <TransactionOptions /> */}
        {/* <SpendingOptions /> */}
        <CategoryOptions
          categories={categories} updateCategories={updateCategories}
          stringMatchers={stringMatchers} updateStringMatchers={updateStringMatchers}
        />
      </main> :
      <div className="width-l centered">
        <LoadingIcon />
      </div>
    }
  </div>
}
