import React, { Component } from 'react';
import './App.css';
import ButtonTimeWithSerialCommunication from '../Graph/ButtonTime';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <ButtonTimeWithSerialCommunication />
    );
  }
}
