import React from 'react';

export function newRoutingEvent(state) {
  return new CustomEvent('route', {
    detail: state,
    bubbles: true,
    cancelable: true
  });
}

export default class Router extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      route: this.props.default
    };

    this.changeState = this.changeState.bind(this);
  }

  componentDidMount() {
    this.router.addEventListener('route', this.changeState);
  }

  componentWillUnmount() {
    this.router.removeEventListener('route', this.changeState);
  }

  changeState(e) {
    const state = e.detail;

    if (!state || !this.props.states[state]) {
      throw new Error('Router error: Illegal route: ' + state);
    }
    else {
      this.setState({
        route: e.detail
      });
    }
  }

  render() {
    var Route = this.props.states[this.state.route];
    return <div id="router" ref={elem => this.router = elem}><Route /></div>;
  }
}
