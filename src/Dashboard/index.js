import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import './index.css';
import {
  pulseCount, congrats,
} from './messages';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    // this.generateRandomStrata = this.generateRandomStrata.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleReset);
  }

  generateRandomStrata() {
    const { rounds } = this.state;

    // Generates a random integer from 2 to 5
    let randomStrata = Math.floor(Math.random() * 4) + 2;
    if (randomStrata === 4 && rounds !== 3) {
      randomStrata = 5;
    } else if (rounds === 2) {
      randomStrata = 4;
    }

    return randomStrata;
  }

  render() {
    const getCopy = () => {
      const { resetMessage, round, strata } = this.props;

      let descriptor = '';
      switch (round) {
        case 0:
          descriptor = 'first';
          break;
        case 1:
          descriptor = 'second';
          break;
        case 2:
          descriptor = 'third';
          break;
        default:
          break;
      }

      if (resetMessage) {
        return congrats();
      }

      return pulseCount(strata, descriptor);
    };

    return (
      <Fragment>
        <div id="dashboard" className="h-100 px-2">
          <h2 className="text-center">
            <span role="img" aria-label="exclamation">❗</span>
            <u>Objective</u>
            <span role="img" aria-label="exclamation">❗</span>
          </h2>
          {getCopy()}
        </div>
      </Fragment>
    );
  }
}

Dashboard.propTypes = {
  resetMessage: propTypes.bool.isRequired,
  round: propTypes.number.isRequired,
  strata: propTypes.number.isRequired,
};

export default Dashboard;
