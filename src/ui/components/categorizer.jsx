import React from 'react'

import CategoryPicker from '~/components/category-picker'

export class Categorizer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: this.props.transaction.name,
      memo: this.props.transaction.memo,
      categorization: this.props.transaction.categorization
    }

    this.onChange = this.onChange.bind(this)
    this.onChangeCategory = this.onChangeCategory.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.asCurrency = this.asCurrency.bind(this)
  }

  asCurrency (num) {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  onChange (e) {
    this.setState({[e.target.name]: e.target.value})
  }

  onChangeCategory (e) {
    this.onChange(e)
    this.onBlur()
  }

  onBlur () {
    this.props.onChange(this.state)    
  }

  render () {
    return (
      <div>
        Date: { new Date(this.props.transaction.date).toString() }<br/>
        Amount: { this.asCurrency(this.props.transaction.amount) }<br/>
        Type: { this.props.transaction.type }<br/>
        Name: <input name="name" value={this.props.transaction.name} onChange={this.onChange} onBlur={this.onBlur} /><br/>
        Notes: <input name="notes" value={this.props.transaction.memo} onChange={this.onChange} onBlur={this.onBlur} /><br/>
        Category: <CategoryPicker name="categorization" value={this.props.transaction.categorization} onChange={this.onChangeCategory} />
      </div>
    )
  }
}
