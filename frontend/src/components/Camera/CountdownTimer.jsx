import React, { useState, useEffect, useRef } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useBooth } from '../../context/BoothContext';
import { captureSplitFrame } from '../../utils/canvasHelper';
import './Countdown.css';

const CountdownTimer = () => {
  const { socket, role } = useRoom();
  const {
    customization,
    isShooting,
    setIsShooting,
    photos,
    setPhotos,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    timerDuration,
    setFlashActive,
    setStep,
  } = useBooth();

  const [count, setCount] = useState(null);
  const [sessionProgress, setSessionProgress] = useState('');
  const [targetIndex, setTargetIndex] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false); // manual pause between shots

  const timerRef = useRef(null);
  const isLeader = role === 'leader';

  useEffect(() => {
    if (!socket) return;

    socket.on('start-countdown', ({ timerDuration: duration }) => {
      setWaitingForNext(false);
      setIsShooting(true);
      setCount(duration);
      setSessionProgress('Get ready! 📸');

      if (timerRef.current) clearInterval(timerRef.current);

      let currentTick = duration;
      timerRef.current = setInterval(() => {
        currentTick -= 1;
        if (currentTick > 0) {
          setCount(currentTick);
        } else if (currentTick === 0) {
          clearInterval(timerRef.current);
          setCount('SMILE! 🧀');
          triggerCapture();
        }
      }, 1000);
    });

    return () => {
      socket.off('start-countdown');
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [socket, targetIndex, photos, customization]);

  const triggerCapture = () => {
    setFlashActive(true);
    if (isLeader) socket.emit('flash-trigger');
    setTimeout(() => setFlashActive(false), 800);

    setTimeout(() => {
      const leaderVid = document.getElementById('leader-video-stream');
      const partnerVid = document.getElementById('partner-video-stream');

      if (leaderVid && partnerVid) {
        const frameDataUrl = captureSplitFrame(leaderVid, partnerVid, 600, 400);
        if (frameDataUrl) {
          setPhotos((prev) => {
            const updated = [...prev];
            updated[targetIndex] = frameDataUrl;

            const totalRequired = customization.size;
            const completedCount = updated.filter(p => p !== null && p !== undefined).length;
            const isFinished = completedCount === totalRequired;

            if (isFinished) {
              setSessionProgress('All photos captured! 🎉');
              setTimeout(() => {
                setIsShooting(false);
                setWaitingForNext(false);
                if (isLeader) socket.emit('strip-ready');
              }, 2000);
            } else {
              // Find next empty slot
              let nextIndex = targetIndex + 1;
              while (nextIndex < totalRequired && updated[nextIndex]) nextIndex++;
              if (nextIndex < totalRequired) {
                setTargetIndex(nextIndex);
                setCurrentPhotoIndex(nextIndex);
                setSessionProgress(`Shot ${completedCount} of ${totalRequired} done ✅`);
                setCount(null);
                // No auto-trigger — wait for Creator to manually click "Next Shot"
                setWaitingForNext(true);
              }
            }

            return updated;
          });
        }
      }
    }, 150);
  };

  // Sync target index on retakes
  useEffect(() => {
    if (photos.length === 0) {
      setTargetIndex(0);
    } else {
      const firstEmptyIndex = photos.findIndex(p => p === null || p === undefined);
      if (firstEmptyIndex !== -1) {
        setTargetIndex(firstEmptyIndex);
      } else {
        setTargetIndex(photos.length);
      }
    }
  }, [photos]);

  const handleNextShot = () => {
    if (!isLeader) return;
    socket.emit('start-countdown', { timerDuration });
  };

  if (!isShooting) return null;

  return (
    <div className="countdown-overlay-container">
      <div className="countdown-panel glass-panel-pooky animate-pop-in">
        <div className="countdown-progress-title">
          Photo {photos.filter(p => p).length + (waitingForNext ? 0 : 1)} of {customization.size}
        </div>

        <div className="countdown-number-display">
          {waitingForNext ? (
            <span style={{ fontSize: '2.5rem' }}>😄</span>
          ) : count !== null ? (
            <span className="count-number animate-wiggle">{count}</span>
          ) : (
            <span className="pose-timer-loader">📸 Get Ready...</span>
          )}
        </div>

        <div className="countdown-status-text">{sessionProgress}</div>

        {/* Between shots: Creator gets a button, Partner waits */}
        {waitingForNext && (
          isLeader ? (
            <button
              onClick={handleNextShot}
              style={{
                marginTop: '14px',
                padding: '10px 22px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #ff6b9d, #c44dff)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(196,77,255,0.4)',
                transition: 'transform 0.15s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Next Shot 📸
            </button>
          ) : (
            <p style={{ marginTop: '12px', opacity: 0.65, fontSize: '0.85rem' }}>
              ⏳ Waiting for Creator to fire next shot...
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
