import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';
import './index.css';

class Flipbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graphing: false,
      strata: 'strata1',
    };

    this.onSerialData = this.onSerialData.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
  }

  onSerialData(data) {
    if (data.message === 'material') {
      let strata = '';
      switch (data.value) {
        case 2:
          strata = 'strata1';
          break;
        case 3:
          strata = 'strata2';
          break;
        case 4:
          strata = 'strata3';
          break;
        case 5:
          strata = 'strata1';
          break;
        default:
          strata = 'strata1';
          break;
      }

      this.setState({
        strata,
      });
    }

    if (data.message === 'button-press') {
      this.setState({
        graphing: true,
      });
    }

    // Ending sampling
    if (data.message === 'time-up') {
      this.setState({
        graphing: false,
      });
    }
  }

  render() {
    const { graphing, strata } = this.state;

    let strata1 = '';
    let strata2 = '';
    let strata3 = '';

    let fakeModalClass = 'd-none';

    switch (strata) {
      case 'strata1':
        strata2 = 'd-none';
        strata3 = 'd-none';
        break;
      case 'strata2':
        strata1 = 'd-none';
        strata3 = 'd-none';
        break;
      case 'strata3':
        strata1 = 'd-none';
        strata2 = 'd-none';
        break;
      default:
        strata2 = 'd-none';
        strata3 = 'd-none';
        break;
    }

    if (graphing) {
      strata1 += ' graphingBlur';
      strata2 += ' graphingBlur';
      strata3 += ' graphingBlur';
      fakeModalClass = '';
    }

    /* eslint prefer-template: 0 */

    return (
      <Fragment>
        <div id="strata1" className={'flipbook ' + strata1} />
        <div id="strata2" className={'flipbook ' + strata2} />
        <div id="strata3" className={'flipbook ' + strata3} />
        <div id="fakeModal" className={fakeModalClass}>
          Graphing
        </div>
      </Fragment>
    );
  }
}

Flipbook.propTypes = {
  setOnDataCallback: propTypes.func.isRequired,
};

const FlipbookWithSerialCommunication = withSerialCommunication(Flipbook);
export default FlipbookWithSerialCommunication;
