/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import {
  Button,
} from 'reactstrap';
import propTypes from 'prop-types';
import ChartComponent from 'react-chartjs-2';
import 'chartjs-plugin-streaming';
import withSerialCommunication from '../Serial/SerialHOC';

class RealtimeGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      backgroundColor: props.backgroundColor,
      borderColor: props.borderColor,
      chartData: [],
      chartLabels: [],
      label: props.label,
      message: props.message,
      newData: {},
      type: props.type,
      yMax: props.yMax,
      yMin: props.yMin,
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
    return false;
  }

  onData(data) {
    const { message } = this.state;

    if (data.message === message) {
      const newData = {
        x: Date.now(),
        y: data.value,
      };

      this.setState(prevState => ({
        chartData: prevState.chartData.concat(data.value),
        chartLabels: prevState.chartLabels.concat(Date.now()),
        newData,
      }));
    }
  }

  getNewData() {
    const { newData } = this.state;
    return newData;
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
      plugins: {
        streaming: {
          afterUpdate: this.afterUpdate,
          delay: 0,
          duration: 5000,
          frameRate: 20,
          onRefresh: this.refreshData,
          refresh: 100,
          ttl: 5000,
        },
      },
      scales: {
        xAxes: [
          {
            type: 'realtime',
          },
        ],
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

  clearNewData() {
    this.setState({
      newData: {},
    });
  }

  refreshData(chart) {
    const newData = this.getNewData();

    chart.data.datasets[0].data.push({
      // Subtracting a number from x, is a hacky way to move data
      // to the center of the graph, if we need it

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

RealtimeGraph.propTypes = {
  backgroundColor: propTypes.string,
  borderColor: propTypes.string,
  label: propTypes.string.isRequired,
  message: propTypes.string.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
  type: propTypes.string,
  yMax: propTypes.number,
  yMin: propTypes.number,
};

RealtimeGraph.defaultProps = {
  backgroundColor: 'rgb(255, 99, 132)',
  borderColor: 'rgb(255, 99, 132)',
  type: 'bar',
  yMax: 1,
  yMin: 0,
};

const RealtimeGraphWithSerialCommunication = withSerialCommunication(RealtimeGraph);

export default RealtimeGraphWithSerialCommunication;
