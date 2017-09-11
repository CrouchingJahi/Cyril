import React from 'react'

import { CategoryPicker } from '~/components/category-picker'

export class Categorizer extends React.Component {
  constructor (props) {
    super(props)
    this.asCurrency = this.asCurrency.bind(this)
  }

  asCurrency (num) {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  render () {
    return (
      <div>
        Date: { new Date(this.props.transaction.date).toString() }<br/>
        Amount: { this.asCurrency(this.props.transaction.amount) }<br/>
        Type: { this.props.transaction.type }<br/>
        Name: { this.props.transaction.name }<br/>
        Notes: { this.props.transaction.memo }<br/>
        Category: <CategoryPicker categorization={ this.props.transaction.categorization } />
      </div>
    )
  }
}
