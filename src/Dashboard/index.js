import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import './index.css';
import { strata1, strata2, strata3 } from './messages';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      instruction: strata1(),
      rock: '',
      status: 'waiting',
    };

    this.onSerialData = this.onSerialData.bind(this);
    this.updatePulse = this.updatePulse.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
  }

  onSerialData(data) {
    if (data.message === 'material') {
      let instruction = '';
      switch (data.value) {
        case 2:
          instruction = strata2();
          break;
        case 3:
          instruction = strata3();
          break;
        case 4:
          instruction = strata3();
          break;
        case 5:
          // ???
          instruction = strata1();
          break;
        default:
          // ???
          instruction = strata1();
          break;
      }

      this.setState({
        instruction,
      });
    }

    if (data.message === 'button-press') {
      this.setState({
        status: 'graphing',
      });
    }

    if (data.message === 'material') {
      let rock = '';
      switch (data.value) {
        case 2:
          rock = 'You\'ve hit Limestone!';
          break;
        case 3:
          rock = 'You\'ve hit Dolomite!';
          break;
        case 4:
          rock = 'You\'ve hit Shale!';
          break;
        case 5:
          rock = 'You\'ve hit Sandstone!';
          break;
        default:
          rock = 'Invalid pulse information. Please try again!';
          break;
      }

      this.updatePulse(rock);
    }

    // Ending sampling
    if (data.message === 'time-up') {
      this.setState({
        status: 'waiting',
      });
    }
  }

  updatePulse(rock) {
    this.setState({
      rock,
    });
  }

  render() {
    /* eslint arrow-body-style: 0 */
    const instructionText = () => {
      const { instruction } = this.state;
      return instruction;
    };

    const rockElement = () => {
      const { rock, status } = this.state;
      if (status === 'graphing') {
        return (
          'Sensing...'
        );
      }

      if (rock !== '') {
        return (
          rock
        );
      }

      return ('Nothing yet');
    };

    const dashboardStatus = () => {
      /* eslint prefer-const: 0 */
      const { status } = this.state;
      let statusMessage = '';

      switch (status) {
        case 'graphing':
          statusMessage = 'Graphing...';
          break;
        case 'waiting':
          statusMessage = 'Click the button to begin detection.';
          break;
        default:
          break;
      }

      return (
        statusMessage
      );
    };

    return (
      <Fragment>
        <div id="dashboard" className="px-2 py-2">
          <h2>{instructionText()}</h2>
          <h3>{dashboardStatus()}</h3>
          <h4>{rockElement()}</h4>
        </div>
      </Fragment>
    );
  }
}

Dashboard.propTypes = {
  setOnDataCallback: propTypes.func.isRequired,
};

const DashboardWithSerialCommunication = withSerialCommunication(Dashboard);
export default DashboardWithSerialCommunication;
