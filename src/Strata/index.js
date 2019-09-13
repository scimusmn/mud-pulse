import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import './index.css';

class Strata extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleReset);
  }

  render() {
    const { strata } = this.props;

    return (
      <Fragment>
        <div id="strataDisplay" className="px-2 text-center">
          <h2>
            <u>Last Verified Strata</u>
          </h2>
          {strata}
        </div>
      </Fragment>
    );
  }
}

Strata.propTypes = {
  strata: propTypes.string.isRequired,
};

export default Strata;
