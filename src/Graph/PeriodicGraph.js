/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
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
      newData: {},
      sampling: false,
      type: props.type,
      yMax: props.yMax,
      yMin: props.yMin,
    };

    this.clearNewData = this.clearNewData.bind(this);
    this.getNewData = this.getNewData.bind(this);
    this.onSerialData = this.onSerialData.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.onSerialData = this.onSerialData.bind(this);
    this.resetGraph = this.resetGraph.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
  }

  shouldComponentUpdate() {
    const { sampling } = this.state;
    return sampling;
  }

  onSerialData(data) {
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

    if (data.message === message && sampling) {
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

    if (data.message === message && sampling) {
      this.setState(prevState => ({
        chartData: prevState.chartData.concat(data.value),
        chartLabels: prevState.chartLabels.concat(moment(moment.now()).format('h:mm:s')),
      }));
    }
  }

  getChartOptions() {
    const { sampling, yMax, yMin } = this.state;
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
          afterUpdate: this.afterUpdate,
          delay: 0,
          duration: 5000,
          frameRate: 20,
          onRefresh: this.refreshData,
          pause: !sampling,
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

  getNewData() {
    const { newData } = this.state;
    return newData;
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
        data: chartData,
        label,
        lineTension: 0,
        pointRadius: 0,
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
