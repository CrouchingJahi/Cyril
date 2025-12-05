import { useEffect, useState } from 'react'

import { Header } from '@/ui/Layout'
import LoadingIcon from '@/ui/LoadingIcon'

/**
 * Categorize transactions that are staged from the last file upload
 * 
 * @todo flesh out auto categorizer
 */
export default function CategorizeScreen () {
  const [stagedTransactions, setStagedTransactions] = useState(null)

  useEffect(() => {
    const localTransactions = localStorage.getItem('stagedTransactions')
    if (localTransactions) {
      setStagedTransactions(localTransactions)
    }
  }, [])

  return <div id="categorize">
    <Header>Categorize</Header>
    <main>
      { stagedTransactions ?
        stagedTransactions.transactions.length > 0 ?
        <div>
          { stagedTransactions.map(trx => <div/>) }
        </div> :
        <div>
          <p>There are no transactions pending to categorize.</p>
        </div>
        : <LoadingIcon />
      }
    </main>
  </div>
}
