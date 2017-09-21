import React from 'react'
import { connect } from 'react-redux'

import { getCategories, updateCategories } from '~/store/actions'

export class CategoryPicker extends React.Component {

  constructor(props) {
    super(props)

    let value = this.props.value || {}
    this.state = {
      group: value.group || '',
      category: value.category || '',
      subcategory: value.subcategory || ''
    }

    this.onChange = this.onChange.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.composeCategorizations = this.composeCategorizations.bind(this)
  }

  onChange (e) {
    this.setState({[e.target.name]: e.target.value})
  }

  composeCategorizations () {
    let newCats = this.props.categorizations
    if (this.state.group) {
      newCats[this.state.group] = newCats[this.state.group] || {}
      if (this.state.category) {
        newCats[this.state.group][this.state.category] = newCats[this.state.group][this.state.category] || {}
        if (this.state.subcategory) {
          newCats[this.state.group][this.state.category][this.state.subcategory] = true
        }
      }
    }
    return newCats
  }

  onBlur () {
    this.props.getCategories()
    // this.props.dispatch(updateCategories(this.composeCategorizations()))
    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          group: this.state.group,
          category: this.state.category,
          subcategory: this.state.subcategory
        }
      }
    })
  }

  render () {
    let groups = Object.keys(this.props.categorizations)
    let categories = this.state.group && this.props.categorizations[this.state.group] ? Object.keys(this.props.categorizations[this.state.group]) : []
    let subcategories = this.state.category && this.props.categorizations[this.state.group] && this.props.categorizations[this.state.group][this.state.category] ? Object.keys(this.props.categorizations[this.state.group][this.state.category]) : []
    return (
      <form>
        <input name="group" type="text" list="group"
               value={this.state.group} onChange={this.onChange} onBlur={this.onBlur} />
        { this.state.group &&
          <input name="category" type="text" list="category"
                 value={this.state.category} onChange={this.onChange} onBlur={this.onBlur} />
        }
        { this.state.category &&
          <input name="subcategory" type="text" list="subcategory"
                 value={this.state.subcategory} onChange={this.onChange} onBlur={this.onBlur} />
        }
        <datalist id="group">
          { groups.map(g => <option key={g}>{g}</option>) }
        </datalist>
        <datalist id="category">
          { categories.map(g => <option key={g}>{g}</option>) }          
        </datalist>
        <datalist id="subcategory">
          { subcategories.map(g => <option key={g}>{g}</option>) }
        </datalist>
      </form>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    categorizations: state.categories
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getCategories () {
      dispatch(getCategories())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPicker)
