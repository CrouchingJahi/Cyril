import React from 'react'

import { CategoryPicker } from '~/components/category-picker'

export class Categorizer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: this.props.transaction.name,
      notes: this.props.transaction.memo,
      categorization: this.props.transaction.categorization
    }

    this.onChange = this.onChange.bind(this)
    this.asCurrency = this.asCurrency.bind(this)
  }

  asCurrency (num) {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  onChange (e) {
    this.setState({[e.target.name]: e.target.value})
  }

  render () {
    return (
      <div>
        Date: { new Date(this.props.transaction.date).toString() }<br/>
        Amount: { this.asCurrency(this.props.transaction.amount) }<br/>
        Type: { this.props.transaction.type }<br/>
        Name: <input name="name" value={this.state.name} onChange={this.onChange} /><br/>
        Notes: <input name="notes" value={this.state.notes} onChange={this.onChange} /><br/>
        Category: <CategoryPicker categorization={ this.state.categorization } />
      </div>
    )
  }
}
