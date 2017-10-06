import React from 'react'
import { connect } from 'react-redux'

import Link, { BackToMenuLink } from '~/router/link'
import { selectAccount } from '~/store/actions'

export class SpendingScreen extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedAccount: ''
    }

    this.selectAccount = this.selectAccount.bind(this)
  }

  selectAccount (id) {
    this.props.dispatch(selectAccount(id))
  }

  render () {
    let account = this.props.accounts.find((acct) => acct.id == this.state.selectedAccount)

    return (
      <div id="spending">
        <BackToMenuLink />
        <h2>Spending</h2>
        <div>
          <p>Select an account:</p>
          <ul>
          { this.props.accounts.map(acct => (
            <li key={acct.id}>
              <Link onClick={() => this.selectAccount(acct.id)} to="summary">{acct.id}</Link>
            </li>
          ) ) }
          </ul>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts,
  }
}

export default connect(mapStateToProps)(SpendingScreen)
