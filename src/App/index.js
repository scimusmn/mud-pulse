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
      anticipatedStrata: [3, 4, 5],
      graphing: false,
      handshake: false,
      invalidPulse: false,
      pingArduinoStatus: false,
      refreshPortCount: 0,
      resetMessage: false,
      round: 0,
      step: 0,
    };

    this.getArtboard = this.getArtboard.bind(this);
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
      anticipatedStrata, graphing, handshake, invalidPulse, resetMessage, round, step,
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
        if (data.message === 'material') {
          if (data.value === anticipatedStrata[round]) {
            this.setState(prevState => ({ step: prevState.step + 1 }));

            if (round === 2) {
              this.setState({
                invalidPulse: false,
                resetMessage: true,
                round: 0,
              });
            } else {
              this.setState({
                invalidPulse: false,
                resetMessage: false,
                round: round + 1,
              });
            }
          } else {
            this.setState({ invalidPulse: true });
          }
        }

        if (data.message === 'button-press') {
          if (invalidPulse) {
            let prevStep = 0;
            switch (step) {
              case 5:
                prevStep = 4;
                break;
              case 9:
                prevStep = 8;
                break;
              case 13:
                prevStep = 12;
                break;
              default:
                break;
            }

            sendData(JSON.stringify({ message: 'allow-graphing', value: 1 }));
            this.setState({ invalidPulse: false, step: prevStep });
          } else if (!graphing && (step === 4 || step === 8 || step === 12)) {
            this.setState(prevState => ({ graphing: true, step: prevState.step + 1 }));
          } else {
            if (step === 3 || step === 7 || step === 11) {
              sendData(JSON.stringify({ message: 'allow-graphing', value: 1 }));
            }
            this.setState(prevState => ({ step: prevState.step + 1 }));
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
    const { invalidPulse, step } = this.state;
    if (invalidPulse) return '/images/Screen_15_2019.png';
    let src = '';

    switch (step) {
      case 0:
        src = '/images/Title_Screen_2019.png';
        break;
      case 1:
        src = '/images/Screen_1_2019.png';
        break;
      case 2:
        src = '/images/Screen_2_2019.png';
        break;
      case 3:
        src = '/images/Screen_3_2019.png';
        break;
      case 4:
        src = '/images/Screen_4_2019.png';
        break;
      case 5:
        src = '/images/Screen_5_2019.png';
        break;
      case 6:
        src = '/images/Screen_6_2019.png';
        break;
      case 7:
        src = '/images/Screen_7_2019.png';
        break;
      case 8:
        src = '/images/Screen_8_2019.png';
        break;
      case 9:
        src = '/images/Screen_9_2019.png';
        break;
      case 10:
        src = '/images/Screen_10_2019.png';
        break;
      case 11:
        src = '/images/Screen_11_2019.png';
        break;
      case 12:
        src = '/images/Screen_12_2019.png';
        break;
      case 13:
        src = '/images/Screen_13_2019.png';
        break;
      case 14:
        src = '/images/Screen_14_2019.png';
        break;
      default:
        break;
    }

    return src;
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
    const {
      graphing, handshake, resetMessage, step,
    } = this.state;

    if (!handshake) {
      return (
        <Container>
          <p>
            Step:
            {' '}
            {step}
          </p>
          <img alt="Artboard" className="artboard" src={this.getArtboard()} />
          <div className="spinner-container">
            <Spinner />
          </div>
        </Container>
      );
    }

    if (resetMessage) {
      setTimeout(() => {
        this.setState({ resetMessage: false });
        window.location.reload();
      }, 10000);
    }

    return (
      <Fragment>
        <Container>
          <p>
            Step:
            {' '}
            {step}
          </p>
          <img alt="Artboard" className="artboard" src={this.getArtboard()} />
          <PeriodicGraphWithSerialCommunication
            graphing={graphing}
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
