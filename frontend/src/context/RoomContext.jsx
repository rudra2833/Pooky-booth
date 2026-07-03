import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [role, setRole] = useState(null); // 'leader' | 'partner'
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle' | 'waiting' | 'connected' | 'disconnected'
  const [error, setError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    // In production/development, relative url works through Vite proxy,
    // but specifying localhost:5000 directly ensures it works outside proxy too.
    // Resolve backend URL dynamically to allow multi-laptop local network testing
    const getBackendUrl = () => {
      if (import.meta.env.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL;
      }
      const hostname = window.location.hostname;
      return hostname === 'localhost' || hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : `${window.location.protocol}//${hostname}:5000`;
    };

    const socketInstance = io(getBackendUrl(), {
      transports: ['websocket'],
      autoConnect: true
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setError(null);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Cannot connect to signaling server. Make sure server is running.');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Listen to socket-level room events
  useEffect(() => {
    if (!socket) return;

    socket.on('room-created', ({ roomCode, room }) => {
      setRoomCode(roomCode);
      setRole('leader');
      setConnectionStatus('waiting');
      setPartnerConnected(false);
      setError(null);
    });

    socket.on('room-joined', ({ success, role, roomCode, customization }) => {
      if (success) {
        setRoomCode(roomCode);
        setRole(role);
        setConnectionStatus('connected');
        setPartnerConnected(true);
        setError(null);
      }
    });

    socket.on('partner-connected', ({ partnerId, room }) => {
      setPartnerConnected(true);
      setConnectionStatus('connected');
      setError(null);
    });

    socket.on('partner-disconnected', ({ message }) => {
      // If partner disconnects, leader goes back to waiting.
      // If leader disconnects, partner room closes, goes to disconnected.
      if (role === 'leader') {
        setPartnerConnected(false);
        setConnectionStatus('waiting');
        setError(message);
      } else {
        setPartnerConnected(false);
        setConnectionStatus('disconnected');
        setRoomCode(null);
        setRole(null);
        setError(message);
      }
    });

    socket.on('room-full-error', () => {
      setError('This room is full! Max 2 users allowed.');
      setConnectionStatus('idle');
    });

    socket.on('room-error', ({ message }) => {
      setError(message);
      setConnectionStatus('idle');
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('partner-connected');
      socket.off('partner-disconnected');
      socket.off('room-full-error');
      socket.off('room-error');
    };
  }, [socket, role]);

  const createRoom = () => {
    if (!socket) return;
    setError(null);
    socket.emit('create-room');
  };

  const joinRoom = (code) => {
    if (!socket || !code) return;
    setError(null);
    setConnectionStatus('connecting');
    socket.emit('join-room', { roomCode: code });
  };

  const resetRoom = () => {
    setRoomCode(null);
    setRole(null);
    setPartnerConnected(false);
    setConnectionStatus('idle');
    setError(null);
  };

  return (
    <RoomContext.Provider
      value={{
        socket,
        roomCode,
        role,
        partnerConnected,
        connectionStatus,
        setConnectionStatus,
        error,
        setError,
        createRoom,
        joinRoom,
        resetRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
