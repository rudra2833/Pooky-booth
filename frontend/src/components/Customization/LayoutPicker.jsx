import React from 'react';
import { PHOTO_SIZES, LAYOUTS_LIST } from '../../styles/stripStyles';
import './Customizer.css';

const LayoutPicker = ({ customization, onChange, disabled = false }) => {
  const { size, layout } = customization;

  const handleSizeClick = (newSize) => {
    if (disabled) return;
    
    // Automatically fall back layout to vertical if size is 3 and grid is selected, 
    // since 3 photos cannot form a balanced grid.
    let nextLayout = layout;
    if (newSize === 3 && layout === 'grid') {
      nextLayout = 'vertical';
    }
    onChange({ size: newSize, layout: nextLayout });
  };

  const handleLayoutClick = (newLayout) => {
    if (disabled) return;
    // Don't allow grid for 3 photos
    if (size === 3 && newLayout === 'grid') return;
    onChange({ layout: newLayout });
  };

  return (
    <div className="picker-section">
      <h3 className="section-title">2. Layout & Size 📏</h3>
      
      <div className="layout-sub-group">
        <label className="picker-label">Photo Count:</label>
        <div className="option-button-row">
          {PHOTO_SIZES.map((ps) => {
            const isSelected = size === ps.key;
            return (
              <button
                key={ps.key}
                type="button"
                disabled={disabled}
                onClick={() => handleSizeClick(ps.key)}
                className={`option-btn ${isSelected ? 'active' : ''}`}
              >
                {ps.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="layout-sub-group">
        <label className="picker-label">Layout Style:</label>
        <div className="option-button-row">
          {LAYOUTS_LIST.map((l) => {
            const isSelected = layout === l.key;
            const isForbidden = size === 3 && l.key === 'grid';
            return (
              <button
                key={l.key}
                type="button"
                disabled={disabled || isForbidden}
                onClick={() => handleLayoutClick(l.key)}
                className={`option-btn ${isSelected ? 'active' : ''} ${isForbidden ? 'disabled' : ''}`}
                title={isForbidden ? 'Grid layout is not available for 3 photos' : ''}
              >
                {l.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LayoutPicker;
