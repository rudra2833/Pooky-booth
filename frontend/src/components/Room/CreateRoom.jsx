import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useBooth } from '../../context/BoothContext';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import './Room.css';

const CreateRoom = ({ onBack }) => {
  const { roomCode, partnerConnected, connectionStatus } = useRoom();
  const { setStep } = useBooth();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartCustomization = () => {
    setStep('customizer');
  };

  return (
    <div className="room-card glass-panel-pooky animate-pop-in">
      <div className="room-card-header">
        <h2 className="title-cute">Room Created! 🎈</h2>
        <p className="subtitle-cute">Share this code with your partner to connect.</p>
      </div>

      <div className="room-code-section">
        <span className="room-code-label">Room Code</span>
        <div className="room-code-display">
          {roomCode ? roomCode : <span className="pulsing-dots">...</span>}
        </div>
        <Button
          onClick={copyCode}
          variant={copied ? 'secondary' : 'primary'}
          disabled={!roomCode}
          size="sm"
        >
          {copied ? 'Copied! ✨' : 'Copy Code 📋'}
        </Button>
      </div>

      <div className="connection-status-section">
        <h3>Connection Status</h3>
        {partnerConnected ? (
          <div className="status-indicator connected animate-pulse-soft">
            <span className="dot bg-connected"></span>
            <span className="status-text font-bold">Partner Joined! 🎉</span>
          </div>
        ) : (
          <div className="status-indicator waiting">
            <Loader text="Waiting for partner to join..." />
          </div>
        )}
      </div>

      <div className="room-actions">
        {partnerConnected && (
          <Button onClick={handleStartCustomization} variant="primary" size="md">
            Go to Customization 🎨
          </Button>
        )}
        <Button onClick={onBack} variant="outline" size="sm">
          Cancel & Exit 🚪
        </Button>
      </div>
    </div>
  );
};

export default CreateRoom;
