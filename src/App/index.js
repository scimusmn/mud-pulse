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
      anticipatedStrata, graphing, handshake, invalidPulse, resetMessage, layer, step,
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

            if (layer === 4) {
              this.setState({
                invalidPulse: false,
                resetMessage: true,
                layer: 0,
              });
            } else {
              this.setState({
                invalidPulse: false,
                resetMessage: false,
                layer: layer + 1,
              });
            }
          } else {
            this.setState({ invalidPulse: true });
          }
        }

        if (data.message === 'button-press' && !graphing) {
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
    if (invalidPulse) {
      switch (step) {
        case 5:
          return '/images/Layer1_ErrorScreen.png';
        case 9:
          return '/images/Layer2_ErrorScreen.png';
        case 13:
          return '/images/Layer3_ErrorScreen.png';
        default:
          return '';
      }
    }

    switch (step) {
      case 0:
        return '/images/Title_Screen_2019.png';
      case 1:
        return '/images/Screen_1_2019.png';
      case 2:
        return '/images/Screen_2_2019.png';
      case 3:
        return '/images/Screen_3_2019.png';
      case 4:
        return '/images/First_Layer.png';
      case 5:
        return '/images/First_Layer-1.png';
      case 6:
        return '/images/Second_Layer.png';
      case 7:
        return '/images/Second_Layer-1.png';
      case 8:
        return '/images/Second_Layer-2.png';
      case 9:
        return '/images/Second_Layer-3.png';
      case 10:
        return '/images/Third_Layer-3.png';
      case 11:
        return '/images/Third_Layer.png';
      case 12:
        return '/images/Third_Layer-1.png';
      case 13:
        return '/images/Third_Layer-2.png';
      case 14:
        return '/images/Oil_Layer.png';
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
