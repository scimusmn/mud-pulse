import PropTypes from 'prop-types';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Interface from '../Interface';
import NoMatch from '../NoMatch';

const Routes = ({ fullscreen }) => (
  <Switch>
    <Route exact path="/" component={Interface} fullscreen={fullscreen} />
    <Route component={NoMatch} />
  </Switch>
);

Routes.propTypes = {
  fullscreen: PropTypes.bool,
};

Routes.defaultProps = {
  fullscreen: false,
};

export default Routes;
