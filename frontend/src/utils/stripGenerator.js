import { BORDER_DESIGNS } from '../styles/borderDesigns';
import { STRIP_DIMENSIONS } from '../styles/stripStyles';

/**
 * Helper to load an image asynchronously from a data URL
 * @param {string} src 
 * @returns {Promise<HTMLImageElement>}
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

/**
 * Generates the final photo booth strip using Canvas API.
 * 
 * @param {Array<string>} photos Array of captured photo data URLs
 * @param {Object} customization Current customization parameters
 * @returns {Promise<string>} Resolves to a PNG data URL of the final stitched strip
 */
export const generatePhotoStrip = async (photos, customization) => {
  const { size, layout, style, dateEnabled, text, font } = customization;
  const borderDesign = BORDER_DESIGNS[style] || BORDER_DESIGNS['classic-white'];
  
  // 1. Calculate dimensions
  const isGrid = layout === 'grid';
  const width = isGrid ? STRIP_DIMENSIONS.gridWidth : STRIP_DIMENSIONS.width;
  const padding = STRIP_DIMENSIONS.padding;
  const gap = STRIP_DIMENSIONS.gap;
  const footerHeight = STRIP_DIMENSIONS.footerHeight;

  // Compute positions of each photo frame in the strip
  const photoRects = [];
  let totalHeight = 0;

  if (isGrid) {
    // 2-column Grid layout (2x2, 2x3, etc.)
    const cols = 2;
    const rows = Math.ceil(size / cols);
    const photoWidth = (width - (padding * 2) - gap) / cols;
    const photoHeight = photoWidth * (2 / 3); // Maintain 3:2 aspect ratio

    for (let i = 0; i < size; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = padding + col * (photoWidth + gap);
      const y = padding + row * (photoHeight + gap);
      photoRects.push({ x, y, w: photoWidth, h: photoHeight });
    }

    totalHeight = padding * 2 + rows * photoHeight + (rows - 1) * gap + footerHeight;
  } else {
    // Classic single-column vertical layout
    const photoWidth = width - padding * 2;
    const photoHeight = photoWidth * (2 / 3); // 3:2 aspect ratio

    for (let i = 0; i < size; i++) {
      const x = padding;
      const y = padding + i * (photoHeight + gap);
      photoRects.push({ x, y, w: photoWidth, h: photoHeight });
    }

    totalHeight = padding * 2 + size * photoHeight + (size - 1) * gap + footerHeight;
  }

  // 2. Initialize Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create 2D canvas context');
  }

  // 3. Draw Border Background and custom margin details
  borderDesign.drawBorder(ctx, width, totalHeight, photoRects);

  // 4. Draw Captured Photo Frames
  const loadedImages = await Promise.all(photos.map((src) => loadImage(src)));
  
  photoRects.forEach((rect, idx) => {
    const img = loadedImages[idx];
    if (img) {
      ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
    }
  });

  // 5. Draw Footer Text
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = borderDesign.textColor;

  // Select canvas font family based on customization option
  let canvasFont = 'bold 24px "Outfit", sans-serif';
  if (font === 'font-cute') {
    canvasFont = 'bold 28px "Fredoka", sans-serif';
  } else if (font === 'font-handwritten') {
    canvasFont = '32px "Pacifico", cursive';
  } else if (font === 'font-retro') {
    canvasFont = 'bold 22px "Space Mono", monospace';
  }

  const footerCenterY = totalHeight - footerHeight / 2;

  if (text) {
    if (dateEnabled) {
      // Draw text and date together (stacked)
      ctx.font = canvasFont;
      ctx.fillText(text, width / 2, footerCenterY - 10);

      ctx.font = '14px "Space Mono", monospace';
      ctx.fillStyle = borderDesign.textColor + 'cc'; // Slightly transparent
      const dateString = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      ctx.fillText(dateString, width / 2, footerCenterY + 20);
    } else {
      // Draw text centered
      ctx.font = canvasFont;
      ctx.fillText(text, width / 2, footerCenterY + 8);
    }
  } else if (dateEnabled) {
    // Only draw date
    ctx.font = '16px "Space Mono", monospace';
    const dateString = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    ctx.fillText(dateString, width / 2, footerCenterY + 8);
  }

  ctx.restore();

  // Return final PNG base64 string
  return canvas.toDataURL('image/png');
};
