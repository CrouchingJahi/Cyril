import React from 'react'

export class CategoryPicker extends React.Component {
  defaultProps() {
    return {
      value: {
        group: '',
        category: '',
        subcategory: ''
      }
    }
  }

  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
  }

  onChange (e) {
    this.setState({ value: { [e.target.name]: e.target.value } })
  }

  render () {
    return (
      <form>
        <input name="group" type="text" list="group" onChange={this.onChange} />
        <datalist id="group">
          {
            <option value="" />
          }
        </datalist>
      </form>
    )
  }
}
