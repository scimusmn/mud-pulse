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
      status: 'waiting',
    };

    this.onSerialData = this.onSerialData.bind(this);
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

    // Ending sampling
    if (data.message === 'time-up') {
      this.setState({
        status: 'waiting',
      });
    }
  }

  render() {
    /* eslint arrow-body-style: 0 */
    const instructionText = () => {
      const { instruction } = this.state;
      return instruction;
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

    console.log(dashboardStatus());

    return (
      <Fragment>
        <div id="dashboard" className="h-100 px-2">
          <h2 className="text-center">
            <span role="img" aria-label="exclamation">❗</span>
            <u>Objective</u>
            <span role="img" aria-label="exclamation">❗</span>
          </h2>
          {instructionText()}
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
