import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';
import './index.css';

class Flipbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
  }

  render() {
    const { strata } = this.state;

    return (
      <Fragment>
        <div id="flipbook" className={strata} />
      </Fragment>
    );
  }
}

Flipbook.propTypes = {
  setOnDataCallback: propTypes.func.isRequired,
};

const FlipbookWithSerialCommunication = withSerialCommunication(Flipbook);
export default FlipbookWithSerialCommunication;
