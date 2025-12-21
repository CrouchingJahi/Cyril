import { useEffect, useState } from 'react'

import { getPendingTransactions, savePendingTransactions, deletePendingTransactions } from '~/database/localStorage'

import { Header } from '@/ui/Layout'
import LoadingIcon from '@/ui/LoadingIcon'
import TransactionFiler from './TransactionFiler'

/**
 * Categorize transactions that are staged from the last file upload
 * 
 * @todo flesh out auto categorizer
 * @todo proper screen for when all pending are removed
 */
export default function CategorizeScreen () {
  const [stagedTransactions, setStagedTransactions] = useState(null)

  useEffect(() => {
    const localTransactions = getPendingTransactions()
    if (localTransactions) {
      setStagedTransactions(localTransactions)
    }
  }, [])

  function removeStagedTransaction (index) {
    if (stagedTransactions.transactions.length === 1) {
      setStagedTransactions(null)
      deletePendingTransactions()
    } else {
      let stateCopy = { ...stagedTransactions }
      let queueCopy = [...stateCopy.transactions]
      queueCopy.splice(index, 1)
      stateCopy.transactions = queueCopy

      setStagedTransactions(stateCopy)
      savePendingTransactions(stateCopy)
    }
  }

  return <div id="categorize">
    <Header>Categorize</Header>
    <main>
      { stagedTransactions ?
          stagedTransactions?.transactions.length > 0 ?
            <TransactionFiler
              transactionDataToCategorize={stagedTransactions}
              removeTransactionFn={removeStagedTransaction}
            /> :
            <div>
              <p>There are no transactions pending to categorize.</p>
            </div>
          : <div className="centered width-l"><LoadingIcon /></div>
      }
    </main>
  </div>
}
