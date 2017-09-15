import React from 'react'
import { connect } from 'react-redux'

export class Router extends React.Component {
  componentWillReceiveProps (props) {
    if (!props.route || !props.states[props.route]) {
      throw new Error('Illegal route: ' + props.route)
    }
  }
  render () {
    var Route = this.props.states[this.props.route]
    return <div id="router" ref={elem => this.router = elem}><Route /></div>
  }
}

const mapStateToProps = state => {
  return {
    route: state.route
  }
}

export default connect(mapStateToProps)(Router)
