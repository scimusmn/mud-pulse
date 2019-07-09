import React, { Component, Fragment } from 'react';
import {
  Card, Col, Container, Row,
} from 'reactstrap';
import propTypes from 'prop-types';
import './App.css';
import Loading from '../Loading';
import Banner from '../Banner';
import DashboardWithSerialCommunication from '../Dashboard';
import PeriodicGraphWithSerialCommunication from '../Graph/PeriodicGraph';
import RealtimeGraphWithSerialCommunication from '../Graph/RealtimeGraph';
import { ARDUINO_READY, WAKE_ARDUINO } from '../Serial/arduinoConstants';
import withSerialCommunication from '../Serial/SerialHOC';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      handshake: false,
    };

    this.checkHandshake = this.checkHandshake.bind(this);
    this.onSerialData = this.onSerialData.bind(this);
    this.updateHandshake = this.updateHandshake.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
    this.checkHandshake();
  }

  onSerialData(data) {
    const { handshake } = this.state;

    if (data.message === ARDUINO_READY.message && !handshake) {
      this.updateHandshake();
    }
  }

  checkHandshake() {
    const { sendData } = this.props;

    sendData(JSON.stringify(WAKE_ARDUINO));

    setTimeout(() => {
      this.checkHandshake();
    }, 5000);
  }

  updateHandshake() {
    this.setState({
      handshake: true,
    });
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
  sendData: propTypes.func.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
};

const AppWithSerialCommunication = withSerialCommunication(App);
export default AppWithSerialCommunication;
