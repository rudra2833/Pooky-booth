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
  const [sessionProgress, setSessionProgress] = useState(''); // e.g. "Get Ready!"
  const [targetIndex, setTargetIndex] = useState(0); // Which slot are we capturing

  const timerRef = useRef(null);
  const isLeader = role === 'leader';

  useEffect(() => {
    if (!socket) return;

    // Listen to countdown initiation
    socket.on('start-countdown', ({ timerDuration: duration }) => {
      setIsShooting(true);
      setCount(duration);
      setSessionProgress('Get ready! 📸');
      
      // Setup local count tick interval
      if (timerRef.current) clearInterval(timerRef.current);
      
      let currentTick = duration;
      timerRef.current = setInterval(() => {
        currentTick -= 1;
        if (currentTick > 0) {
          setCount(currentTick);
        } else if (currentTick === 0) {
          clearInterval(timerRef.current);
          setCount('SMILE! 💖');
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
    // 1. Play flash animation
    setFlashActive(true);
    if (isLeader) {
      socket.emit('flash-trigger');
    }
    setTimeout(() => setFlashActive(false), 800);

    // 2. Perform frame capture after a tiny delay to line up with flash peak
    setTimeout(() => {
      const leaderVid = document.getElementById('leader-video-stream');
      const partnerVid = document.getElementById('partner-video-stream');

      if (leaderVid && partnerVid) {
        const frameDataUrl = captureSplitFrame(leaderVid, partnerVid, 600, 400);
        if (frameDataUrl) {
          // Append captured frame to photos array
          setPhotos((prev) => {
            const updated = [...prev];
            updated[targetIndex] = frameDataUrl;

            // Check if all photos are captured
            const totalRequired = customization.size;
            const completedCount = updated.filter(p => p !== null && p !== undefined).length;
            const isFinished = completedCount === totalRequired;

            if (isFinished) {
              setSessionProgress('All photos captured! Stitching strip... 🎉');
              setTimeout(() => {
                setIsShooting(false);
                if (isLeader) {
                  socket.emit('strip-ready');
                }
              }, 2000);
            } else {
              // Find next empty photo index
              let nextIndex = targetIndex + 1;
              while (nextIndex < totalRequired && updated[nextIndex]) {
                nextIndex++;
              }
              if (nextIndex < totalRequired) {
                setTargetIndex(nextIndex);
                setCurrentPhotoIndex(nextIndex);
                
                // Show delay to let users change poses
                setSessionProgress(`Photo ${completedCount} of ${totalRequired} saved! Prepare next pose...`);
                setCount(null);

                // Automate next countdown if leader
                if (isLeader) {
                  setTimeout(() => {
                    socket.emit('start-countdown', { timerDuration });
                  }, 3000);
                }
              }
            }

            return updated;
          });
        }
      }
    }, 150);
  };

  // Synchronize target index when photos change or retakes are triggered
  useEffect(() => {
    // If photos are empty, target index should be 0
    if (photos.length === 0) {
      setTargetIndex(0);
    } else {
      // Find first empty photo slot index
      const firstEmptyIndex = photos.findIndex(p => p === null || p === undefined);
      if (firstEmptyIndex !== -1) {
        setTargetIndex(firstEmptyIndex);
      } else {
        setTargetIndex(photos.length);
      }
    }
  }, [photos]);

  if (!isShooting) return null;

  return (
    <div className="countdown-overlay-container">
      <div className="countdown-panel glass-panel-pooky animate-pop-in">
        <div className="countdown-progress-title">
          Photo {photos.filter(p => p).length + 1} of {customization.size}
        </div>
        
        <div className="countdown-number-display">
          {count !== null ? (
            <span className="count-number animate-wiggle">{count}</span>
          ) : (
            <span className="pose-timer-loader">📸 Get Ready...</span>
          )}
        </div>

        <div className="countdown-status-text">{sessionProgress}</div>
      </div>
    </div>
  );
};

export default CountdownTimer;
