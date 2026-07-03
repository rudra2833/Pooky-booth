import React from 'react';
import { RoomProvider } from './context/RoomContext';
import { BoothProvider, useBooth } from './context/BoothContext';
import RoomHome from './components/Room/RoomHome';
import StripCustomizer from './components/Customization/StripCustomizer';

import CameraView from './components/Camera/CameraView';
import StripPreview from './components/PhotoBooth/StripPreview';

function BoothApp() {
  const { step, flashActive } = useBooth();

  const renderStep = () => {
    switch (step) {
      case 'room':
        return <RoomHome />;
      case 'customizer':
        return <StripCustomizer />;
      case 'camera':
        return <CameraView />;
      case 'preview':
        return <StripPreview />;
      default:
        return <RoomHome />;
    }
  };

  return (
    <div className="app-container">
      {/* Screen flash animation overlay */}
      <div className={`flash-overlay ${flashActive ? 'flash-active' : ''}`} />
      
      {renderStep()}
    </div>
  );
}

function App() {
  return (
    <RoomProvider>
      <BoothProvider>
        <BoothApp />
      </BoothProvider>
    </RoomProvider>
  );
}

export default App;

