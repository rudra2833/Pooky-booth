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

    ctx.save();

    if (isLeft) {
      // LEADER (Left Half of canvas)
      // Standard source crop: left half of the video feed.
      // To mirror it, we translate context, flip coordinates horizontally, and draw.
      ctx.translate(halfWidth, 0);
      ctx.scale(-1, 1);

      // Draw the cropped left half of video onto the flipped left half of canvas
      // Source: X=0, Y=0, W=vWidth/2, H=vHeight
      // Destination: X=0, Y=0, W=halfWidth, H=height
      ctx.drawImage(
        video,
        0, 0, vWidth / 2, vHeight,
        0, 0, halfWidth, height
      );
    } else {
      // PARTNER (Right Half of canvas)
      // Source crop: right half of video feed.
      // To mirror it, we translate context, flip coordinates horizontally, and draw.
      ctx.translate(width, 0);
      ctx.scale(-1, 1);

      // Draw cropped right half of video onto flipped right half of canvas
      // Source: X=vWidth/2, Y=0, W=vWidth/2, H=vHeight
      // Destination: X=0, Y=0, W=halfWidth, H=height
      ctx.drawImage(
        video,
        vWidth / 2, 0, vWidth / 2, vHeight,
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
