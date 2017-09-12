import React from 'react'
import { connect } from 'react-redux'

export class Router extends React.Component {
  render() {
    if (!this.props.route || !this.props.states[this.props.route]) {
      throw new Error('Router error: Illegal route: ' + route)
    }
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
