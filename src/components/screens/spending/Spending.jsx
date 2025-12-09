import { useState, useEffect } from 'react'

import PieChart from './PieChart'
import { Header } from '@/ui/Layout'
import LoadingIcon from '@/ui/LoadingIcon'

import { getTransactions, getCategories, getUserAccounts } from '~/database/db'
import { createTransactionData } from '~/utils/transactionData'

const views = {
  Menu: 'menu',
  PieChart: 'chart_pie',
  // BarChart: 'chart_bar',
}

// Display info for each of the chart views
const chartInfo = {
  [views.PieChart]: {
    label: 'Pie Chart',
    description: 'A percentage-by-category view of the total spending'
  },
}

/**
 * Displays data about the user's spending, with a choice of formats.
 * 
 * @todo date pickers for ChartFacets
 */
export default function Spending () {
  const [selectedView, setSelectedView] = useState(views.Menu)
  const [transactions, setTransactions] = useState(null)
  const [categories, setCategories] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [txnData, setTxnData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filtering, setFiltering] = useState({})

  useEffect(() => {
    Promise.all([
      getCategories(),
      getTransactions(),
      getUserAccounts(),
    ]).then(([cats, txns, accts]) => {
      setCategories(cats)
      setTransactions(txns)
      setTxnData(createTransactionData(txns, cats))
      setAccounts(accts)
    })
  }, [])

  useEffect(() => {
    if (txnData) {
      setIsLoading(false)
    }
  }, [txnData])

  useEffect(() => {
    if (transactions && categories) {
      const filteredTransactions = applyFiltersToTransactions(filtering, transactions)
      setTxnData(createTransactionData(filteredTransactions, categories))
    }
  }, [filtering])

  return <div id="spending">
    <Header>Spending</Header>
    <main>
      { isLoading ? <div className="width-m centered">
          <LoadingIcon />
        </div> :
        selectedView == views.Menu ? <SpendingViewMenu setSelectedView={setSelectedView} /> :
        <div>
          <div className="pad-bottom">
            <ChartFacets
              setFiltering={setFiltering}
              data={txnData}
              accounts={accounts}
            />
            <ChartLabel data={txnData} filtering={filtering} />
          </div>
          <section>
            { selectedView == views.PieChart ? <PieChart transactionData={txnData} />
            : <div>How'd you get here?</div> }
          </section>
        </div>
      }
    </main>
  </div>
}

function SpendingViewMenu ({ setSelectedView }) {
  return <div>
    <p>Choose which spending view to use:</p>
    <ul className="list">
      { Object.keys(chartInfo).map(key => {
        const chartView = chartInfo[key]
        return <li key={key}>
          <button onClick={() => setSelectedView(key)}>{ chartView.label }</button>
          <span>&nbsp;{ chartView.description }</span>
        </li>
      }) }
    </ul>
  </div>
}

function ChartLabel ({ data, filtering }) {
  const timeframe = filtering.timeframe || data.timeframe
  return <section className="pad-bottom">
    <h2>Data</h2>
    <p>Time Period: { timeframe.start } - { timeframe.end }</p>
    <p>Total Spending: ${ data.total }</p>
  </section>
}

function ChartFacets ({ setFiltering, data, accounts }) {
  function setAccountFilter (e) {
    setFiltering((filtering) => {
      if (e.target.value == 'all') {
        let newFilters = { ...filtering }
        delete newFilters.accountId
        return newFilters
      } else {
        return {
          ...filtering,
          accountId: e.target.value,
        }
      }
    })
  }

  return <section>
    { data.accountIds.length > 2 &&
      <select id="filter-accountid" onChange={setAccountFilter}>
        <option value="all">All Accounts</option>
        { data.accountIds.map(acctId => {
          const thisAccount = accounts.find(acct => acct.id == acctId)
          return <option key={acctId} value={acctId}>{ thisAccount.name }</option>
        }) }
      </select>
    }
  </section>
}

function applyFiltersToTransactions (filters, transactions) {
  let filteredTransactions = [...transactions]
  Object.keys(filters).forEach((filterName) => {
    if (filterName == 'accountId') {
      if (filters[filterName] != 'all') {
        filteredTransactions = filteredTransactions.filter(txn => txn.accountId == filters[filterName])
      }
    }
  })
  return filteredTransactions
}
