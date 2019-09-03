/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import {
  Card, Col, Container, Row,
} from 'reactstrap';
import propTypes from 'prop-types';
import Loading from '../Loading';
import Banner from '../Banner';
import DashboardWithSerialCommunication from '../Dashboard';
import PeriodicGraphWithSerialCommunication from '../Graph/PeriodicGraph';
import RealtimeGraphWithSerialCommunication from '../Graph/RealtimeGraph';
import { ARDUINO_READY, WAKE_ARDUINO } from '../Arduino/arduino-base/ReactSerial/arduinoConstants';
import IPC from '../Arduino/arduino-base/ReactSerial/IPCMessages';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';
//
// const withSerialCommunication = require('../Arduino/arduino-base/ReactSerial/SerialHOC');

console.log(withSerialCommunication);

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
        <Container fluid>
          <Row>
            <Banner backgroundColor="#666" />
          </Row>
          <Row id="sampleRow">
            <Col md={6}>
              <Card>
                <PeriodicGraphWithSerialCommunication
                  label="Sampled Pulses"
                  message="pressure-reading"
                  type="line"
                  yMax={1023}
                />
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <DashboardWithSerialCommunication />
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <div id="scopeContainer" className="mx-auto my-5 px-3 py-3">
                <Container fluid>
                  <Row>
                    <h2 id="scopeName" className="px-3 py-1">MudPulse 2000XL</h2>
                  </Row>
                  <Row>
                    <Col md={9} className="px-0">
                      <div id="scopeGraph" className="py-3">
                        <RealtimeGraphWithSerialCommunication
                          borderColor="#FFFF00"
                          gridColor="#444"
                          message="pressure-reading"
                          type="line"
                          yMax={1023}
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <img className="mx-auto d-block" src="panel.png" alt="" />
                    </Col>
                  </Row>
                </Container>
              </div>
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
