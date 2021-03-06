/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import ChartComponent from 'react-chartjs-2';
import 'chartjs-plugin-streaming';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';

class PeriodicGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      backgroundColor: props.backgroundColor,
      borderColor: props.borderColor,
      gridColor: props.gridColor,
      message: props.message,
      type: props.type,
      yMax: props.yMax,
      yMin: props.yMin,
      graphing: props.graphing,
    };

    this.chartReference = {};

    this.onSerialData = this.onSerialData.bind(this);
    this.resetGraph = this.resetGraph.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
  }

  static getDerivedStateFromProps(props) {
    return { graphing: props.graphing };
  }

  shouldComponentUpdate() {
    return true;
  }

  onSerialData(data) {
    const { message, graphing } = this.state;

    if (graphing) {
      if (this.chartReference.chartInstance.config.options.plugins.streaming.pause) {
        this.resetGraph();
      }

      this.chartReference.chartInstance.config.options.plugins.streaming.pause = false;
    }

    if (data.message === 'time-up') {
      this.chartReference.chartInstance.config.options.plugins.streaming.pause = true;
      // this.setState({ graphing: false });
    }

    if (data.message === message
      && !this.chartReference.chartInstance.config.options.plugins.streaming.pause) {
      this.chartReference.chartInstance.config.data.datasets[0].data.push({
        x: Date.now(),
        y: data.value,
      });

      this.chartReference.chartInstance.update({
        preservation: true,
      });
    }
  }

  getChartOptions() {
    const { gridColor, yMax, yMin } = this.state;
    const chartOptions = {
      animation: {
        duration: 0,
      },
      hover: {
        animationDuration: 0,
      },
      legend: {
        display: false,
      },
      maintainAspectRatio: false,
      responsiveAnimationDuration: 0,
      plugins: {
        streaming: {
          delay: 0,
          duration: 5000,
          frameRate: 20,
          pause: false,
          refresh: 100,
          ttl: 5000,
        },
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              color: gridColor,
            },
            ticks: {
              display: false,
            },
            type: 'realtime',
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: gridColor,
            },
            ticks: {
              display: false,
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
    this.chartReference.chartInstance.config.data.datasets[0].data = [];
    this.chartReference.chartInstance.update();
  }

  render() {
    const {
      backgroundColor, borderColor, type, graphing,
    } = this.state;

    const graphClass = (graphing) ? 'chart-wrapper' : 'chart-wrapper d-none';
    const graphData = {
      datasets: [{
        backgroundColor,
        borderColor,
        borderWidth: 1,
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }],
    };

    return (
      <Fragment>
        <div className={graphClass}>
          <ChartComponent
            data={graphData}
            options={this.getChartOptions()}
            ref={(reference) => { this.chartReference = reference; }}
            type={type}
          />
        </div>
      </Fragment>
    );
  }
}

PeriodicGraph.propTypes = {
  backgroundColor: propTypes.string,
  borderColor: propTypes.string,
  gridColor: propTypes.string,
  message: propTypes.string.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
  graphing: propTypes.bool.isRequired,
  type: propTypes.string,
  yMax: propTypes.number,
  yMin: propTypes.number,
};

PeriodicGraph.defaultProps = {
  backgroundColor: 'rgb(255, 99, 132)',
  borderColor: 'rgb(255, 99, 132)',
  gridColor: 'rgb(0, 0, 0)',
  type: 'bar',
  yMax: 1,
  yMin: 0,
};

const PeriodicGraphWithSerialCommunication = withSerialCommunication(PeriodicGraph);

export default PeriodicGraphWithSerialCommunication;
