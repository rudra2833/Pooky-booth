import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { useBooth } from '../../context/BoothContext';
import StylePicker from './StylePicker';
import LayoutPicker from './LayoutPicker';
import TextOptions from './TextOptions';
import StylePreview from './StylePreview';
import Button from '../UI/Button';
import './Customizer.css';

const StripCustomizer = () => {
  const { role } = useRoom();
  const { customization, updateCustomization, proceedToCamera } = useBooth();

  const isLeader = role === 'leader';

  const handleCustomizationChange = (updatedFields) => {
    updateCustomization(updatedFields);
  };

  return (
    <div className="customizer-container animate-pop-in">
      <div className="customizer-header">
        <h2 className="title-cute">Customize Strip 🎨</h2>
        <p className="subtitle-cute">
          {isLeader
            ? 'Style the photo strip! Your partner sees updates in real-time.'
            : 'Your partner is configuring the strip style. Check out the preview!'}
        </p>
      </div>

      <div className="customizer-body">
        {/* Left Column: Control Panels (Only editable by Leader) */}
        <div className="customizer-controls glass-panel">
          {!isLeader && (
            <div className="partner-waiting-alert animate-pulse-soft">
              <span className="alert-emoji">🔒</span>
              <p>Room Leader is selecting the styles. Enjoy the live preview!</p>
            </div>
          )}

          <div className={`controls-wrapper ${!isLeader ? 'readonly-overlay' : ''}`}>
            <StylePicker
              selectedStyle={customization.style}
              onChange={handleCustomizationChange}
              disabled={!isLeader}
            />

            <LayoutPicker
              customization={customization}
              onChange={handleCustomizationChange}
              disabled={!isLeader}
            />

            <TextOptions
              customization={customization}
              onChange={handleCustomizationChange}
              disabled={!isLeader}
            />
          </div>

          {isLeader && (
            <div className="start-booth-section">
              <Button
                onClick={proceedToCamera}
                variant="secondary"
                size="lg"
                className="w-full start-session-btn"
              >
                Start Camera Session 📸
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Live Mock Preview */}
        <div className="customizer-preview-panel glass-panel">
          <StylePreview customization={customization} />
        </div>
      </div>
    </div>
  );
};

export default StripCustomizer;
