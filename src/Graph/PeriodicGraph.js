/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import ChartComponent from 'react-chartjs-2';
import 'chartjs-plugin-streaming';

class PeriodicGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: props.backgroundColor,
      borderColor: props.borderColor,
      gridColor: props.gridColor,
      pressure: props.pressure,
      type: props.type,
      yMax: props.yMax,
      yMin: props.yMin,
      graphing: props.graphing,
    };

    this.chartReference = {};

    this.resetGraph = this.resetGraph.bind(this);
  }

  static getDerivedStateFromProps(props) {
    return { graphing: props.graphing, pressure: props.pressure };
  }

  shouldComponentUpdate() {
    return true;
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

  updateGraphData(pressure) {
    this.chartReference.chartInstance.config.data.datasets[0].data.push({
      x: Date.now(),
      y: pressure,
    });

    this.chartReference.chartInstance.update({
      preservation: true,
    });
  }

  resetGraph() {
    this.chartReference.chartInstance.config.data.datasets[0].data = [];
    this.chartReference.chartInstance.update();
  }

  render() {
    const {
      backgroundColor, borderColor, type, graphing, pressure,
    } = this.state;

    if (this.chartReference.chartInstance && graphing) {
      this.updateGraphData(pressure);
      this.chartReference.chartInstance.config.options.plugins.streaming.pause = false;
    }
    if (this.chartReference.chartInstance && !graphing) {
      this.chartReference.chartInstance.config.options.plugins.streaming.pause = true;
      this.resetGraph();
    }

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
  pressure: propTypes.number.isRequired,
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

export default PeriodicGraph;
