import React from 'react';
import { FONTS_LIST } from '../../styles/stripStyles';
import './Customizer.css';

const TextOptions = ({ customization, onChange, disabled = false }) => {
  const { dateEnabled, text, font } = customization;

  const handleToggleDate = () => {
    if (disabled) return;
    onChange({ dateEnabled: !dateEnabled });
  };

  const handleTextChange = (e) => {
    if (disabled) return;
    onChange({ text: e.target.value });
  };

  const handleFontClick = (fontClass) => {
    if (disabled) return;
    onChange({ font: fontClass });
  };

  return (
    <div className="picker-section">
      <h3 className="section-title">3. Text & Date Options 📝</h3>

      <div className="layout-sub-group">
        <div className="toggle-container" onClick={handleToggleDate}>
          <input
            type="checkbox"
            checked={dateEnabled}
            readOnly
            disabled={disabled}
            className="cute-checkbox"
          />
          <span className="picker-label cursor-pointer select-none">Include today's date on bottom</span>
        </div>
      </div>

      <div className="layout-sub-group">
        <label className="picker-label">Custom Footer Text:</label>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="e.g. Rudra & Ananya 2026"
          disabled={disabled}
          maxLength={30}
          className="cute-text-input"
        />
      </div>

      <div className="layout-sub-group">
        <label className="picker-label">Font Family Style:</label>
        <div className="font-button-grid">
          {FONTS_LIST.map((f) => {
            const isSelected = font === f.key;
            return (
              <button
                key={f.key}
                type="button"
                disabled={disabled}
                onClick={() => handleFontClick(f.key)}
                className={`font-btn ${f.key} ${isSelected ? 'active' : ''}`}
              >
                {f.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TextOptions;
