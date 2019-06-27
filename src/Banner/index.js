import React, { Fragment } from 'react';
import {
  Jumbotron,
} from 'reactstrap';
import './index.css';

const Banner = () => (
  <Fragment>
    <Jumbotron id="banner" className="w-100 text-center">
      <h1 id="bannerHeader">Mud Pulse Telemetry!</h1>
    </Jumbotron>
  </Fragment>
);

export default Banner;
