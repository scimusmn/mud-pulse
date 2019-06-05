import React, { Component, Fragment } from 'react';
import './App.css';
import MeasurementFromSerialCommunication from '../Graph/MeasurementFromSerial';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <Fragment>
        <div className="chart-container">
          <MeasurementFromSerialCommunication
            label="button"
            message="button-press"
          />
        </div>
        <div className="chart-container">
          <MeasurementFromSerialCommunication
            label="potentiometer"
            message="pot-rotation"
          />
        </div>
      </Fragment>
    );
  }
}
