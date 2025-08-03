import React from 'react';
import './Spinner.css';
import logo from '../../logo.svg'; 

const Spinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <img src={logo} alt="ReteamNow Logo" className="logo" />
    </div>
  );
};

export default Spinner;
