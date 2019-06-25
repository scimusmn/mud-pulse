/**
 * Loading spinner
 *
 * We delay the display of the spinner for a 1/4 sec. so that it doesn't
 * constantly flash between every page transition.
 *
 * Spinner style ensures that it will cover the entire screen and
 * display in the center of the window.
 */
import React from 'react';
import Delay from 'react-delay';
import Spinner from './Spinner';

const Loading = () => (
  <Delay
    wait={250}
  >
    <Spinner />
  </Delay>
);

export default Loading;
