/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import {
  Card, Col, Container, Row,
} from 'reactstrap';
import propTypes from 'prop-types';
import Loading from '../Loading';
import DashboardWithSerialCommunication from '../Dashboard';
import Flipbook from '../Flipbook';
import PeriodicGraphWithSerialCommunication from '../Graph/PeriodicGraph';
import { ARDUINO_READY, WAKE_ARDUINO } from '../Arduino/arduino-base/ReactSerial/arduinoConstants';
import IPC from '../Arduino/arduino-base/ReactSerial/IPCMessages';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      handshake: false,
      refreshPortCount: 0,
      pingArduinoStatus: false,
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
    const { restartIpcCommunication, sendData } = this.props;
    const { refreshPortCount } = this.state;

    if (refreshPortCount === 2) {
      this.setState({
        handshake: false,
      });

      console.log('sending RESET-PORT');
      sendData(IPC.RESET_PORTS_COMMAND);

      console.log('restarting ipcCommunication...');

      restartIpcCommunication();
    }

    this.setState(prevState => ({
      refreshPortCount: prevState.refreshPortCount + 1,
    }));
  }

  render() {
    const { handshake } = this.state;

    if (!handshake) {
      return (
        <Loading />
      );
    }

    return (
      <Fragment>
        <Container fluid className="h-100">
          <Row className="h-100">
            <Col md={7} className="h-100 px-0">
              <Flipbook />
            </Col>
            <Col md={5} className="h-100">
              <Row id="sampleRow">
                <Col md={12}>
                  <Card>
                    <DashboardWithSerialCommunication />
                  </Card>
                </Col>
                <Col md={12}>
                  <Card>
                    <PeriodicGraphWithSerialCommunication
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
  restartIpcCommunication: propTypes.func.isRequired,
  sendData: propTypes.func.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
};

const AppWithSerialCommunication = withSerialCommunication(App);
export default AppWithSerialCommunication;
