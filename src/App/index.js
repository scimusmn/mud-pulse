import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import './App.css';
import PeriodicGraphWithSerialCommunication from '../Graph/PeriodicGraph';
import RealtimeGraphWithSerialCommunication from '../Graph/RealtimeGraph';
import { WAKE_ARDUINO } from '../Serial/arduinoConstants';
import withSerialCommunication from '../Serial/SerialHOC';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      handshake: false,
    };
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);
    document.addEventListener('keydown', this.handleReset);
    this.checkHandshake();
  }

  shouldComponentUpdate() {
    const { realtime } = this.state;
    return !realtime;
  }

  onData(data) {
    /* eslint no-console: 0 */
    /* eslint class-methods-use-this: 0 */
    if (data.message === 'button-press') {
      console.log('Button was pressed');
    }
  }

  checkHandshake() {
    const { sendData } = this.props;
    const { handshake } = this.state;

    if (!handshake) {
      sendData(WAKE_ARDUINO);
      setTimeout(() => {
        this.checkHandshake();
      }, 3000);
    }
  }

  render() {
    return (
      <Fragment>
        <div className="chart-container">
          <PeriodicGraphWithSerialCommunication
            label="pulses"
            message="pressure-reading"
            type="line"
            yMax={1023}
          />
        </div>
        <div className="chart-container">
          <RealtimeGraphWithSerialCommunication
            backgroundColor="rgb(99, 255, 132)"
            label="realtime"
            message="pressure-reading"
            type="line"
            yMax={1023}
          />
        </div>
      </Fragment>
    );
  }
}

App.propTypes = {
  sendData: propTypes.func.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
};

const AppWithSerialCommunication = withSerialCommunication(App);
export default AppWithSerialCommunication;
