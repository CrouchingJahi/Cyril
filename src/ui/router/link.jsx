import React from 'react'
import { connect } from 'react-redux'

import { route } from '~/store/actions'

export class Link extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (e) {
    e.preventDefault()
    this.props.gotoRoute(this.props.to)
  }

  render () {
    return <a href
              className={this.props.className}
              ref={elem => this.link = elem}
              onClick={this.handleClick}>
              { this.props.children }
           </a>
  }
}

const mapDispatchToProps = dispatch => {
  return {
    gotoRoute: to => {
      dispatch(route(to))
    }
  }
}

export default connect(null, mapDispatchToProps)(Link)
