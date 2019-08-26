/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import ChartComponent from 'react-chartjs-2';
import 'chartjs-plugin-streaming';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';

class RealtimeGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      borderColor: props.borderColor,
      gridColor: props.gridColor,
      message: props.message,
      type: props.type,
      yMax: props.yMax,
      yMin: props.yMin,
    };

    this.chartReference = {};

    this.onSerialData = this.onSerialData.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
  }

  shouldComponentUpdate() {
    return false;
  }

  onSerialData(data) {
    const { message } = this.state;

    if (data.message === message) {
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
    const {
      gridColor, yMax, yMin,
    } = this.state;

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

  render() {
    const {
      borderColor,
      type,
    } = this.state;

    const graphData = {
      datasets: [{
        borderColor,
        borderWidth: 1,
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }],
    };

    /* eslint arrow-parens: 0 */
    /* eslint no-return-assign: 0 */

    return (
      <Fragment>
        <div className="chart-wrapper">
          <ChartComponent
            data={graphData}
            options={this.getChartOptions()}
            ref={(reference) => this.chartReference = reference}
            type={type}
          />
        </div>
      </Fragment>
    );
  }
}

RealtimeGraph.propTypes = {
  borderColor: propTypes.string,
  gridColor: propTypes.string,
  message: propTypes.string.isRequired,
  setOnDataCallback: propTypes.func.isRequired,
  type: propTypes.string,
  yMax: propTypes.number,
  yMin: propTypes.number,
};

RealtimeGraph.defaultProps = {
  borderColor: 'rgb(255, 99, 132)',
  gridColor: 'rgb(255, 99, 132)',
  type: 'bar',
  yMax: 1,
  yMin: 0,
};

const RealtimeGraphWithSerialCommunication = withSerialCommunication(RealtimeGraph);

export default RealtimeGraphWithSerialCommunication;
