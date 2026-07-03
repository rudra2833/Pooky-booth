import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useBooth } from '../../context/BoothContext';
import { useCamera } from '../../hooks/useCamera';
import { useWebRTC } from '../../hooks/useWebRTC';
import CameraStream from './CameraStream';
import CountdownTimer from './CountdownTimer';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import { BORDER_DESIGNS } from '../../styles/borderDesigns';
import './Camera.css';

const CameraView = () => {
  const { socket, role, partnerConnected } = useRoom();
  const {
    customization,
    timerDuration,
    setTimerDuration,
    isShooting,
    setIsShooting,
    step,
    setStep,
  } = useBooth();

  // Local camera stream
  const { localStream, cameraError, isCameraLoading, startCamera, stopCamera } = useCamera();

  // WebRTC remote stream connection
  const { remoteStream, rtcStatus, rtcError } = useWebRTC(
    socket,
    role,
    localStream,
    partnerConnected
  );

  const [customTimer, setCustomTimer] = useState('');
  const [useCustomTimer, setUseCustomTimer] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const isLeader = role === 'leader';
  const borderStyle = BORDER_DESIGNS[customization.style] || BORDER_DESIGNS['classic-white'];

  // Left side is always Leader, Right side is always Partner
  const leaderStream = isLeader ? localStream : remoteStream;
  const partnerStream = isLeader ? remoteStream : localStream;

  const handleShootClick = () => {
    if (!isLeader || isShooting) return;
    const duration = useCustomTimer ? parseInt(customTimer, 10) || 5 : timerDuration;
    socket.emit('start-countdown', { timerDuration: duration });
  };

  const handleTimerSelect = (seconds) => {
    setUseCustomTimer(false);
    setTimerDuration(seconds);
  };

  const handleCustomTimerChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomTimer(val);
    setUseCustomTimer(true);
  };

  // Exit camera session
  const handleExit = () => {
    socket.emit('partner-disconnected', { message: 'Session closed' });
    window.location.reload(); // Refresh to clean up connections fully
  };

  // Show error states
  if (cameraError) {
    return (
      <div className="camera-error-container glass-panel-pooky animate-pop-in text-center">
        <h2>Camera Access Error ⚠️</h2>
        <p className="error-text">{cameraError}</p>
        <Button onClick={startCamera} variant="primary" className="mt-4">
          Try Again 🔄
        </Button>
        <Button onClick={handleExit} variant="outline" className="mt-2">
          Back to Lobby 🚪
        </Button>
      </div>
    );
  }

  return (
    <div className="camera-screen-container animate-pop-in">
      <CountdownTimer />
      {/* Top Banner Status Bar */}
      <div className="camera-banner glass-panel">
        <div className="banner-info">
          <span className="room-badge">Room Code: <b>{socket?.roomCode || '...'}</b></span>
          <span className={`rtc-status-badge ${rtcStatus}`}>
            P2P: {rtcStatus === 'connected' ? 'Connected ⚡' : 'Connecting... 🔄'}
          </span>
        </div>
        <Button onClick={handleExit} variant="outline" size="sm">
          Exit Room 🚪
        </Button>
      </div>

      <div className="camera-main-layout">
        {/* Left Column: Webcam Feeds styled inside the border preview frame */}
        <div className="camera-feeds-panel">
          <div
            className="preview-frame-container"
            style={{
              background: borderStyle.background,
              color: borderStyle.textColor,
              borderColor: borderStyle.borderColor,
            }}
          >
            {/* Live Synchronized Feeds */}
            <div className="dual-camera-frame">
              {/* Leader's Stream (Left) */}
              <div className="camera-half">
                <CameraStream
                  stream={leaderStream}
                  id="leader-video-stream"
                  label={isLeader ? 'YOU (LEADER)' : 'PARTNER (LEADER)'}
                  isLocal={isLeader}
                />
              </div>

              {/* Partner's Stream (Right) */}
              <div className="camera-half">
                <CameraStream
                  stream={partnerStream}
                  id="partner-video-stream"
                  label={isLeader ? 'PARTNER' : 'YOU'}
                  isLocal={!isLeader}
                />
              </div>
            </div>

            {/* Simulated Frame Label footer */}
            <div className={`preview-frame-footer ${customization.font}`}>
              {customization.text ? (
                <p className="frame-footer-text">{customization.text}</p>
              ) : (
                <p className="frame-footer-text placeholder-text">Pooky Memories 💖</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Controls Panel */}
        <div className="camera-controls-panel glass-panel">
          <div className="controls-header">
            <h3>Booth Controls 📸</h3>
            <p>Style: <b>{borderStyle.name}</b> ({customization.size} Photos)</p>
          </div>

          {/* Countdown timer placeholder - we will create this in Stage 7 */}
          <div id="countdown-portal" className="countdown-display-placeholder">
            {isShooting ? (
              <div className="shooting-indicator animate-pulse-soft">📸 Camera Active...</div>
            ) : (
              <div className="idle-indicator">Ready to Capture!</div>
            )}
          </div>

          {/* Timer Settings (Only Leader can configure) */}
          <div className="timer-settings-section">
            <h4>Set Countdown Timer</h4>
            <div className="timer-options-row">
              {[3, 5, 10].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  disabled={!isLeader || isShooting}
                  onClick={() => handleTimerSelect(sec)}
                  className={`timer-select-btn ${
                    timerDuration === sec && !useCustomTimer ? 'active' : ''
                  } ${!isLeader ? 'disabled' : ''}`}
                >
                  {sec}s
                </button>
              ))}
              <div className="custom-timer-input-wrapper">
                <input
                  type="text"
                  placeholder="Custom"
                  value={customTimer}
                  onChange={handleCustomTimerChange}
                  disabled={!isLeader || isShooting}
                  className={`custom-timer-field ${useCustomTimer ? 'active' : ''} ${
                    !isLeader ? 'disabled' : ''
                  }`}
                />
                <span className="field-suffix">sec</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="action-button-section">
            {isLeader ? (
              <Button
                onClick={handleShootClick}
                disabled={rtcStatus !== 'connected' || isShooting}
                variant="secondary"
                size="lg"
                className="w-full capture-trigger-btn"
              >
                {isShooting ? 'Taking Photos... 🚀' : 'SHOOT 📸'}
              </Button>
            ) : (
              <div className="partner-waiting-prompt">
                <span className="spin-icon animate-pulse-soft">💖</span>
                <p>Waiting for Room Leader to click SHOOT...</p>
              </div>
            )}
          </div>

          {/* Connected partner details */}
          <div className="session-details-footer">
            <div className="detail-item">
              <span>Layout Style:</span>
              <span>{customization.layout === 'grid' ? 'Grid 2x2' : 'Vertical'}</span>
            </div>
            <div className="detail-item">
              <span>WebRTC Signal:</span>
              <span className={`signal-text ${rtcStatus}`}>{rtcStatus.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraView;
