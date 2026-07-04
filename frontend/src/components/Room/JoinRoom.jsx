import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import './Room.css';

const JoinRoom = ({ onBack }) => {
  const { joinRoom, error, connectionStatus } = useRoom();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length === 6 && name.trim().length > 0) {
      joinRoom(code, name.trim());
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // Numeric inputs only
    if (val.length <= 6) {
      setCode(val);
    }
  };

  const isLoading = connectionStatus === 'connecting';

  return (
    <div className="room-card glass-panel-pooky animate-pop-in">
      <div className="room-card-header">
        <h2 className="title-cute">Join Partner 👯‍♀️</h2>
        <p className="subtitle-cute">Enter your name and the 6-digit room code.</p>
      </div>

      <form onSubmit={handleSubmit} className="room-form">

        <div className="input-group">
          <label className="picker-label" style={{ marginBottom: '6px', display: 'block' }}>Your Name 💕</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya"
            className="room-input text-center"
            maxLength={20}
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="input-group" style={{ marginTop: '12px' }}>
          <label className="picker-label" style={{ marginBottom: '6px', display: 'block' }}>Room Code 🔑</label>
          <input
            type="text"
            value={code}
            onChange={handleInputChange}
            placeholder="e.g. 123456"
            className="room-input text-center"
            maxLength={6}
            disabled={isLoading}
          />
        </div>

        {error && <div className="error-message pooky-alert">{error}</div>}

        {isLoading ? (
          <Loader text="Connecting to room..." />
        ) : (
          <div className="room-actions-vertical">
            <Button
              type="submit"
              variant="secondary"
              disabled={code.length !== 6 || name.trim().length === 0 || isLoading}
              className="w-full"
            >
              Connect Now ✨
            </Button>
            <Button onClick={onBack} variant="outline" className="w-full">
              Go Back ⬅️
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default JoinRoom;
