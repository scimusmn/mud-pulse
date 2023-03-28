/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import { Wave } from 'react-animated-text';
import { Button, Container } from 'reactstrap';
import propTypes from 'prop-types';

import { WAKE_ARDUINO } from '../Arduino/arduino-base/ReactSerial/arduinoConstants';
import IPC from '../Arduino/arduino-base/ReactSerial/IPCMessages';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';
import PeriodicGraph from '../Graph/PeriodicGraph';
import './index.css';

const initialState = {
  anticipatedStrata: [2, 3, 4, 5],
  graphing: false,
  handshake: false,
  invalidPulse: false,
  pingArduinoStatus: false,
  refreshPortCount: 0,
  layer: 0,
  step: -1,
  timeout: null,
  pressure: 0,
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.getArtboard = this.getArtboard.bind(this);
    this.nextClick = this.nextClick.bind(this);
    this.onSerialData = this.onSerialData.bind(this);
    this.pingArduino = this.pingArduino.bind(this);
    this.refreshPorts = this.refreshPorts.bind(this);

    // for pressure reading render time
    this.latestPressureReading = 0;
    this.chartUpdateInterval = 50;
    this.chartUpdateTimer = {};
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
    this.pingArduino();

    // only send pressure updates while graphing
    this.chartUpdateTimer = setInterval(() => {
      const { graphing } = this.state;
      if (graphing) this.setState({ pressure: this.latestPressureReading });
    }, this.chartUpdateInterval);
  }

  componentWillUnmount() {
    clearInterval(this.chartUpdateTimer);
    this.chartUpdateTimer = null;
  }

  onSerialData(data) {
    const { anticipatedStrata, handshake, layer } = this.state;

    if (data.message === 'arduino-ready') {
      if (!handshake) this.setState({ handshake: true });

      this.setState({
        pingArduinoStatus: false,
        refreshPortCount: 0,
      });
    }

    if (handshake) {
      if (data.message === 'material') {
        console.log(anticipatedStrata[layer], 'DEBUG');
        // if (Number(data.value) === anticipatedStrata[layer]) {
        if (Number(data.value)) {
          this.setState({
            graphing: false,
            invalidPulse: false,
            step: 4,
            pressure: 0,
          });
        } else {
          this.setState({
            graphing: false,
            invalidPulse: true,
            step: 5,
            pressure: 0,
          });
        }
      }
      if (data.message === 'pressure-reading') {
        this.latestPressureReading = data.value;
      }
      if (data.message === 'time-up') {
        this.setState({ graphing: false });
      }
    }
  }

  getArtboard() {
    const { step, layer } = this.state;

    switch (true) {
      case ((layer === 0) && (step === 0)):
        return '/images/1_Intro.png';

      case ((layer === 0) && (step === 1)):
        return '/images/2_NotDrilled_Progress.png';
      case ((layer === 0) && (step === 2)):
        return '/images/3_NotDrilled_Instructions.png';
      case ((layer === 0) && (step === 3)):
        return '/images/4_NotDrilled_Analysis.png';
      case ((layer === 0) && (step === 4)):
        return '/images/5_NotDrilled_DrillingSuccess.png';
      case ((layer === 0) && (step === 5)):
        return '/images/6_NotDrilled_DrillingFailure.png';

      case ((layer === 1) && (step === 1)):
        return '/images/7_Mudstone_Progress.png';
      case ((layer === 1) && (step === 2)):
        return '/images/8_Mudstone_Instructions.png';
      case ((layer === 1) && (step === 3)):
        return '/images/9_Mudstone_Analysis.png';
      case ((layer === 1) && (step === 4)):
        return '/images/10_Mudstone_DrillingSuccess.png';
      case ((layer === 1) && (step === 5)):
        return '/images/11_Mudstone_DrillingFailure.png';

      case ((layer === 2) && (step === 1)):
        return '/images/12_Sandstone_Progress.png';
      case ((layer === 2) && (step === 2)):
        return '/images/13_Sandstone_Instructions.png';
      case ((layer === 2) && (step === 3)):
        return '/images/14_Sandstone_Analysis.png';
      case ((layer === 2) && (step === 4)):
        return '/images/15_Sandstone_DrillingSuccess.png';
      case ((layer === 2) && (step === 5)):
        return '/images/16_Sandstone_DrillingFailure.png';

      case ((layer === 3) && (step === 1)):
        return '/images/17_Dolomite_Progress.png';
      case ((layer === 3) && (step === 2)):
        return '/images/18_Dolomite_Instructions.png';
      case ((layer === 3) && (step === 3)):
        return '/images/19_Dolomite_Analysis.png';
      case ((layer === 3) && (step === 4)):
        return '/images/20_Dolomite_DrillingSuccess.png';
      case ((layer === 3) && (step === 5)):
        return '/images/21_Dolomite_DrillingFailure.png';

      default:
        return '';
    }
  }

  nextClick() {
    const {
      invalidPulse, layer, step, timeout,
    } = this.state;
    // console.log('nextClick:', 'layer', layer, 'step', step);
    const { sendData } = this.props;

    clearTimeout(timeout);

    let currentStep = step;
    let currentLayer = layer;

    // Temp - Uncomment for non-arduino testing
    // Simulate successful end of layer
    // if (currentStep === 2) {
    //   console.log('DEV- skipping to next step');
    //   this.setState({
    //     step: 4,
    //   });
    //   return;
    // }

    if (invalidPulse) {
      console.log('invalidPulse - restarting to step 2');
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
      if (currentLayer === 4) {
        currentLayer = 0;
        currentStep = 0;
      }
    }

    this.setState({
      invalidPulse: false,
      layer: currentLayer,
      step: currentStep,
      timeout: setTimeout(() => window.reload(false), 90000),
    });
  }

  pingArduino() {
    const { sendData } = this.props;
    const { pingArduinoStatus } = this.state;

    if (pingArduinoStatus) this.refreshPorts();
    this.setState({ pingArduinoStatus: true });
    sendData(WAKE_ARDUINO);

    this.setState({ handshake: true }); // DEV - Uncomment this line to skip the handshake

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
      graphing, handshake, invalidPulse, layer, step, pressure,
    } = this.state;

    if (!handshake) {
      return (
        <Fragment>
          <Container>
            <div id="loading">
              <Wave effect="fadeOut" text="Loading..." />
            </div>
          </Container>
        </Fragment>
      );
    }

    const spinnerVisibilityClass = (graphing) ? 'spinner-container' : 'd-none spinner-container';
    const actionButtonVisibilityClass = (graphing || invalidPulse || step === -1) ? 'd-none next-btn' : 'next-btn';
    const errorButtonVisibilityClass = (!invalidPulse) ? 'd-none next-btn' : 'next-btn';

    const artboard = () => {
      // TODO - Need to determine appropriate steps to include in "fullscreen button" conditional
      // Might only be doable while testing with real Arduino
      const useFsClickCallback = (step < 3 || step > 3);
      const fsClickCallback = useFsClickCallback ? () => this.nextClick() : null;

      if (layer === 0 && step === -1) {
        return (
          <Button className="attract-btn p-0" onClick={() => this.nextClick()}>
            <div className="x" id="attractContainer">
              <img
                alt="Start Button"
                className="y"
                src="/images/AttractScreen_Illu-01.png"
              />
            </div>
          </Button>
        );
      }

      return (
        // eslint-disable-next-line max-len
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className="fs-wrapper" onClick={fsClickCallback}>
          <img alt="Artboard" className="artboard" src={this.getArtboard()} />
        </div>
      );
    };

    return (
      <Fragment>
        <Container>
          <p className="d-none" id="layerInfo">
            Layer:
            {' '}
            {layer}
          </p>
          <p className="d-none" id="stepInfo">
            Step:
            {' '}
            {step}
          </p>
          {artboard()}
          <Button
            className={actionButtonVisibilityClass}
            color="primary"
            onClick={() => this.nextClick()}
          >
            <img alt="Action Button" src="/images/YellowButton-01.png" />
          </Button>
          <Button
            className={errorButtonVisibilityClass}
            color="primary"
            onClick={() => this.nextClick()}
          >
            <img alt="Error Button" src="/images/RedButton-01.png" />
          </Button>
          <div className={spinnerVisibilityClass}>
            <img
              alt="Drill Animation"
              id="drillAnimation"
              src="/images/DrillBit.gif"
            />
          </div>
          <PeriodicGraph
            graphing={graphing}
            gridColor="rgb(255, 255, 255)"
            label="Sampled Pulses"
            pressure={parseInt(pressure, 0)}
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
