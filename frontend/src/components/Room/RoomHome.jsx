import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useBooth } from '../../context/BoothContext';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import Button from '../UI/Button';
import './Room.css';

const RoomHome = () => {
  // Local screen modes: 'lobby' | 'name-entry' | 'create' | 'join' | 'partner-waiting'
  const [localMode, setLocalMode] = useState('lobby');
  const [leaderNameInput, setLeaderNameInput] = useState('');

  const {
    createRoom, resetRoom, connectionStatus, role,
    roomCode, disconnectMessage, setDisconnectMessage,
    myName, partnerName,
  } = useRoom();

  const { updateCustomization } = useBooth();

  // Reset room context when returning to lobby
  useEffect(() => {
    if (localMode === 'lobby') {
      resetRoom();
    }
  }, [localMode]);

  // If connection status updates to waiting/connected from leader side,
  // we ensure localMode is 'create'.
  useEffect(() => {
    if (connectionStatus === 'waiting' && localMode === 'name-entry') {
      setLocalMode('create');
    }
    // When partner successfully joins, transition from join form to the waiting screen
    if (connectionStatus === 'connected' && role === 'partner' && localMode === 'join') {
      setLocalMode('partner-waiting');
    }
  }, [connectionStatus, localMode, role]);

  // Auto-fill strip footer text when both names are known
  useEffect(() => {
    if (myName && partnerName) {
      updateCustomization({ text: `${myName} & ${partnerName} 💕` });
    } else if (myName) {
      updateCustomization({ text: myName });
    }
  }, [myName, partnerName]);

  // When disconnect message arrives, go back to lobby
  useEffect(() => {
    if (disconnectMessage) {
      setLocalMode('lobby');
    }
  }, [disconnectMessage]);

  const handleCreateRoom = () => {
    setLocalMode('name-entry');
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (leaderNameInput.trim().length === 0) return;
    createRoom(leaderNameInput.trim());
    // stays on name-entry until connectionStatus changes to 'waiting'
  };

  const handleJoinRoom = () => {
    setLocalMode('join');
  };

  const handleBackToLobby = () => {
    setLocalMode('lobby');
  };

  const handleDismissDisconnect = () => {
    setDisconnectMessage(null);
  };

  // ── Leader name entry screen ──────────────────────────────────────────────
  if (localMode === 'name-entry') {
    return (
      <div className="room-card glass-panel-pooky animate-pop-in">
        <div className="room-card-header">
          <h2 className="title-cute">What's your name? 💌</h2>
          <p className="subtitle-cute">This will appear on your photo strip!</p>
        </div>
        <form onSubmit={handleNameSubmit} className="room-form">
          <div className="input-group">
            <input
              type="text"
              value={leaderNameInput}
              onChange={(e) => setLeaderNameInput(e.target.value)}
              placeholder="Your name..."
              className="room-input text-center"
              maxLength={20}
              autoFocus
            />
          </div>
          <div className="room-actions-vertical" style={{ marginTop: '16px' }}>
            <Button
              type="submit"
              variant="primary"
              disabled={leaderNameInput.trim().length === 0}
              className="w-full"
            >
              Create Room 
            </Button>
            <Button onClick={handleBackToLobby} variant="outline" className="w-full">
              Go Back 
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (localMode === 'create') {
    return <CreateRoom onBack={handleBackToLobby} />;
  }

  if (localMode === 'join') {
    return <JoinRoom onBack={handleBackToLobby} />;
  }

  // Partner waiting screen — shown after partner successfully joins the room
  if (localMode === 'partner-waiting') {
    return (
      <div className="room-card glass-panel-pooky animate-pop-in text-center">
        <div className="lobby-mascot animate-float">🎀</div>
        <div className="room-card-header">
          <h2 className="title-cute">You're In! 🎉</h2>
          <p className="subtitle-cute">Room <b>{roomCode}</b></p>
          <p style={{ marginTop: '12px', opacity: 0.7 }}>
            Waiting for your partner to set up the photo strip style...
          </p>
        </div>
        <div className="status-indicator connected animate-pulse-soft" style={{ justifyContent: 'center', margin: '16px 0' }}>
          <span className="dot bg-connected"></span>
          <span className="status-text font-bold">Connected to room ✨</span>
        </div>
        <p className="pulsing-dots" style={{ marginTop: '8px' }}>Hang tight...</p>
        <Button onClick={handleBackToLobby} variant="outline" size="sm" style={{ marginTop: '20px' }}>
          Leave Room
        </Button>
      </div>
    );
  }

  // ── Lobby ─────────────────────────────────────────────────────────────────
  return (
    <div className="lobby-card glass-panel-pooky animate-pop-in text-center">
      <div className="lobby-mascot animate-float">📸</div>

      {/* Disconnect toast */}
      {disconnectMessage && (
        <div
          className="pooky-alert"
          style={{
            marginBottom: '16px',
            background: 'rgba(255,80,80,0.12)',
            border: '1px solid rgba(255,80,80,0.4)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span> {disconnectMessage}</span>
          <button
            onClick={handleDismissDisconnect}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >✕</button>
        </div>
      )}

      <div className="lobby-content">
        <h1 className="pooky-title">Pooky Booth</h1>
        <p className="pooky-subtitle">long distance memories</p>

        <p className="lobby-description">
          Miles apart, but matching smiles. Here's to capturing beautiful moments together,
          because every second with you is a memory I want to keep forever, my sweet Sani. 🎀
        </p>
      </div>

      <div className="lobby-actions">
        <Button onClick={handleCreateRoom} variant="primary" size="lg" className="w-full">
          Create Room 
        </Button>
        <Button onClick={handleJoinRoom} variant="secondary" size="lg" className="w-full">
          Join Room 
        </Button>
      </div>

      <div className="lobby-footer text-xs font-semibold">
        <p> Created by Rudra Patel for her cut LOVE 💝</p>
      </div>
    </div>
  );
};

export default RoomHome;
