import React, { Fragment } from 'react';

export const strata1 = () => (
  <Fragment>
    <h4 className="mb-5">You are in the first strata. The drill operator has requested data.</h4>
    <h4 className="mb-5">Press the start button and squeeze the tube 5 times to send your message.</h4>
    {/* <h4>Watch the message screen to see which strata you’ve reached.</h4> */}
  </Fragment>
);

export const strata2 = () => (
  <Fragment>
    <h4 className="mb-5">You have reached the second strata.</h4>
    <h4 className="mb-5">Press the start button and squeeze the tube 3 times to send your message.</h4>
    {/* <h4>Watch the message screen to see which strata you’ve reached.</h4> */}
  </Fragment>
);

export const strata3 = () => (
  <Fragment>
    <h4 className="mb-5">You have reached the third strata.</h4>
    <h4 className="mb-5">Press the start button and squeeze the tube 4 times to send your message.</h4>
    {/* <h4>Watch the message screen to see which strata you’ve reached.</h4> */}
  </Fragment>
);

export const strata4 = () => (
  <Fragment>
    <h4 className="mb-5">Congratulations!</h4>
    <h4 className="mb-5">You’ve reached the shale strata.</h4>
    <h4>Now the oil can be extracted.</h4>
  </Fragment>
);
