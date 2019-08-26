import React, { Component, Fragment } from 'react';
import propTypes from 'prop-types';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';
import bkg1 from './images/Illustration_GTS-01.jpg';
import bkg2 from './images/Illustration_GTS-02.jpg';
import bkg3 from './images/Illustration_GTS-04.jpg';
import { strata1, strata2, strata3 } from './messages';

class Flipbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: bkg1,
      text: strata1(),
    };

    this.onSerialData = this.onSerialData.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onSerialData);
    document.addEventListener('keydown', this.handleReset);
  }

  onSerialData(data) {
    if (data.message === 'material') {
      switch (data.value) {
        case 2:
          this.setState({
            image: bkg2,
            text: strata2(),
          });
          break;
        case 3:
          this.setState({
            image: bkg3,
            text: strata3(),
          });
          break;
        case 4:
          this.setState({
            image: bkg3,
            text: strata3(),
          });
          break;
        case 5:
          // ???
          this.setState({
            image: bkg1,
            text: strata1(),
          });
          break;
        default:
          // ???
          this.setState({
            image: bkg1,
            text: strata1(),
          });
          break;
      }
    }
  }

  render() {
    const { image, text } = this.state;

    return (
      <Fragment>
        <div className="px-2 py-2">
          <div className="w-100">
            <img src={image} className="d-inline-block w-75" alt="lol" />
            <div className="d-inline-block w-25">
              <div className="px-3 text-light">{text}</div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

Flipbook.propTypes = {
  setOnDataCallback: propTypes.func.isRequired,
};

const FlipbookWithSerialCommunication = withSerialCommunication(Flipbook);
export default FlipbookWithSerialCommunication;
