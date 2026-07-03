import { useState, useEffect, useCallback, useRef } from 'react';

export const useCamera = () => {
  const [localStream, setLocalStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      // Return existing stream if already initialized to avoid duplicate prompts
      if (streamRef.current) {
        return streamRef.current;
      }

      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user', // Selfie mirror mode
        },
        audio: false, // No audio needed for photo booth
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setLocalStream(stream);
      setIsCameraLoading(false);
      return stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsCameraLoading(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please enable webcam permissions in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No webcam found on this device. Please connect a camera.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setLocalStream(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    localStream,
    cameraError,
    isCameraLoading,
    startCamera,
    stopCamera,
  };
};

