import React from 'react';
import { BORDER_DESIGNS } from '../../styles/borderDesigns';
import './Customizer.css';

const StylePreview = ({ customization }) => {
  const { size, layout, style, dateEnabled, text, font } = customization;
  const borderStyle = BORDER_DESIGNS[style] || BORDER_DESIGNS['classic-white'];

  // Generate an array of photo indices to render
  const photoSlots = Array.from({ length: size }, (_, i) => i);

  // Formatted date string
  const currentDateString = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Check if we need special decorative elements in the HTML preview
  const isVintageFilm = style === 'vintage-film';
  const isPinkPooky = style === 'pink-pooky' || style === 'pink-grid';
  const isRetro90s = style === 'retro-90s';
  const isFloral = style === 'floral-garden' || style === 'mint-grid';
  const isStarry = style === 'starry-night' || style === 'blue-grid';
  const isKawaii = style === 'cute-kawaii';
  const isChristmas = style === 'christmas-special' || style === 'winter-snow';
  const isBirthday = style === 'birthday-bash';
  const isAestheticPurple = style === 'aesthetic-purple' || style === 'butterfly-magic';
  const isCherryBlossom = style === 'cherry-blossom';
  const isOcean = style === 'ocean-vibes';
  const isDarkRomance = style === 'dark-romance';

  return (
    <div className="preview-container">
      <h3 className="preview-heading">Live Preview 📸</h3>
      <p className="preview-subtitle">Updated in real-time</p>

      {/* The Simulated Photo Strip */}
      <div
        className={`strip-preview-wrapper ${layout === 'grid' ? 'layout-grid' : 'layout-vertical'} border-${style}`}
        style={{
          background: borderStyle.background,
          color: borderStyle.textColor,
          boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
        }}
      >
        {/* Sprocket holes decoration for vintage film */}
        {isVintageFilm && (
          <>
            <div className="sprockets sprockets-left">
              {Array.from({ length: size * 3 }).map((_, i) => <div key={i} className="sprocket-hole" />)}
            </div>
            <div className="sprockets sprockets-right">
              {Array.from({ length: size * 3 }).map((_, i) => <div key={i} className="sprocket-hole" />)}
            </div>
          </>
        )}

        {/* Small floating decor icons in CSS to match style */}
        {isPinkPooky && <span className="floating-decor d1">💖</span>}
        {isPinkPooky && <span className="floating-decor d2">✨</span>}
        {isPinkPooky && <span className="floating-decor d3">💖</span>}
        
        {isStarry && <span className="floating-decor d1">🌙</span>}
        {isStarry && <span className="floating-decor d2">⭐</span>}
        {isStarry && <span className="floating-decor d3">⭐</span>}

        {isRetro90s && <span className="floating-decor d1">🔺</span>}
        {isRetro90s && <span className="floating-decor d2">🌀</span>}

        {isFloral && <span className="floating-decor d1">🌸</span>}
        {isFloral && <span className="floating-decor d2">🌿</span>}

        {isKawaii && <span className="floating-decor d1">🐱</span>}
        {isKawaii && <span className="floating-decor d2">🎀</span>}

        {isChristmas && <span className="floating-decor d1">❄️</span>}
        {isChristmas && <span className="floating-decor d2">🎄</span>}

        {isBirthday && <span className="floating-decor d1">🎈</span>}
        {isBirthday && <span className="floating-decor d2">🎉</span>}

        {isAestheticPurple && <span className="floating-decor d1">🦋</span>}
        {isAestheticPurple && <span className="floating-decor d2">🦋</span>}

        {isCherryBlossom && <span className="floating-decor d1">🌸</span>}
        {isCherryBlossom && <span className="floating-decor d2">🌸</span>}

        {isOcean && <span className="floating-decor d1">🐚</span>}
        {isOcean && <span className="floating-decor d2">🌊</span>}

        {isDarkRomance && <span className="floating-decor d1">🌹</span>}
        {isDarkRomance && <span className="floating-decor d2">🥀</span>}

        {/* Photos Grid/Column */}
        <div className={`photo-slots-container slots-${size}`}>
          {photoSlots.map((index) => (
            <div
              key={index}
              className="preview-photo-slot"
              style={{ borderColor: borderStyle.borderColor }}
            >
              {/* Left Side: Leader */}
              <div className="preview-photo-half leader-half">
                <span className="half-label">YOU</span>
                <span className="half-mascot">🐱</span>
              </div>
              {/* Right Side: Partner */}
              <div className="preview-photo-half partner-half">
                <span className="half-label">PARTNER</span>
                <span className="half-mascot">🐶</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Area */}
        <div className={`strip-preview-footer ${font}`}>
          {text ? <p className="footer-custom-text">{text}</p> : <p className="footer-custom-text placeholder-text">Custom Text</p>}
          {dateEnabled && <p className="footer-date-text">{currentDateString}</p>}
        </div>
      </div>
    </div>
  );
};

export default StylePreview;
