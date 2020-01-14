/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import { Container, Spinner, Button } from 'reactstrap';
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
      anticipatedStrata: [3, 4, 2, 5],
      handshake: false,
      pingArduinoStatus: false,
      refreshPortCount: 0,
      layer: 0,
      step: 1,
      graphing: false,
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
    const {
      anticipatedStrata, handshake, layer,
    } = this.state;

    if (data.message === ARDUINO_READY.message) {
      if (!handshake) this.setState({ handshake: true, step: 2, layer: 0 });

      this.setState({
        pingArduinoStatus: false,
        refreshPortCount: 0,
      });
    }

    if (handshake) {
      if (data.message === 'material' && layer > 0) {
        if (data.value === anticipatedStrata[layer - 1]) {
          this.setState({ step: 4 });
        } else {
          this.setState({ step: 3 });
        }
        this.setState({ graphing: false });
      }
    }
  }

  getArtboard() {
    const { step, layer } = this.state;

    switch (true) {
      case ((layer === 0) && (step === 1)):
        return '/images/Screen_0_2019.png';
      case ((layer === 0) && (step === 2)):
        return '/images/Title_Screen_2019.png';
      case ((layer === 0) && (step === 3)):
        return '/images/Screen_1_2019.png';
      case ((layer === 0) && (step === 4)):
        return '/images/Screen_2_2019.png';
      case ((layer === 1) && (step === 1)):
        return '/images/First_Layer.png';
      case ((layer === 1) && (step === 2)):
        return '/images/First_Layer_analysis.png';
      case ((layer === 1) && (step === 3)):
        return '/images/First_Layer_Error_Screen.png';
      case ((layer === 1) && (step === 4)):
        return '/images/First_Layer_identified.png';
      case ((layer === 2) && (step === 1)):
        return '/images/Second_Layer.png';
      case ((layer === 2) && (step === 2)):
        return '/images/Second_Layer_analysis.png';
      case ((layer === 2) && (step === 3)):
        return '/images/Second_Layer_Error_Screen.png';
      case ((layer === 2) && (step === 4)):
        return '/images/Second_Layer_identified.png';
      case ((layer === 3) && (step === 1)):
        return '/images/Third_Layer.png';
      case ((layer === 3) && (step === 2)):
        return '/images/Third_Layer_analysis.png';
      case ((layer === 3) && (step === 3)):
        return '/images/Third_Layer_Error_Screen.png';
      case ((layer === 3) && (step === 4)):
        return '/images/Third_Layer_identified.png';
      case ((layer === 4) && (step === 1)):
        return '/images/Fourth_Layer.png';
      case ((layer === 4) && (step === 2)):
        return '/images/Fourth_Layer_analysis.png';
      case ((layer === 4) && (step === 3)):
        return '/images/Fourth_Layer_Error_Screen.png';
      case ((layer === 4) && (step === 4)):
        return '/images/Fourth_Layer_identified.png';
      default:
        return '';
    }
  }

  nextClick() {
    const { step, layer } = this.state;
    const { sendData } = this.props;
    let prevStep;
    let prevLayer;
    prevStep = step;
    prevLayer = layer;
    if (prevStep === 3 && layer !== 0) {
      this.setState({ graphing: true });
      sendData(JSON.stringify({ message: 'allow-graphing', value: 1 }));
    } else prevStep += 1;
    if (prevStep === 2 && layer !== 0) {
      this.setState({ graphing: true });
      sendData(JSON.stringify({ message: 'allow-graphing', value: 1 }));
    }
    if (prevStep > 4) {
      prevLayer += 1;
      prevStep = 1;
    }
    if (prevLayer > 4) {
      prevLayer = 0;
      prevStep = 2;
    }
    this.setState({ layer: prevLayer, step: prevStep });
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
      step, layer, graphing,
    } = this.state;

    // if (resetMessage) {
    //   setTimeout(() => {
    //     this.setState({ resetMessage: false });
    //     window.location.reload();
    //   }, 10000);
    // }

    const spinnerVisibilityClass = (graphing) ? 'spinner-container' : 'd-none spinner-container';

    const buttonVisibilityClass = (graphing) ? 'd-none next-btn' : 'next-btn';

    return (
      <Fragment>
        <Container>
          <p>
            Layer:
            {' '}
            {layer}
          </p>
          <p>
            Step:
            {' '}
            {step}
          </p>
          <img alt="Artboard" className="artboard" src={this.getArtboard()} />
          <Button
            className={buttonVisibilityClass}
            color="primary"
            onClick={() => this.nextClick()}
          >
          NEXT
          </Button>
          <div className={spinnerVisibilityClass}>
            <Spinner />
            <span className="text-light">Receiving data...</span>
          </div>
          <PeriodicGraphWithSerialCommunication
            gridColor="rgb(255, 255, 255)"
            label="Sampled Pulses"
            message="pressure-reading"
            graphing={graphing}
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
