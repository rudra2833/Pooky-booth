import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import './Room.css';

const JoinRoom = ({ onBack }) => {
  const { joinRoom, error, connectionStatus } = useRoom();
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length === 6) {
      joinRoom(code);
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
        <p className="subtitle-cute">Enter the 6-digit room code shared by your partner.</p>
      </div>

      <form onSubmit={handleSubmit} className="room-form">
        <div className="input-group">
          <input
            type="text"
            value={code}
            onChange={handleInputChange}
            placeholder="e.g. 123456"
            className="room-input text-center"
            maxLength={6}
            disabled={isLoading}
            autoFocus
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
              disabled={code.length !== 6 || isLoading}
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
