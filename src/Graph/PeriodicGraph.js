/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import {
  Button,
} from 'reactstrap';
import propTypes from 'prop-types';
import moment from 'moment';
import ChartComponent from 'react-chartjs-2';
import 'chartjs-plugin-streaming';
import withSerialCommunication from '../Serial/SerialHOC';

class PeriodicGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      backgroundColor: props.backgroundColor,
      borderColor: props.borderColor,
      chartData: [],
      chartLabels: [],
      label: props.label,
      message: props.message,
      sampling: false,
      type: props.type,
      yMax: props.yMax,
      yMin: props.yMin,
    };

    this.onData = this.onData.bind(this);
    this.resetGraph = this.resetGraph.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);
    document.addEventListener('keydown', this.handleReset);
  }

  shouldComponentUpdate() {
    const { sampling } = this.state;
    return sampling;
  }

  onData(data) {
    const { message, sampling } = this.state;

    if (data.message === 'button-press') {
      this.resetGraph();
      this.setState({
        sampling: true,
      });
    }

    // Ending sampling
    if (data.message === 'time-up') {
      this.setState({
        sampling: false,
      });
    }

    // Getting Material
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
        console.log(`You've hit ${rock}!`);
      }
    }

    if (data.message === message && sampling) {
      this.setState(prevState => ({
        chartData: prevState.chartData.concat(data.value),
        chartLabels: prevState.chartLabels.concat(moment(moment.now()).format('h:mm:s')),
      }));
    }
  }

  getChartOptions() {
    /* eslint prefer-const: 0 */
    const { yMax, yMin } = this.state;

    let chartOptions = {
      animations: {
        duration: 0,
      },
      hover: {
        animationDuration: 0,
      },
      maintainAspectRatio: false,
      responsiveAnimationDuration: 0,
      plugins: {},
      scales: {
        xAxes: [],
        yAxes: [
          {
            ticks: {
              max: yMax,
              min: yMin,
              stepSize: 200,
            },
          },
        ],
      },
      spanGaps: true,
    };

    return chartOptions;
  }

  resetGraph() {
    this.setState({
      chartData: [],
      chartLabels: [],
    });
  }

  render() {
    /* eslint no-return-assign: 0 */
    const {
      backgroundColor,
      borderColor,
      chartData,
      chartLabels,
      label,
      type,
    } = this.state;

    const graphData = {
      datasets: [{
        backgroundColor,
        borderColor,
        label,
        lineTension: 0,
        data: chartData,
      }],
      labels: chartLabels,
    };

    return (
      <Fragment>
        <div className="chart-wrapper">
          <ChartComponent
            data={graphData}
            options={this.getChartOptions()}
            type={type}
          />
        </div>
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

PeriodicGraph.propTypes = {
  backgroundColor: propTypes.string,
  borderColor: propTypes.string,
  label: propTypes.string.isRequired,
  message: propTypes.string.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
  type: propTypes.string,
  yMax: propTypes.number,
  yMin: propTypes.number,
};

PeriodicGraph.defaultProps = {
  backgroundColor: 'rgb(255, 99, 132)',
  borderColor: 'rgb(255, 99, 132)',
  type: 'bar',
  yMax: 1,
  yMin: 0,
};

const PeriodicGraphWithSerialCommunication = withSerialCommunication(PeriodicGraph);

export default PeriodicGraphWithSerialCommunication;
