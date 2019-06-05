/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import {
  Button,
} from 'reactstrap';
import propTypes from 'prop-types';
import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import withSerialCommunication from '../Serial/SerialHOC';

class MeasurementFromSerial extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: [],
      label: props.label,
      message: props.message,
    };

    this.onData = this.onData.bind(this);
    this.resetGraph = this.resetGraph.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);
    document.addEventListener('keydown', this.handleReset);
  }

  onData(data) {
    const { input, message } = this.state;

    if (data.message === message) {
      const change = [moment(moment.now()).format('h:mm:s'), data];
      input.push(change);

      this.setState({
        input,
      });
    }
  }

  resetGraph() {
    this.setState({
      input: [],
    });
  }

  render() {
    const { input, label } = this.state;
    const labels = [];
    const values = [];

    /* eslint array-callback-return: 0 */
    input.map((measurement) => {
      if (measurement.length > 0) {
        labels.push(measurement[0]);
        values.push(measurement[1].value);
      }
    });

    const graphData = {
      labels,
      datasets: [{
        label,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: values,
      }],
      maintainAspectRatio: false,
    };

    return (
      <Fragment>
        <Bar
          data={graphData}
          options={{ maintainAspectRatio: false }}
        />
        <Button
          color="primary"
          onClick={this.resetGraph}
        >
          Reset Graph
        </Button>
      </Fragment>
    );
  }
}

MeasurementFromSerial.propTypes = {
  label: propTypes.string.isRequired,
  message: propTypes.string.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
};

const MeasurementFromSerialCommunication = withSerialCommunication(MeasurementFromSerial);

export default MeasurementFromSerialCommunication;
