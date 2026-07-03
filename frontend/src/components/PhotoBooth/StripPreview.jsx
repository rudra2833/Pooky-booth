import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useBooth } from '../../context/BoothContext';
import { generatePhotoStrip } from '../../utils/stripGenerator';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import './PhotoBooth.css';

const StripPreview = () => {
  const { socket, role } = useRoom();
  const {
    photos,
    setPhotos,
    customization,
    setStep,
    setCurrentPhotoIndex,
    resetBooth,
  } = useBooth();

  const [stripUrl, setStripUrl] = useState(null);
  const [isStitching, setIsStitching] = useState(true);

  // Compile final strip on mount
  useEffect(() => {
    const stitchStrip = async () => {
      setIsStitching(true);
      try {
        const url = await generatePhotoStrip(photos, customization);
        setStripUrl(url);
        setIsStitching(false);
        
        // Trigger celebratory confetti explosion!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ffb7c5', '#d8b4fe', '#fef08a', '#a5f3fc', '#ff8fa3']
        });
      } catch (err) {
        console.error('Stitching error:', err);
        setIsStitching(false);
      }
    };

    stitchStrip();
  }, [photos, customization]);

  const handleDownload = () => {
    if (!stripUrl) return;
    saveAs(stripUrl, `pooky-booth-${Date.now()}.png`);
  };

  const handleRetakeAll = () => {
    if (socket) {
      socket.emit('retake-request', { photoIndex: -1 });
    }
  };

  const handleRetakeSpecific = (index) => {
    if (socket) {
      socket.emit('retake-request', { photoIndex: index });
    }
  };

  const handleStartOver = () => {
    resetBooth();
    window.location.reload(); // Hard refresh to reset the room completely
  };

  if (isStitching) {
    return (
      <div className="glass-panel-pooky animate-pop-in text-center stitch-loading-card">
        <Loader text="Stitching your memories together... 🧵" />
      </div>
    );
  }

  return (
    <div className="preview-screen-container animate-pop-in">
      <div className="preview-header text-center">
        <h2 className="title-cute">Memories Saved! 🎉</h2>
        <p className="subtitle-cute">Both you and your partner can download the final strip.</p>
      </div>

      <div className="preview-main-layout">
        {/* Left Column: Final Compiled Strip Image */}
        <div className="final-strip-display">
          {stripUrl ? (
            <img
              src={stripUrl}
              alt="Photo booth strip"
              className="final-strip-img animate-float"
            />
          ) : (
            <div className="pooky-alert error-message">Failed to generate strip. Please try again.</div>
          )}
        </div>

        {/* Right Column: Actions & Retakes */}
        <div className="preview-actions-panel glass-panel">
          <div className="panel-section">
            <h3>Download Strip 💾</h3>
            <Button
              onClick={handleDownload}
              variant="secondary"
              size="lg"
              className="w-full download-btn"
              disabled={!stripUrl}
            >
              Download PNG File 📥
            </Button>
          </div>

          <div className="panel-section">
            <h3>Retake Specific Slots 📸</h3>
            <p className="section-help-text">Click on any photo frame below to retake that specific shot.</p>
            
            <div className="retake-slots-grid">
              {photos.map((src, index) => (
                <div
                  key={index}
                  className="retake-slot-card"
                  onClick={() => handleRetakeSpecific(index)}
                  title={`Retake Photo ${index + 1}`}
                >
                  <img src={src} alt={`Slot ${index + 1}`} className="retake-slot-thumbnail" />
                  <div className="retake-slot-overlay">
                    <span>Retake #{index + 1} 🔄</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-section row-gap-sm">
            <h3>Start Over 🚪</h3>
            <div className="action-buttons-row">
              <Button onClick={handleRetakeAll} variant="yellow" className="flex-1">
                Retake All Photos 🔄
              </Button>
              <Button onClick={handleStartOver} variant="outline" className="flex-1">
                Start New Session 🏠
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripPreview;
