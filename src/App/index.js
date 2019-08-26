//
// Top level App component
//
// Load the primary Apollo GraphQL client
// Define the main App router component and load top level universal styles
// Direct all routes to user authentication component
//
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from '../Routes';

const App = () => (
  <BrowserRouter>
    <Routes />
  </BrowserRouter>
);

export default App;
