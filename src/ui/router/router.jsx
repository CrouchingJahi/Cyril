import React from 'react'

export function newRoutingEvent(state) {
  return new CustomEvent('route', {
    detail: state,
    bubbles: true,
    cancelable: true
  })
}

export default class Router extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      route: this.props.default
    }

    this.changeState = this.changeState.bind(this)
  }

  componentDidMount() {
    this.router.addEventListener('route', this.changeState)
  }

  componentWillUnmount() {
    this.router.removeEventListener('route', this.changeState)
  }

  changeState(e) {
    const route = e.detail

    if (!route || !this.props.states[route]) {
      throw new Error('Router error: Illegal route: ' + route)
    }
    else {
      this.setState({ route })
    }
  }

  render() {
    var Route = this.props.states[this.state.route]
    return <div id="router" ref={elem => this.router = elem}><Route /></div>
  }
}
