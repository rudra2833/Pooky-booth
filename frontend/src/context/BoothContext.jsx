import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRoom } from './RoomContext';

const BoothContext = createContext();

export const BoothProvider = ({ children }) => {
  const { socket, role } = useRoom();

  // App step flow: 'room' | 'customizer' | 'camera' | 'preview'
  const [step, setStep] = useState('room');

  // Customization state
  const [customization, setCustomization] = useState({
    size: 4, // 2, 3, 4, 6
    layout: 'vertical', // 'vertical' | 'grid'
    style: 'classic-white', // Border style key
    dateEnabled: true,
    text: '',
    font: 'font-cute', // default font class
  });

  // Photo-booth state
  const [photos, setPhotos] = useState([]); // List of captured composite photo data URLs
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [timerDuration, setTimerDuration] = useState(5); // Default 5 seconds
  const [isShooting, setIsShooting] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  // Sync state from server/socket
  useEffect(() => {
    if (!socket) return;

    // Receive customization from leader
    socket.on('customization-update', (config) => {
      if (role === 'partner') {
        setCustomization((prev) => ({ ...prev, ...config }));
      }
    });

    // Advance to Camera screen when customized is ready
    socket.on('customization-ready', (data) => {
      if (data && data.customization) {
        setCustomization(data.customization);
      }
      setPhotos([]);
      setCurrentPhotoIndex(0);
      setIsShooting(false);
      setStep('camera');
    });

    // Flash trigger animation
    socket.on('flash-trigger', () => {
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 800);
    });

    // Synchronize step changes back to room setup on disconnect or restarts
    socket.on('partner-disconnected', () => {
      setStep('room');
      setPhotos([]);
      setCurrentPhotoIndex(0);
      setIsShooting(false);
    });

    socket.on('retake-request', ({ photoIndex }) => {
      if (photoIndex === -1) {
        // Retake all
        setPhotos([]);
        setCurrentPhotoIndex(0);
        setIsShooting(false);
        setStep('camera');
      } else {
        // Retake specific index
        setPhotos((prev) => {
          const next = [...prev];
          next[photoIndex] = null;
          return next;
        });
        setCurrentPhotoIndex(photoIndex);
        setStep('camera');
      }
    });

    socket.on('start-customization', () => {
      setStep('customizer');
    });

    socket.on('strip-ready', () => {
      setStep('preview');
    });

    return () => {
      socket.off('start-customization');
      socket.off('customization-update');
      socket.off('customization-ready');
      socket.off('flash-trigger');
      socket.off('partner-disconnected');
      socket.off('retake-request');
      socket.off('strip-ready');
    };
  }, [socket, role]);

  // Sync state to Socket when leader makes selection
  const updateCustomization = (config) => {
    setCustomization((prev) => {
      const next = { ...prev, ...config };
      if (socket && role === 'leader') {
        socket.emit('customization-update', next);
      }
      return next;
    });
  };

  // Leader starts customization (transitions partner too)
  const startCustomization = () => {
    setStep('customizer');
    if (socket && role === 'leader') {
      socket.emit('start-customization');
    }
  };

  // Leader triggers camera screen
  const proceedToCamera = () => {
    if (socket && role === 'leader') {
      socket.emit('customization-ready', { customization });
    }
  };

  // Reset booth session
  const resetBooth = () => {
    setStep('room');
    setPhotos([]);
    setCurrentPhotoIndex(0);
    setIsShooting(false);
    setCustomization({
      size: 4,
      layout: 'vertical',
      style: 'classic-white',
      dateEnabled: true,
      text: '',
      font: 'font-cute',
    });
  };

  return (
    <BoothContext.Provider
      value={{
        step,
        setStep,
        customization,
        setCustomization,
        updateCustomization,
        startCustomization,
        proceedToCamera,
        photos,
        setPhotos,
        currentPhotoIndex,
        setCurrentPhotoIndex,
        timerDuration,
        setTimerDuration,
        isShooting,
        setIsShooting,
        flashActive,
        setFlashActive,
        resetBooth,
      }}
    >
      {children}
    </BoothContext.Provider>
  );
};

export const useBooth = () => {
  const context = useContext(BoothContext);
  if (!context) {
    throw new Error('useBooth must be used within a BoothProvider');
  }
  return context;
};
