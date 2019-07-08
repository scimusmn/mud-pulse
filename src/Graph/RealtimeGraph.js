/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import ChartComponent from 'react-chartjs-2';
import 'chartjs-plugin-streaming';
import withSerialCommunication from '../Serial/SerialHOC';

class RealtimeGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      borderColor: props.borderColor,
      chartData: [],
      chartLabels: [],
      gridColor: props.gridColor,
      message: props.message,
      newData: {},
      type: props.type,
      yMax: props.yMax,
      yMin: props.yMin,
    };

    this.clearNewData = this.clearNewData.bind(this);
    this.getNewData = this.getNewData.bind(this);
    this.onSerialData = this.onSerialData.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.resetGraph = this.resetGraph.bind(this);
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
          afterUpdate: this.afterUpdate,
          delay: 0,
          duration: 5000,
          frameRate: 20,
          onRefresh: this.refreshData,
          // pause: true,
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
      borderColor,
      chartData,
      chartLabels,
      type,
    } = this.state;

    const graphData = {
      datasets: [{
        borderColor,
        borderWidth: 1,
        data: chartData,
        fill: false,
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
