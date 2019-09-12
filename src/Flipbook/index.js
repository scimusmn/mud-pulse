import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import './index.css';

class Flipbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleReset);
  }

  render() {
    const { graphing, resetMessage, round } = this.props;

    let strata1 = '';
    let strata2 = '';
    let strata3 = '';
    let strata4 = '';

    let fakeModalClass = 'd-none';

    switch (round) {
      case 0:
        strata2 = 'd-none';
        strata3 = 'd-none';
        strata4 = 'd-none';
        break;
      case 1:
        strata1 = 'd-none';
        strata3 = 'd-none';
        strata4 = 'd-none';
        break;
      case 2:
        strata1 = 'd-none';
        strata2 = 'd-none';
        strata4 = 'd-none';
        break;
      default:
        strata2 = 'd-none';
        strata3 = 'd-none';
        strata4 = 'd-none';
        break;
    }

    if (resetMessage) {
      strata1 = 'd-none';
      strata2 = 'd-none';
      strata3 = 'd-none';
      strata4 = '';
    }

    if (graphing) {
      strata1 += ' graphingBlur';
      strata2 += ' graphingBlur';
      strata3 += ' graphingBlur';
      strata4 += ' graphingBlur';
      fakeModalClass = '';
    }

    /* eslint prefer-template: 0 */

    return (
      <Fragment>
        <div id="strata1" className={'flipbook ' + strata1} />
        <div id="strata2" className={'flipbook ' + strata2} />
        <div id="strata3" className={'flipbook ' + strata3} />
        <div id="strata4" className={'flipbook ' + strata4} />
        <div id="fakeModal" className={fakeModalClass}>
          Graphing...
        </div>
      </Fragment>
    );
  }
}

Flipbook.propTypes = {
  graphing: propTypes.bool.isRequired,
  resetMessage: propTypes.bool.isRequired,
  round: propTypes.number.isRequired,
};

export default Flipbook;
