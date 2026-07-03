import { useState, useEffect, useCallback } from 'react';

export const useCamera = () => {
  const [localStream, setLocalStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const startCamera = useCallback(async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user', // Selfie mirror mode
        },
        audio: false, // No audio needed for photo booth
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  return {
    localStream,
    cameraError,
    isCameraLoading,
    startCamera,
    stopCamera,
  };
};
