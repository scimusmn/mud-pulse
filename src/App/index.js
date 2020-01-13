/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import { Container, Spinner } from 'reactstrap';
import propTypes from 'prop-types';

import { ARDUINO_READY, WAKE_ARDUINO } from '../Arduino/arduino-base/ReactSerial/arduinoConstants';
import IPC from '../Arduino/arduino-base/ReactSerial/IPCMessages';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';
import PeriodicGraphWithSerialCommunication from '../Graph/PeriodicGraph';
import './index.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anticipatedStrata: [3, 4, 5, 2],
      graphing: false,
      handshake: false,
      invalidPulse: false,
      pingArduinoStatus: false,
      refreshPortCount: 0,
      resetMessage: false,
      layer: 0,
      step: 0,
    };

    this.getArtboard = this.getArtboard.bind(this);
    this.getSpinnerMessage = this.getSpinnerMessage.bind(this);
    this.onSerialData = this.onSerialData.bind(this);
    this.pingArduino = this.pingArduino.bind(this);
    this.refreshPorts = this.refreshPorts.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
    this.pingArduino();
  }

  onSerialData(data) {
    const { sendData } = this.props;
    const {
      anticipatedStrata, graphing, handshake, resetMessage, layer, step,
    } = this.state;

    if (data.message === ARDUINO_READY.message) {
      if (!handshake) this.setState({ handshake: true, step: 1 });

      this.setState({
        pingArduinoStatus: false,
        refreshPortCount: 0,
      });
    }

    if (handshake) {
      if (!resetMessage) {
        if (data.message === 'material' && layer > 0) {
          if (data.value === anticipatedStrata[layer - 1]) {
            this.setState(prevState => ({ step: prevState.step + 1 }));
          } else {
            this.setState(prevState => ({ step: prevState.step + 2 }));
          }
        }

        // Ending sampling
        if (data.message === 'time-up') {
          sendData(JSON.stringify({ message: 'allow-graphing', value: 0 }));
          this.setState({ graphing: false });
        }
      }
    }
  }

  getArtboard() {
    const { step, layer } = this.state;

    switch (true) {
      case ((layer === 0) && (step === 1)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 0) && (step === 2)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 0) && (step === 3)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 1) && (step === 1)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 1) && (step === 2)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 1) && (step === 3)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 1) && (step === 4)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 2) && (step === 1)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 2) && (step === 2)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 2) && (step === 3)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 2) && (step === 4)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 3) && (step === 1)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 3) && (step === 2)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 3) && (step === 3)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 3) && (step === 4)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 4) && (step === 1)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 4) && (step === 2)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 4) && (step === 3)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 4) && (step === 4)):
        return '/images/Title_Screen_2019.png';
      default:
        return '';
    }
  }

  getSpinnerMessage() {
    const { step } = this.state;

    switch (step) {
      case 3:
        return 'Drilling has started...';
      case 5:
      case 9:
      case 13:
        return 'Receiving data...';
      case 7:
      case 11:
        return 'Resume Drilling...';
      case 0:
      default:
        return '';
    }
  }

  pingArduino() {
    const { sendData } = this.props;
    const { pingArduinoStatus } = this.state;

    if (pingArduinoStatus) this.refreshPorts();
    this.setState({ pingArduinoStatus: true });
    sendData(JSON.stringify(WAKE_ARDUINO));

    setTimeout(() => { this.pingArduino(); }, 5000);
  }

  refreshPorts() {
    const { sendData, startIpcCommunication, stopIpcCommunication } = this.props;
    const { refreshPortCount } = this.state;

    if (refreshPortCount === 2) {
      this.setState({ handshake: false });

      console.log('sending RESET-PORT');
      sendData(IPC.RESET_PORTS_COMMAND);
      console.log('restarting ipcCommunication...');

      stopIpcCommunication();
      startIpcCommunication();
    }

    this.setState(prevState => ({ refreshPortCount: prevState.refreshPortCount + 1 }));
  }

  render() {
    const { resetMessage, step } = this.state;

    if (resetMessage) {
      setTimeout(() => {
        this.setState({ resetMessage: false });
        window.location.reload();
      }, 10000);
    }

    const spinnerVisibilityClass = (
      step === 0 || step === 3 || step === 5 || step === 7
      || step === 9 || step === 11 || step === 13
    ) ? 'spinner-container' : 'd-none spinner-container';

    return (
      <Fragment>
        <Container>
          <p>
            Step:
            {' '}
            {step}
          </p>
          <img alt="Artboard" className="artboard" src={this.getArtboard()} />
          <div className={spinnerVisibilityClass}>
            <Spinner />
            <span className="text-light">{this.getSpinnerMessage()}</span>
          </div>
          <PeriodicGraphWithSerialCommunication
            gridColor="rgb(255, 255, 255)"
            label="Sampled Pulses"
            message="pressure-reading"
            resetMessage={resetMessage}
            step={step}
            type="line"
            yMax={1023}
          />
        </Container>
      </Fragment>
    );
  }
}

App.propTypes = {
  sendData: propTypes.func.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
  startIpcCommunication: propTypes.func.isRequired,
  stopIpcCommunication: propTypes.func.isRequired,
};

const AppWithSerialCommunication = withSerialCommunication(App);
export default AppWithSerialCommunication;
