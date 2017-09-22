import React from 'react'
import { connect } from 'react-redux'

import { BackToMenuLink } from '~/router/link'

export class SpendingScreen extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedAccount: ''
    }

    this.selectAccount = this.selectAccount.bind(this)
  }

  selectAccount (id) {
    this.setState({
      selectedAccount: id
    })
  }

  render () {
    return (
      <div id="spending">
        <BackToMenuLink />
        <h2>Spending</h2>
        { this.state.selectedAccount ?
          <div>{ this.state.selectedAccount }</div>
          :
          <div>
            <p>Select an account:</p>
            <ul>
              { this.props.accounts.map(acct => <li><a onClick={() => this.selectAccount(acct.id)}>{ acct.id }</a></li>) }
            </ul>
          </div>
        }
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
