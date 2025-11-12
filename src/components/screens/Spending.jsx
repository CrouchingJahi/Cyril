import { useState, useEffect } from 'react'

import { BackToMenuLink } from '@/router/Link'
import PieChart from '@/charts/PieChart'
import LoadingIcon from '@/ui/LoadingIcon'

import { getTransactions, getCategories } from '~/database/db'
import { createTransactionData } from '~/utils/transactionData'

const views = {
  Menu: 'menu',
  PieChart: 'chart.pie',
}
/**
 * Displays data about the user's spending, with a choice of formats.
 * 
 * @todo state searchFacets, that holds query info. needs component to interface. connect to useEffect
 * @todo choice of account vs. combined
 */
export default function Spending () {
  const [selectedView, setSelectedView] = useState(views.Menu)
  const [transactions, setTransactions] = useState(null)
  const [categories, setCategories] = useState(null)
  const [txnData, setTxnData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCategories(),
      getTransactions(),
    ]).then(([cats, trx]) => {
      setCategories(cats)
      setTransactions(trx)
      setTxnData(createTransactionData(trx, cats))
    })
  }, [])

  useEffect(() => {
    if (txnData) {
      setIsLoading(false)
    }
  }, [txnData])

  return <div id="spending">
    <header>
      <BackToMenuLink />
      <h1>Spending</h1>
    </header>
    <main>
      { isLoading ? <div className="width-m centered">
          <LoadingIcon />
        </div> :
        selectedView == views.Menu ? <SpendingViewMenu /> :
        <div>
          <section className="pad-bottom">
            <h2>Data</h2>
            <p>Time Period: { txnData.timeframe.start } - { txnData.timeframe.end }</p>
            <p>Total Spending: ${ txnData.total }</p>
          </section>
          <section>
            { selectedView == views.PieChart ? <PieChart transactionData={txnData} />
            : <div>Error selecting spending view</div> }
          </section>
        </div>
      }
    </main>
  </div>

  function SpendingViewMenu () {
    return <div>
      <p>Choose which spending view to use:</p>
      <ul className="list">
        <li><button onClick={() => setSelectedView(views.PieChart)}>Pie</button></li>
        {/* <li>Line</li> */}
        {/* <li>Bar</li> */}
      </ul>
    </div>
  }
}
