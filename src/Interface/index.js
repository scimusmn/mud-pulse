/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import {
  Card, CardTitle, Col, Container, Row,
} from 'reactstrap';
import propTypes from 'prop-types';
import './index.css';
import Loading from '../Loading';
import Strata from '../Strata';
import Dashboard from '../Dashboard';
import Flipbook from '../Flipbook';
import PeriodicGraphWithSerialCommunication from '../Graph/PeriodicGraph';
import { ARDUINO_READY, WAKE_ARDUINO } from '../Arduino/arduino-base/ReactSerial/arduinoConstants';
import IPC from '../Arduino/arduino-base/ReactSerial/IPCMessages';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anticipatedStrata: [5, 3, 4],
      graphing: false,
      handshake: false,
      refreshPortCount: 0,
      pingArduinoStatus: false,
      resetMessage: false,
      round: 0,
    };

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
    const { handshake } = this.state;

    if (data.message === ARDUINO_READY.message) {
      if (!handshake) {
        this.setState({
          handshake: true,
        });
      }

      this.setState({
        pingArduinoStatus: false,
        refreshPortCount: 0,
      });
    }

    if (data.message === 'material') {
      const { anticipatedStrata, round } = this.state;

      if (data.value === anticipatedStrata[round]) {
        if (round === 2) {
          this.setState({
            resetMessage: true,
            round: 0,
          });
        } else {
          this.setState({
            resetMessage: false,
            round: round + 1,
          });
        }
      }
    }

    // Handle end of graphing
    if (data.message === 'button-press') {
      this.setState({
        graphing: true,
      });
    }

    // Ending sampling
    if (data.message === 'time-up') {
      this.setState({
        graphing: false,
      });
    }
  }

  pingArduino() {
    const { sendData } = this.props;
    const { pingArduinoStatus } = this.state;

    if (pingArduinoStatus) {
      this.refreshPorts();
    }

    this.setState({
      pingArduinoStatus: true,
    });

    sendData(JSON.stringify(WAKE_ARDUINO));

    setTimeout(() => {
      this.pingArduino();
    }, 5000);
  }

  refreshPorts() {
    const { sendData, startIpcCommunication, stopIpcCommunication } = this.props;
    const { refreshPortCount } = this.state;

    if (refreshPortCount === 2) {
      this.setState({
        handshake: false,
      });

      console.log('sending RESET-PORT');
      sendData(IPC.RESET_PORTS_COMMAND);

      console.log('restarting ipcCommunication...');

      stopIpcCommunication();
      startIpcCommunication();
    }

    this.setState(prevState => ({
      refreshPortCount: prevState.refreshPortCount + 1,
    }));
  }

  render() {
    const {
      anticipatedStrata, graphing, handshake, resetMessage, round,
    } = this.state;

    if (!handshake) {
      return (
        <Loading />
      );
    }

    if (resetMessage) {
      setTimeout(() => {
        this.setState({
          resetMessage: false,
        });
      }, 10000);
    }

    return (
      <Fragment>
        <Container fluid className="h-100">
          <Row className="h-100">
            <Col md={7} className="h-100 px-0">
              <Flipbook
                graphing={graphing}
                resetMessage={resetMessage}
                round={round}
              />
            </Col>
            <Col md={5} className="h-100">
              <Row className="h-100 py-3">
                <Col md={12} className="align-self-start h-30">
                  <Strata />
                </Col>
                <Col md={12} className="align-self-middle h-30">
                  <Card className="h-100">
                    <Dashboard
                      resetMessage={resetMessage}
                      round={round}
                      strata={anticipatedStrata[round]}
                    />
                  </Card>
                </Col>
                <Col md={12} className="align-self-end">
                  <Card>
                    <CardTitle>
                      <h2 className="mb-0 text-center national">
                        <u>Pulse Analysis</u>
                      </h2>
                    </CardTitle>
                    <PeriodicGraphWithSerialCommunication
                      className="mb-3"
                      label="Sampled Pulses"
                      message="pressure-reading"
                      type="line"
                      yMax={1023}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
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
