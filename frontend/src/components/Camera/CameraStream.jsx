import React, { useRef, useEffect } from 'react';
import './Camera.css';

const CameraStream = ({ stream, label, isLocal = false, id }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="camera-stream-wrapper">
      <div className="video-viewport">
        {stream ? (
          <video
            ref={videoRef}
            id={id}
            autoPlay
            playsInline
            muted // Muted to avoid feedback echo loops since we only need video
            className={`webcam-video ${isLocal ? 'mirrored' : ''}`}
          />
        ) : (
          <div className="video-placeholder">
            <span className="mascot-loading animate-float">📷</span>
            <p className="placeholder-text">Waiting for stream...</p>
          </div>
        )}
        <div className="stream-label">{label}</div>
      </div>
    </div>
  );
};

export default CameraStream;
