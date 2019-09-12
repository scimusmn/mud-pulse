import React, { Fragment } from 'react';

/* eslint react/jsx-one-expression-per-line: 0 */
export const pulseCount = (pulseMsgCount, pulseMsgDescriptor) => (

  <Fragment>
    <h4 className="mb-5">
      You have reached the {pulseMsgDescriptor} strata.
    </h4>
    <h4 className="mb-5">
      Press the start button and squeeze the tube {pulseMsgCount} times to send your message.
    </h4>
    {/* <h4>Watch the message screen to see which strata you’ve reached.</h4> */}
  </Fragment>
);

export const congrats = () => (
  <Fragment>
    <h4 className="mb-5">Congratulations, you’ve reached the shale strata! Now the oil can be extracted.</h4>
  </Fragment>
);
