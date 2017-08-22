import React from 'react';
import Radium from 'radium';

import { newRoutingEvent } from './router';

const css = {
  
};

@Radium
export default class Link extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.link.dispatchEvent(newRoutingEvent(this.props.to));
  }

  render() {
    return <a href
             ref={elem => this.link = elem}
             onClick={ this.handleClick }
           >
              { this.props.children }
           </a>;
  }
}
