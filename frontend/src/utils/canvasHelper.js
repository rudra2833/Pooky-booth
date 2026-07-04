/**
 * Captures a single combined photo frame from both leader and partner video elements.
 * The left half represents the leader's feed, and the right half represents the partner's feed.
 * 
 * @param {HTMLVideoElement} leaderVideo 
 * @param {HTMLVideoElement} partnerVideo 
 * @param {number} width Width of the composite frame (default 600)
 * @param {number} height Height of the composite frame (default 400)
 * @returns {string|null} Data URL of the composite image
 */
export const captureSplitFrame = (leaderVideo, partnerVideo, width = 600, height = 400) => {
  if (!leaderVideo || !partnerVideo) {
    console.error('Cannot capture frame: video elements missing');
    return null;
  }

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // Clear background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const halfWidth = width / 2;

  // Helper to draw a video stream crop (with horizontal reflection for natural selfie)
  const drawVideoHalf = (video, isLeft) => {
    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;

    // Calculate source crop to match destination 3:4 aspect ratio centered (object-fit: cover behavior)
    const targetAspect = halfWidth / height; // 300/400 = 0.75
    const videoAspect = vWidth / vHeight;

    let sWidth, sHeight, sx, sy;

    if (videoAspect > targetAspect) {
      // Video is wider than 3:4 (standard landscape camera)
      sHeight = vHeight;
      sWidth = vHeight * targetAspect;
      sx = (vWidth - sWidth) / 2;
      sy = 0;
    } else {
      // Video is taller than 3:4
      sWidth = vWidth;
      sHeight = vWidth / targetAspect;
      sx = 0;
      sy = (vHeight - sHeight) / 2;
    }

    ctx.save();

    if (isLeft) {
      // LEADER (Left Half of canvas)
      // Mirror the feed
      ctx.translate(halfWidth, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(
        video,
        sx, sy, sWidth, sHeight,
        0, 0, halfWidth, height
      );
    } else {
      // PARTNER (Right Half of canvas)
      // Mirror the feed
      ctx.translate(width, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(
        video,
        sx, sy, sWidth, sHeight,
        0, 0, halfWidth, height
      );
    }

    ctx.restore();
  };

  try {
    // 1. Draw Leader's left half crop
    drawVideoHalf(leaderVideo, true);

    // 2. Draw Partner's right half crop
    drawVideoHalf(partnerVideo, false);

    // Export image as high-quality JPEG data URL
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (err) {
    console.error('Error drawing composite frame:', err);
    return null;
  }
};
