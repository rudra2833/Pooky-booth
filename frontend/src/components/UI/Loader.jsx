import React from 'react';
import './Loader.css';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className="loader-pooky">
        <div className="heart-bounce">💖</div>
        <div className="loader-spinner"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
