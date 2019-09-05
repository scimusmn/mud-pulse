import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import './index.css';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';

class Strata extends Component {
  constructor(props) {
    super(props);
    this.state = {
      strata: 'Unknown',
    };

    this.onSerialData = this.onSerialData.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
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
          strata = 'Limestone';
          break;
        case 3:
          strata = 'Dolomite';
          break;
        case 4:
          strata = 'Shale';
          break;
        case 5:
          strata = 'Sandstone';
          break;
        default:
          strata = 'Unknown';
          break;
      }

      this.updateDisplay(strata);
    }
  }

  updateDisplay(strata) {
    this.setState({
      strata,
    });
  }

  render() {
    const { strata } = this.state;

    return (
      <Fragment>
        <div id="strataDisplay" className="px-2 text-center">
          <h2><u>Strata Location</u></h2>
          {strata}
        </div>
      </Fragment>
    );
  }
}

Strata.propTypes = {
  setOnDataCallback: propTypes.func.isRequired,
};

const StrataWithSerialCommunication = withSerialCommunication(Strata);
export default StrataWithSerialCommunication;
