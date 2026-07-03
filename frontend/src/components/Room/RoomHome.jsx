import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import Button from '../UI/Button';
import './Room.css';

const RoomHome = () => {
  // Local screen modes: 'lobby' | 'create' | 'join'
  const [localMode, setLocalMode] = useState('lobby');
  const { createRoom, resetRoom, connectionStatus } = useRoom();

  // Reset room context when returning to lobby
  useEffect(() => {
    if (localMode === 'lobby') {
      resetRoom();
    }
  }, [localMode]);

  // If connection status updates to waiting/connected from leader side,
  // we ensure localMode is 'create'.
  useEffect(() => {
    if (connectionStatus === 'waiting' && localMode === 'lobby') {
      setLocalMode('create');
    }
  }, [connectionStatus, localMode]);

  const handleCreateRoom = () => {
    setLocalMode('create');
    createRoom();
  };

  const handleJoinRoom = () => {
    setLocalMode('join');
  };

  const handleBackToLobby = () => {
    setLocalMode('lobby');
  };

  if (localMode === 'create') {
    return <CreateRoom onBack={handleBackToLobby} />;
  }

  if (localMode === 'join') {
    return <JoinRoom onBack={handleBackToLobby} />;
  }

  return (
    <div className="lobby-card glass-panel-pooky animate-pop-in text-center">
      <div className="lobby-mascot animate-float">📸</div>
      
      <div className="lobby-content">
        <h1 className="pooky-title">Pooky Booth</h1>
        <p className="pooky-subtitle">long distance memories</p>
        
        <p className="lobby-description">
          A real-time photo booth that connects you with your partner, friends, or family 
          miles away. Smile together, snap synced photos, and style beautiful memories!
        </p>
      </div>

      <div className="lobby-actions">
        <Button onClick={handleCreateRoom} variant="primary" size="lg" className="w-full">
          Create Room 🆕
        </Button>
        <Button onClick={handleJoinRoom} variant="secondary" size="lg" className="w-full">
          Join Room 🔑
        </Button>
      </div>

      <div className="lobby-footer text-xs font-semibold">
        <p>⚡ Powered by WebRTC & Socket.io for lag-free real-time connection</p>
      </div>
    </div>
  );
};

export default RoomHome;
