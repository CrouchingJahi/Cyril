import React from 'react'
import { connect } from 'react-redux'

import Link from '~/router/link'

export class TextSummary extends React.Component {
  render () {
    let categories = this.props.account.transactions.reduce((summary, transaction) => {
      summary[transaction.category.category] = transaction.amount + (summary[transaction.category.category] || 0)
      return summary
    }, {})
    let total = Object.keys(categories).reduce((cat, total) => total + categories[cat], 0)

    return (
      <div>
        <p>Total spending: { total }</p>
        <table>
          <tr>
            <th>Category</th>
            <th>Monies</th>
          </tr>
          { Object.keys[categories].map((cat) => (
            <tr>
              <td>{ cat }</td>
              <td>{ categories[cat] }</td>
            </tr>
          ) ) }
        </table>
      </div>
    )
  }
}

export class SummaryPage extends React.Component {
  render () {
    return (
      <div id="summary">
        <Link className="small" to="spending">&#x25c4; Back to Spending screen</Link>
        <h2>Summary - { this.props.account.id }</h2>
        <span>{this.props.account.transactions.length} Transactions</span>
        <TextSummary account={this.props.account} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.accounts.find(acct => acct.id == state.session.account),
  }
}

export default connect(mapStateToProps)(SummaryPage)
