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
  const { socket, role, partnerConnected, roomCode, myName, partnerName } = useRoom();
  const {
    customization,
    timerDuration,
    setTimerDuration,
    isShooting,
    setIsShooting,
    photos,
    currentPhotoIndex,
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
    stopCamera();
    setStep('room');
  };

  // Show error states
  if (cameraError) {
    return (
      <div className="glass-panel-pooky text-center">
        <h2>Camera Access Error ⚠️</h2>
        <p className="error-text" style={{ margin: '15px 0' }}>{cameraError}</p>
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
          <span className="room-badge">Room Code: <b>{roomCode || '...'}</b></span>
          <span className={`rtc-status-badge ${rtcStatus}`}>
            P2P: {rtcStatus === 'connected' ? 'Connected ⚡' : rtcStatus === 'error' ? 'Error ⚠️' : 'Connecting... 🔄'}
          </span>
        </div>
        <Button onClick={handleExit} variant="outline" size="sm">
          Exit Room 🚪
        </Button>
      </div>

      <div className="camera-main-layout">
        {/* Left Column: Webcam Feeds styled inside the border preview frame + Live Strip Preview side-by-side */}
        <div className="camera-feeds-panel" style={{ display: 'flex', gap: '16px', alignItems: 'stretch', width: '100%', maxWidth: '700px', margin: '0 auto' }}>
          <div
            className="preview-frame-container"
            style={{
              background: borderStyle.background,
              color: borderStyle.textColor,
              borderColor: borderStyle.borderColor,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            {/* Live Synchronized Feeds */}
            <div className="dual-camera-frame" style={{ width: '100%', boxSizing: 'border-box' }}>
              {/* Leader's Stream (Left) */}
              <div className="camera-half">
                <CameraStream
                  stream={leaderStream}
                  id="leader-video-stream"
                  label={isLeader ? 'YOU (CREATOR)' : 'PARTNER (CREATOR)'}
                  isLocal={isLeader}
                />
                <div className="camera-name-tag">
                  {isLeader
                    ? (myName ? `${myName} 🎬` : 'You 🎬')
                    : (partnerName ? `${partnerName} 🎬` : 'Creator 🎬')}
                </div>
              </div>

              {/* Partner's Stream (Right) */}
              <div className="camera-half">
                <CameraStream
                  stream={partnerStream}
                  id="partner-video-stream"
                  label={isLeader ? 'PARTNER' : 'YOU'}
                  isLocal={!isLeader}
                />
                <div className="camera-name-tag">
                  {isLeader
                    ? (partnerName ? `${partnerName} 💕` : 'Partner 💕')
                    : (myName ? `${myName} 💕` : 'You 💕')}
                </div>
              </div>
            </div>

            {/* Simulated Frame Label footer */}
            <div className={`preview-frame-footer ${customization.font}`} style={{ marginTop: 'auto', padding: '10px 0 0 0' }}>
              {customization.text ? (
                <p className="frame-footer-text">{customization.text}</p>
              ) : (
                <p className="frame-footer-text placeholder-text">Pooky Memories 💖</p>
              )}
            </div>
          </div>

          {/* Live Strip Preview (Sits OUTSIDE the preview-frame-container) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100px',
            flexShrink: 0,
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px 8px',
            boxSizing: 'border-box'
          }}>
            <p style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              textAlign: 'center',
              opacity: 0.7,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '2px',
              color: 'var(--color-text-dark)'
            }}>Captured</p>
            {Array.from({ length: customization.size }).map((_, i) => {
              const photo = photos[i];
              const isNext = !isShooting && i === currentPhotoIndex && !photo;
              const isCurrent = isShooting && i === currentPhotoIndex;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    minHeight: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: isCurrent
                      ? '2px solid #ff6b9d'
                      : isNext
                      ? '2px dashed #ff6b9d'
                      : '2px solid rgba(255,255,255,0.15)',
                    background: photo ? 'transparent' : 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'border 0.3s',
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={`Shot ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '1.1rem', opacity: 0.5 }}>
                      {isCurrent ? '📸' : isNext ? '⏳' : '♡'}
                    </span>
                  )}
                  {/* Shot number badge */}
                  <span style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: photo ? '#fff' : 'rgba(255,255,255,0.5)',
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: '4px',
                    padding: '2px 4px',
                  }}>{i + 1}</span>
                </div>
              );
            })}
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
                <p>Waiting for Creator to click SHOOT...</p>
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
