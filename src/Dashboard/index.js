import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import './index.css';
import {
  congratsMsg, introMsg, invalidMsg, pulseCountMsg,
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
      const {
        invalidPulse, resetMessage, round, strata,
      } = this.props;

      const message = [];

      if (resetMessage) {
        message.push(congratsMsg());
      } else {
        if (round === 0 || invalidPulse) {
          if (!invalidPulse) {
            message.push(introMsg());
          } else {
            message.push(invalidMsg());
          }
        }

        message.push(pulseCountMsg(strata));
      }

      return message;
    };

    return (
      <Fragment>
        <div id="dashboard" className="h-100 px-2 text-center">
          {getCopy()}
        </div>
      </Fragment>
    );
  }
}

Dashboard.propTypes = {
  invalidPulse: propTypes.bool.isRequired,
  resetMessage: propTypes.bool.isRequired,
  round: propTypes.number.isRequired,
  strata: propTypes.number.isRequired,
};

export default Dashboard;
