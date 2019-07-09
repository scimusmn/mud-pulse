import React, { Fragment } from 'react';
import {
  Jumbotron,
} from 'reactstrap';
import './index.css';

const Banner = () => (
  <Fragment>
    <Jumbotron id="banner" className="w-100 text-center py-0">
      <h1 id="bannerHeader" className="mb-0">Mud Pulse Telemetry!</h1>
    </Jumbotron>
  </Fragment>
);

export default Banner;
