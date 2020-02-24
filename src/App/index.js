/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import { Container, Spinner, Button } from 'reactstrap';
import propTypes from 'prop-types';

import { WAKE_ARDUINO } from '../Arduino/arduino-base/ReactSerial/arduinoConstants';
import IPC from '../Arduino/arduino-base/ReactSerial/IPCMessages';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';
import PeriodicGraphWithSerialCommunication from '../Graph/PeriodicGraph';
import './index.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anticipatedStrata: [3, 4, 2, 5],
      graphing: false,
      handshake: false,
      invalidPulse: false,
      pingArduinoStatus: false,
      refreshPortCount: 0,
      layer: 0,
      step: 0,
    };

    this.getArtboard = this.getArtboard.bind(this);
    this.nextClick = this.nextClick.bind(this);
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
    const { anticipatedStrata, handshake, layer } = this.state;

    console.log(data);

    if (data.message === 'arduino-ready') {
      if (!handshake) this.setState({ handshake: true, step: 0, layer: 0 });

      this.setState({
        pingArduinoStatus: false,
        refreshPortCount: 0,
      });
    }

    if (handshake) {
      if (data.message === 'material') {
        if (Number(data.value) === anticipatedStrata[layer]) {
          this.setState({
            graphing: false,
            invalidPulse: true,
            step: 5,
          });
        } else {
          this.setState({ step: 4 });
        }

        this.setState({ graphing: false });
      }
    }
  }

  getArtboard() {
    const { step, layer } = this.state;

    switch (true) {
      case ((layer === 0) && (step === 0)):
        return '/images/01_DrillBit_Intro.png';

      case ((layer === 0) && (step === 1)):
        return '/images/02_DrillBit_NotDrilled_Progress.png';
      case ((layer === 0) && (step === 2)):
        return '/images/03_DrillBit_NotDrilled_Instructions.png';
      case ((layer === 0) && (step === 3)):
        return '/images/04_DrillBit_NotDrilled_Analysis.png';
      case ((layer === 0) && (step === 4)):
        return '/images/05_DrillBit_NotDrilled_DrillingSuccess.png';
      case ((layer === 0) && (step === 5)):
        return '/images/06_DrillBit_NotDrilled_DrillingFailure.png';

      case ((layer === 1) && (step === 1)):
        return '/images/07_DrillBit_Mudstone_Progress.png';
      case ((layer === 1) && (step === 2)):
        return '/images/08_DrillBit_Mudstone_Instructions.png';
      case ((layer === 1) && (step === 3)):
        return '/images/09_DrillBit_Mudstone_Analysis.png';
      case ((layer === 1) && (step === 4)):
        return '/images/10_DrillBit_Mudstone_DrillingSuccess.png';
      case ((layer === 1) && (step === 5)):
        return '/images/11_DrillBit_Mudstone_DrillingFailure.png';

      case ((layer === 2) && (step === 1)):
        return '/images/12_DrillBit_Sandstone_Progress.png';
      case ((layer === 2) && (step === 2)):
        return '/images/13_DrillBit_Sandstone_Instructions.png';
      case ((layer === 2) && (step === 3)):
        return '/images/14_DrillBit_Sandstone_Analysis.png';
      case ((layer === 2) && (step === 4)):
        return '/images/15_DrillBit_Sandstone_DrillingSuccess.png';
      case ((layer === 2) && (step === 5)):
        return '/images/16_DrillBit_Sandstone_DrillingFailure.png';

      case ((layer === 3) && (step === 1)):
        return '/images/17_DrillBit_Dolomite_Progress.png';
      case ((layer === 3) && (step === 2)):
        return '/images/18_DrillBit_Dolomite_Instructions.png';
      case ((layer === 3) && (step === 3)):
        return '/images/19_DrillBit_Dolomite_Analysis.png';
      case ((layer === 3) && (step === 4)):
        return '/images/20_DrillBit_Dolomite_DrillingSuccess.png';
      case ((layer === 3) && (step === 5)):
        return '/images/21_DrillBit_Dolomite_DrillingFailure.png';

      default:
        return '';
    }
  }

  nextClick() {
    const { invalidPulse, step, layer } = this.state;
    const { sendData } = this.props;

    let currentStep = step;
    let currentLayer = layer;

    if (invalidPulse) {
      currentStep = 2;
    } else {
      if (currentStep === 2) {
        sendData('{allow-graphing:1}');
        this.setState({ graphing: true });
      }

      currentStep += 1;

      // Handle successful end of layer
      if (currentStep > 4) {
        currentLayer += 1;
        currentStep = 1;
      }

      // Handle successful end of game
      if (currentLayer > 4) {
        currentLayer = 0;
        currentStep = 1;
      }
    }

    this.setState({
      invalidPulse: false,
      layer: currentLayer,
      step: currentStep,
    });
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
      graphing, invalidPulse, layer, step,
    } = this.state;

    // if (resetMessage) {
    //   setTimeout(() => {
    //     this.setState({ resetMessage: false });
    //     window.location.reload();
    //   }, 10000);
    // }

    const spinnerVisibilityClass = (graphing) ? 'spinner-container' : 'd-none spinner-container';
    const actionButtonVisibilityClass = (graphing) ? 'd-none next-btn' : 'next-btn';
    const errorButtonVisibilityClass = (!invalidPulse) ? 'd-none next-btn' : 'next-btn';

    return (
      <Fragment>
        <Container>
          <p id="layerInfo">
            Layer:
            {' '}
            {layer}
          </p>
          <p id="stepInfo">
            Step:
            {' '}
            {step}
          </p>
          <img alt="Artboard" className="artboard" src={this.getArtboard()} />
          <Button
            className={actionButtonVisibilityClass}
            color="primary"
            onClick={() => this.nextClick()}
          >
            <img alt="Action Button" src="/images/1010_Button_DigitalAsset_MessagingFromTheDrillBit_GTS_2020-01.png" />
          </Button>
          <Button
            className={errorButtonVisibilityClass}
            color="primary"
            onClick={() => this.nextClick()}
          >
            <img alt="Error Button" src="/images/1010_RedButton_DigitalAsset_MessagingFromTheDrillBit_GTS_2020-01.png" />
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
