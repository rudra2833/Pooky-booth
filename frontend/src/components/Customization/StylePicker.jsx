import React from 'react';
import { BORDER_DESIGNS } from '../../styles/borderDesigns';
import './Customizer.css';

const StylePicker = ({ selectedStyle, onChange, disabled = false }) => {
  return (
    <div className="picker-section">
      <h3 className="section-title">1. Choose Border Style 🎨</h3>
      <div className="style-grid">
        {Object.entries(BORDER_DESIGNS).map(([key, styleObj]) => {
          const isSelected = selectedStyle === key;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ style: key })}
              className={`style-option-card ${isSelected ? 'selected' : ''}`}
              style={{
                background: styleObj.background,
                color: styleObj.textColor,
                borderColor: isSelected ? 'var(--color-text-dark)' : 'transparent',
              }}
            >
              <div className="style-option-overlay" />
              <span className="style-option-name">{styleObj.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StylePicker;
