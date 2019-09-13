import React, { Fragment } from 'react';

/* eslint react/jsx-one-expression-per-line: 0 */

export const congratsMsg = () => (
  <Fragment>
    <p className="mb-3">
      Congratulations, you’ve reached the shale strata! Now the oil can be extracted.
    </p>
  </Fragment>
);

export const introMsg = () => (
  <Fragment>
    <p className="mb-3">
      You are a drill on a mission to get oil. Operators have requested data on your location.
    </p>
  </Fragment>
);

export const invalidMsg = () => (
  <Fragment>
    <p className="mb-3">
      The operators have received a corrupted data transmission. Please try again.
    </p>
  </Fragment>
);

export const pulseCountMsg = pulseMsgCount => (
  <Fragment>
    <p>
      Press the start button and squeeze the tube {pulseMsgCount} times to send your message.
      Watch the message screen to see which strata you’ve reached.
    </p>
  </Fragment>
);
