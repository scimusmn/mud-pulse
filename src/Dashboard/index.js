import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import './index.css';
import {
  pulseCountTwo, pulseCountThree, pulseCountFour, pulseCountFive, congrats,
} from './messages';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anticipatedStrata: 5,
      instruction: pulseCountFive(),
      rounds: 1,
      status: 'waiting',
    };

    this.generateRandomStrata = this.generateRandomStrata.bind(this);
    this.onSerialData = this.onSerialData.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
  }

  onSerialData(data) {
    if (data.message === 'material') {
      const { anticipatedStrata, rounds } = this.state;

      if (data.value === anticipatedStrata) {
        const randomStrata = this.generateRandomStrata();

        let roundCount = 0;
        if (rounds === 2) {
          roundCount = 1;
        } else {
          roundCount = rounds + 1;
        }

        let instruction = '';
        switch (randomStrata) {
          case 2:
            instruction = pulseCountTwo();
            break;
          case 3:
            instruction = pulseCountThree();
            break;
          case 4:
            instruction = pulseCountFour();
            break;
          case 5:
            instruction = pulseCountFive();
            break;
          default:
            instruction = pulseCountTwo();
            break;
        }

        if (anticipatedStrata === 4) {
          instruction = congrats();
        }

        this.setState({
          anticipatedStrata: randomStrata,
          instruction,
          rounds: roundCount,
        });
      } else {
        // TODO: Handle messaging for when user does wrong pulse count
      }
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

  generateRandomStrata() {
    const { rounds } = this.state;

    // Generates a random integer from 2 to 5
    let randomStrata = Math.floor(Math.random() * 4) + 2;
    if (randomStrata === 4 && rounds !== 3) {
      randomStrata = 5;
    } else if (rounds === 2) {
      randomStrata = 4;
    }

    return randomStrata;
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
