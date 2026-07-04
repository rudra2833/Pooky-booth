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
        setIsCameraLoading(false);
        return streamRef.current;
      }

      // Enumerate all video devices and pick the FIRST real camera by deviceId.
      // This prevents the second tab from grabbing a virtual camera (OBS, Teams, etc.)
      // when the main webcam is already held by another tab.
      let deviceId = null;
      try {
        // Request permission first so labels are visible
        await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (d) => d.kind === 'videoinput' &&
          // Filter out obvious virtual cameras by label
          !d.label.toLowerCase().includes('virtual') &&
          !d.label.toLowerCase().includes('obs') &&
          !d.label.toLowerCase().includes('snap') &&
          !d.label.toLowerCase().includes('droidcam') &&
          !d.label.toLowerCase().includes('iriun')
        );
        if (videoDevices.length > 0) {
          deviceId = videoDevices[0].deviceId;
        }
      } catch (_) {
        // Enumeration failed, proceed without deviceId
      }

      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
          : { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
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

