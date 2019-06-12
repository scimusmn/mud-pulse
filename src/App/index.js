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
            type="bar"
          />
        </div>
        <div className="chart-container">
          <MeasurementFromSerialCommunication
            backgroundColor="rgb(99, 255, 132)"
            label="potentiometer"
            message="pressure-reading"
            realtime
            type="line"
          />
        </div>
      </Fragment>
    );
  }
}
