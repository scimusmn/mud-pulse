/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import {
  Button,
} from 'reactstrap';
import propTypes from 'prop-types';
import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import withSerialCommunication from '../Serial/SerialHOC';

class ButtonTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: [],
    };

    this.onData = this.onData.bind(this);
    this.resetGraph = this.resetGraph.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);
    document.addEventListener('keydown', this.handleReset);
    // this.checkHandshake();
  }

  onData(data) {
    const { input } = this.state;
    const press = [moment(moment.now()).format('h:mm:s'), data];
    input.push(press);

    this.setState({
      input,
    });
  }

  stupidFunction() {
    const { sendData } = this.props;
    sendData();
  }

  resetGraph() {
    this.setState({
      input: [],
    });
  }

  render() {
    const { input } = this.state;
    const labels = [];
    const values = [];

    /* eslint array-callback-return: 0 */
    input.map((buttonPress) => {
      if (buttonPress.length > 0) {
        labels.push(buttonPress[0]);
        values.push(buttonPress[1].value);
      }
    });

    const dummyData = {
      labels,
      datasets: [{
        label: 'Dataset',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: values,
      }],
    };

    return (
      <Fragment>
        <Bar data={dummyData} />
        <Button
          color="danger"
          onClick={this.resetGraph}
        >
          Reset Graph
        </Button>
      </Fragment>
    );
  }
}

ButtonTime.propTypes = {
  sendData: propTypes.func.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
};

const ButtonTimeWithSerialCommunication = withSerialCommunication(ButtonTime);

export default ButtonTimeWithSerialCommunication;
