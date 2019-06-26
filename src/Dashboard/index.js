import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import './index.css';
import withSerialCommunication from '../Serial/SerialHOC';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rock: '',
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
      let rock = '';
      switch (data.value) {
        case 2:
          rock = 'Limestone';
          break;
        case 3:
          rock = 'Dolomite';
          break;
        case 4:
          rock = 'Shale';
          break;
        case 5:
          rock = 'Sandstone';
          break;
        default:
          break;
      }

      if (rock !== '') {
        this.updatePulse(rock);
      }
    }
  }

  updatePulse(rock) {
    this.setState({
      rock,
    });
  }

  render() {
    /* eslint arrow-body-style: 0 */
    const rockElement = () => {
      const { rock } = this.state;
      if (rock !== '') {
        return (
          rock
        );
      }

      return ('Nothing yet');
    };

    return (
      <Fragment>
        <div id="dashboard">
          {rockElement()}
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
