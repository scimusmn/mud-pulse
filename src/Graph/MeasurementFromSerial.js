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

class MeasurementFromSerial extends Component {
  constructor(props) {
    super(props);

    this.state = {
      backgroundColor: props.backgroundColor,
      borderColor: props.borderColor,
      chartData: [],
      chartLabels: [],
      newData: {},
      label: props.label,
      message: props.message,
      realtime: props.realtime,
      type: props.type,
    };

    this.clearNewData = this.clearNewData.bind(this);
    this.getNewData = this.getNewData.bind(this);
    this.onData = this.onData.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.resetGraph = this.resetGraph.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);
    document.addEventListener('keydown', this.handleReset);
  }

  shouldComponentUpdate() {
    const { realtime } = this.state;
    return !realtime;
  }

  onData(data) {
    const { message, realtime } = this.state;

    if (data.message === message) {
      if (realtime) {
        const newData = {
          x: Date.now(),
          y: data.value,
        };

        this.setState(prevState => ({
          chartData: prevState.chartData.concat(data.value),
          chartLabels: prevState.chartLabels.concat(Date.now()),
          newData,
        }));
      } else {
        this.setState(prevState => ({
          chartData: prevState.chartData.concat(data.value),
          chartLabels: prevState.chartLabels.concat(moment(moment.now()).format('h:mm:s')),
        }));
      }
    }
  }

  getNewData() {
    const { newData } = this.state;
    return newData;
  }

  getChartOptions() {
    /* eslint prefer-const: 0 */
    const { realtime } = this.state;

    let chartOptions = {
      maintainAspectRatio: false,
      plugins: {},
      layout: {
        padding: {
          right: 0,
        },
      },
      scales: {
        xAxes: [],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
      spanGaps: true,
    };

    if (realtime) {
      chartOptions.plugins = {
        streaming: {
          afterUpdate: this.afterUpdate,
          delay: 0,
          duration: 5000,
          frameRate: 30,
          onRefresh: this.refreshData,
          refresh: 50,
          ttl: 5000,
        },
      };
      chartOptions.scales.xAxes.push({ type: 'realtime' });
      chartOptions.spanGaps = true;
    }

    return chartOptions;
  }

  clearNewData() {
    this.setState({
      newData: {},
    });
  }

  refreshData(chart) {
    // console.log(chart.data.datasets[0].data.length);
    const newData = this.getNewData();

    chart.data.datasets[0].data.push({
      // Subtracting a number from x, is a hacky way to move data to the center of the graph
      // TODO: Need to find an elegant way to handle this
      x: newData.x,
      y: newData.y,
    });

    chart.update({
      preservation: true,
    });

    this.clearNewData();
  }

  resetGraph() {
    this.setState({
      chartData: [],
      chartLabels: [],
      newData: {},
    });
  }

  render() {
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

MeasurementFromSerial.propTypes = {
  backgroundColor: propTypes.string,
  borderColor: propTypes.string,
  label: propTypes.string.isRequired,
  message: propTypes.string.isRequired,
  realtime: propTypes.bool,
  setOnDataCallback: propTypes.func.isRequired,
  type: propTypes.string,
};

MeasurementFromSerial.defaultProps = {
  backgroundColor: 'rgb(255, 99, 132)',
  borderColor: 'rgb(255, 99, 132)',
  realtime: false,
  type: 'bar',
};

const MeasurementFromSerialCommunication = withSerialCommunication(MeasurementFromSerial);

export default MeasurementFromSerialCommunication;
