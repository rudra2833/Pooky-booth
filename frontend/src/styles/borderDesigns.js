// Helper to draw a heart shape on canvas
const drawHeart = (ctx, x, y, size, color) => {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.moveTo(0, -size / 4);
  ctx.bezierCurveTo(-size / 2, -size / 2, -size, -size / 4, -size, size / 4);
  ctx.bezierCurveTo(-size, size * 0.7, 0, size, 0, size * 1.15);
  ctx.bezierCurveTo(0, size, size, size * 0.7, size, size / 4);
  ctx.bezierCurveTo(size, -size / 4, size / 2, -size / 2, 0, -size / 4);
  ctx.fill();
  ctx.restore();
};

// Helper to draw a real butterfly on canvas
const drawButterfly = (ctx, x, y, size, color) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.beginPath();
  // Upper left wing
  ctx.bezierCurveTo(-size/8, -size/8, -size, -size, -size, -size/2);
  ctx.bezierCurveTo(-size, 0, -size/4, 0, 0, 0);
  // Lower left wing
  ctx.bezierCurveTo(-size/8, size/8, -size*0.7, size*0.7, -size*0.6, size*0.3);
  ctx.bezierCurveTo(-size*0.5, 0, -size/4, 0, 0, 0);
  // Upper right wing
  ctx.bezierCurveTo(size/8, -size/8, size, -size, size, -size/2);
  ctx.bezierCurveTo(size, 0, size/4, 0, 0, 0);
  // Lower right wing
  ctx.bezierCurveTo(size/8, size/8, size*0.7, size*0.7, size*0.6, size*0.3);
  ctx.bezierCurveTo(size*0.5, 0, size/4, 0, 0, 0);
  ctx.fill();
  ctx.restore();
};

// Helper to draw a grid pattern background
const drawGridPattern = (ctx, w, h, size, color) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += size) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += size) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
};

// Helper to draw a star shape on canvas
const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius, color) => {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  ctx.fillStyle = color;

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Helper to draw a snowflake on canvas
const drawSnowflake = (ctx, x, y, size, color) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    ctx.moveTo(x, y);
    const angle = (i * Math.PI) / 3;
    const px = x + Math.cos(angle) * size;
    const py = y + Math.sin(angle) * size;
    ctx.lineTo(px, py);
    
    // Draw branches
    const bx1 = x + Math.cos(angle) * (size * 0.6);
    const by1 = y + Math.sin(angle) * (size * 0.6);
    ctx.moveTo(bx1, by1);
    ctx.lineTo(bx1 + Math.cos(angle + 0.5) * (size * 0.3), by1 + Math.sin(angle + 0.5) * (size * 0.3));
    ctx.moveTo(bx1, by1);
    ctx.lineTo(bx1 + Math.cos(angle - 0.5) * (size * 0.3), by1 + Math.sin(angle - 0.5) * (size * 0.3));
  }
  ctx.stroke();
  ctx.restore();
};

// Helper to draw a cherry blossom flower on canvas
const drawFlower5Petal = (ctx, cx, cy, size, petalColor, centerColor) => {
  ctx.save();
  ctx.fillStyle = petalColor;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const angle = (i * 2 * Math.PI) / 5;
    const px = cx + Math.cos(angle) * (size * 0.6);
    const py = cy + Math.sin(angle) * (size * 0.6);
    ctx.arc(px, py, size * 0.5, 0, 2 * Math.PI);
    ctx.fill();
  }
  // Center
  ctx.beginPath();
  ctx.fillStyle = centerColor;
  ctx.arc(cx, cy, size * 0.3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
};

export const BORDER_DESIGNS = {
  'classic-white': {
    name: 'Classic White',
    class: 'border-classic-white',
    background: '#ffffff',
    textColor: '#333333',
    borderColor: '#e5e5e5',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      
      // Draw sub-borders around each photo frame
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'pink-grid': {
    name: 'Pink Grid 🍥',
    class: 'border-pink-grid',
    background: '#ffeef2',
    textColor: '#ff6b9d',
    borderColor: '#ffccd8',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#ffeef2';
      ctx.fillRect(0, 0, w, h);
      drawGridPattern(ctx, w, h, 20, 'rgba(255, 107, 157, 0.15)');
      for (let y = 30; y < h; y += 120) {
        drawHeart(ctx, 22, y, 8, '#ff6b9d');
        drawHeart(ctx, w - 22, y + 60, 6, '#ff9ebb');
      }
      ctx.strokeStyle = '#ffccd8';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'blue-grid': {
    name: 'Blue Grid 💙',
    class: 'border-blue-grid',
    background: '#f0f9ff',
    textColor: '#0284c7',
    borderColor: '#bae6fd',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(0, 0, w, h);
      drawGridPattern(ctx, w, h, 20, 'rgba(14, 165, 233, 0.12)');
      for (let y = 30; y < h; y += 100) {
        drawStar(ctx, 20, y, 4, 6, 2.5, '#0284c7');
        drawStar(ctx, w - 20, y + 50, 4, 5, 2, '#38bdf8');
      }
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'mint-grid': {
    name: 'Mint Grid 🌿',
    class: 'border-mint-grid',
    background: '#f0fdf4',
    textColor: '#16a34a',
    borderColor: '#bbf7d0',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#f0fdf4';
      ctx.fillRect(0, 0, w, h);
      drawGridPattern(ctx, w, h, 20, 'rgba(22, 163, 74, 0.08)');
      for (let y = 40; y < h; y += 120) {
        drawFlower5Petal(ctx, 20, y, 6, '#86efac', '#eab308');
        drawFlower5Petal(ctx, w - 20, y + 60, 6, '#ffffff', '#eab308');
      }
      ctx.strokeStyle = '#bbf7d0';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'butterfly-magic': {
    name: 'Butterfly Magic 🦋',
    class: 'border-butterfly-magic',
    background: '#faf5ff',
    textColor: '#9333ea',
    borderColor: '#e9d5ff',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#faf5ff';
      ctx.fillRect(0, 0, w, h);
      drawGridPattern(ctx, w, h, 20, 'rgba(147, 51, 234, 0.08)');
      for (let y = 40; y < h; y += 120) {
        drawButterfly(ctx, 20, y, 8, '#c084fc');
        drawButterfly(ctx, w - 20, y + 60, 6, '#d8b4fe');
      }
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'winter-snow': {
    name: 'Winter Snow ❄️',
    class: 'border-winter-snow',
    background: '#f0f9ff',
    textColor: '#0369a1',
    borderColor: '#e0f2fe',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(0, 0, w, h);
      drawGridPattern(ctx, w, h, 20, 'rgba(3, 105, 161, 0.06)');
      for (let y = 30; y < h; y += 90) {
        drawSnowflake(ctx, 20, y, 6, '#0284c7');
        drawSnowflake(ctx, w - 20, y + 45, 6, '#38bdf8');
      }
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'vintage-film': {
    name: 'Vintage Film',
    class: 'border-vintage-film',
    background: '#1a1a1a',
    textColor: '#ffffff',
    borderColor: '#333333',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, w, h);

      // Draw film sprocket holes on left and right borders
      ctx.fillStyle = '#ffffff';
      const holeW = 12;
      const holeH = 18;
      const step = 40;
      
      // Left side holes
      for (let y = 20; y < h - 40; y += step) {
        ctx.fillRect(10, y, holeW, holeH);
      }
      // Right side holes
      for (let y = 20; y < h - 40; y += step) {
        ctx.fillRect(w - 10 - holeW, y, holeW, holeH);
      }

      // Draw thin grey border around photos
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4);
      });
    }
  },
  'pink-pooky': {
    name: 'Pink Pooky 💖',
    class: 'border-pink-pooky',
    background: '#ffd2e1',
    textColor: '#ff4b72',
    borderColor: '#ff8fa3',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#ffd2e1';
      ctx.fillRect(0, 0, w, h);

      // Draw small hearts and stars in the margins
      for (let y = 30; y < h; y += 120) {
        drawHeart(ctx, 22, y, 10, '#ff4b72');
        drawStar(ctx, w - 22, y + 50, 5, 8, 4, '#fff9a6');
        drawHeart(ctx, w - 22, y + 100, 7, '#ff8fa3');
        drawStar(ctx, 22, y + 70, 5, 6, 3, '#ffffff');
      }

      ctx.strokeStyle = '#ff8fa3';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'pastel-rainbow': {
    name: 'Pastel Rainbow',
    class: 'border-pastel-rainbow',
    background: 'linear-gradient(135deg, #ffd6e8, #d9f2ff, #e2ffd6, #fffed6)',
    textColor: '#6b7280',
    borderColor: '#ffffff',
    drawBorder: (ctx, w, h, photoRects) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ffd6e8');
      grad.addColorStop(0.3, '#d9f2ff');
      grad.addColorStop(0.6, '#e2ffd6');
      grad.addColorStop(1, '#fffed6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'retro-90s': {
    name: 'Retro 90s 👾',
    class: 'border-retro-90s',
    background: '#fef08a',
    textColor: '#06b6d4',
    borderColor: '#473c4f',
    drawBorder: (ctx, w, h, photoRects) => {
      // 90s geometric pattern background
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#473c4f';
      ctx.lineWidth = 2;

      // Draw squiggles and shapes in margins
      ctx.fillStyle = '#ff8fa3';
      // Triangle
      ctx.beginPath();
      ctx.moveTo(10, 40); ctx.lineTo(25, 20); ctx.lineTo(35, 45);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#a5f3fc';
      // Circle
      ctx.beginPath();
      ctx.arc(w - 20, 80, 10, 0, 2 * Math.PI);
      ctx.fill(); ctx.stroke();

      // Squiggles in margins
      for (let y = 150; y < h - 100; y += 200) {
        ctx.strokeStyle = '#d8b4fe';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.bezierCurveTo(20, y - 10, 20, y + 10, 30, y);
        ctx.stroke();

        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(w - 30, y + 50);
        ctx.bezierCurveTo(w - 20, y + 40, w - 20, y + 60, w - 10, y + 50);
        ctx.stroke();
      }

      ctx.strokeStyle = '#473c4f';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'floral-garden': {
    name: 'Floral Garden 🌸',
    class: 'border-floral-garden',
    background: '#f0fdf4',
    textColor: '#15803d',
    borderColor: '#bbf7d0',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#f0fdf4';
      ctx.fillRect(0, 0, w, h);

      // Draw small flowers in margins
      for (let y = 40; y < h - 40; y += 110) {
        drawFlower5Petal(ctx, 20, y, 8, '#ffb7c5', '#facc15');
        drawFlower5Petal(ctx, w - 20, y + 50, 8, '#ffffff', '#facc15');
        // Leaf
        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        ctx.ellipse(20, y + 30, 4, 8, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w - 20, y + 20, 4, 8, -Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.strokeStyle = '#bbf7d0';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'starry-night': {
    name: 'Starry Night 🌙',
    class: 'border-starry-night',
    background: '#0c0f26',
    textColor: '#ffd700',
    borderColor: '#1d2756',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#0c0f26';
      ctx.fillRect(0, 0, w, h);

      // Draw yellow crescent moon at top left margin
      ctx.save();
      ctx.beginPath();
      ctx.arc(35, 45, 12, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(28, 41, 12, 0, 2 * Math.PI);
      ctx.fillStyle = '#0c0f26';
      ctx.fill();
      ctx.restore();

      // Scatter tiny gold stars
      for (let y = 30; y < h; y += 70) {
        drawStar(ctx, 18, y, 4, 4, 2, '#ffffff');
        drawStar(ctx, w - 18, y + 30, 4, 4, 2, '#ffd700');
        // Tiny dots
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(24, y + 50, 2, 2);
        ctx.fillRect(w - 24, y + 10, 2, 2);
      }

      ctx.strokeStyle = '#1d2756';
      ctx.lineWidth = 2;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'minimalist-black': {
    name: 'Minimalist Black',
    class: 'border-minimalist-black',
    background: '#121212',
    textColor: '#cccccc',
    borderColor: '#3a3a3a',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 1;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'golden-glamour': {
    name: 'Golden Glamour ✨',
    class: 'border-golden-glamour',
    background: 'linear-gradient(135deg, #2b2518, #18140c)',
    textColor: '#d4af37',
    borderColor: '#d4af37',
    drawBorder: (ctx, w, h, photoRects) => {
      // Dark slate with gold sparkles
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#2b2518');
      grad.addColorStop(1, '#15120a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Gold glitter stars
      for (let y = 30; y < h; y += 90) {
        drawStar(ctx, 20, y, 4, 6, 2, '#d4af37');
        drawStar(ctx, w - 20, y + 45, 4, 8, 3, '#f9e8a2');
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(22, y + 60, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'neon-glow': {
    name: 'Neon Glow ⚡',
    class: 'border-neon-glow',
    background: '#09090b',
    textColor: '#f43f5e',
    borderColor: '#06b6d4',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);

      // Draw glowing lines around frames
      photoRects.forEach(r => {
        // Outer cyan glow
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 6;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        
        // Inner pink glow
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'cute-kawaii': {
    name: 'Cute Kawaii 😽',
    class: 'border-cute-kawaii',
    background: '#fef3c7',
    textColor: '#d97706',
    borderColor: '#fbbf24',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, 0, w, h);

      // Kawaii face doodles in margins
      const drawKawaiiFace = (c, cx, cy) => {
        c.fillStyle = '#473c4f';
        // Eyes
        c.beginPath();
        c.arc(cx - 6, cy, 3, 0, 2 * Math.PI);
        c.arc(cx + 6, cy, 3, 0, 2 * Math.PI);
        c.fill();
        // Blush
        c.fillStyle = '#ff8fa3';
        c.beginPath();
        c.arc(cx - 11, cy + 3, 3, 0, 2 * Math.PI);
        c.arc(cx + 11, cy + 3, 3, 0, 2 * Math.PI);
        c.fill();
        // Mouth
        c.strokeStyle = '#473c4f';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(cx, cy + 1, 3, 0.1, Math.PI - 0.1);
        c.stroke();
      };

      for (let y = 60; y < h - 40; y += 160) {
        drawKawaiiFace(ctx, 22, y);
        drawKawaiiFace(ctx, w - 22, y + 80);
      }

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'christmas-special': {
    name: 'Christmas Special 🎄',
    class: 'border-christmas-special',
    background: '#991b1b',
    textColor: '#fef08a',
    borderColor: '#166534',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(0, 0, w, h);

      // Draw snowflakes
      for (let y = 30; y < h; y += 90) {
        drawSnowflake(ctx, 20, y, 6, '#ffffff');
        drawSnowflake(ctx, w - 20, y + 45, 6, '#ffffff');
        
        // Holly berry dots
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(22, y + 30, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(20, y + 34, 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'birthday-bash': {
    name: 'Birthday Bash 🎂',
    class: 'border-birthday-bash',
    background: '#fffbeb',
    textColor: '#ec4899',
    borderColor: '#ffc5d9',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(0, 0, w, h);

      // Draw confetti pieces in margins
      const confettiColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#d8b4fe'];
      for (let y = 20; y < h; y += 40) {
        ctx.fillStyle = confettiColors[Math.floor(y / 40) % confettiColors.length];
        // Square confetti
        ctx.fillRect(Math.random() * 15 + 8, y, 4, 6);
        ctx.fillStyle = confettiColors[(Math.floor(y / 40) + 1) % confettiColors.length];
        ctx.fillRect(w - (Math.random() * 15 + 12), y + 15, 5, 5);
      }

      ctx.strokeStyle = '#ffc5d9';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'polaroid-style': {
    name: 'Polaroid Style 📸',
    class: 'border-polaroid-style',
    background: '#f8f8f8',
    textColor: '#222222',
    borderColor: '#dedede',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Outer thin polaroid shadow outline
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'aesthetic-purple': {
    name: 'Aesthetic Purple 🦄',
    class: 'border-aesthetic-purple',
    background: '#f3e8ff',
    textColor: '#8b5cf6',
    borderColor: '#d8b4fe',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#f3e8ff';
      ctx.fillRect(0, 0, w, h);

      // Draw butterfly shapes in margins
      const drawButterfly = (c, x, y, color) => {
        c.save();
        c.fillStyle = color;
        c.translate(x, y);
        c.beginPath();
        // Left wings
        c.arc(-4, -3, 5, 0, 2 * Math.PI);
        c.arc(-4, 3, 3, 0, 2 * Math.PI);
        // Right wings
        c.arc(4, -3, 5, 0, 2 * Math.PI);
        c.arc(4, 3, 3, 0, 2 * Math.PI);
        c.fill();
        c.restore();
      };

      for (let y = 40; y < h; y += 120) {
        drawButterfly(ctx, 22, y, '#a78bfa');
        drawButterfly(ctx, w - 22, y + 60, '#c084fc');
      }

      ctx.strokeStyle = '#d8b4fe';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'cherry-blossom': {
    name: 'Cherry Blossom 🌸',
    class: 'border-cherry-blossom',
    background: '#ffe4e6',
    textColor: '#db2777',
    borderColor: '#fda4af',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#ffe4e6';
      ctx.fillRect(0, 0, w, h);

      // Cherry blossoms in margins
      for (let y = 30; y < h; y += 100) {
        drawFlower5Petal(ctx, 20, y, 7, '#fda4af', '#f43f5e');
        drawFlower5Petal(ctx, w - 20, y + 50, 7, '#fcd34d', '#f59e0b');
        // Blossom leaves
        ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
        ctx.beginPath();
        ctx.arc(20, y + 18, 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'ocean-vibes': {
    name: 'Ocean Vibes 🌊',
    class: 'border-ocean-vibes',
    background: 'linear-gradient(180deg, #e0f7fa, #b2ebf2)',
    textColor: '#006064',
    borderColor: '#80deea',
    drawBorder: (ctx, w, h, photoRects) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#e0f7fa');
      grad.addColorStop(1, '#80deea');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Waves and starfish in margins
      for (let y = 40; y < h; y += 140) {
        // Shell or starfish shape
        drawStar(ctx, 20, y, 5, 8, 4, '#ffcc80');
        
        // Wave line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w - 30, y + 40);
        ctx.bezierCurveTo(w - 20, y + 30, w - 20, y + 50, w - 10, y + 40);
        ctx.stroke();
      }

      ctx.strokeStyle = '#80deea';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  },
  'dark-romance': {
    name: 'Dark Romance 🌹',
    class: 'border-dark-romance',
    background: '#110505',
    textColor: '#f43f5e',
    borderColor: '#991b1b',
    drawBorder: (ctx, w, h, photoRects) => {
      ctx.fillStyle = '#110505';
      ctx.fillRect(0, 0, w, h);

      // Draw roses (red spirals) and green leaves
      const drawRose = (c, cx, cy) => {
        c.save();
        // Leaf
        c.fillStyle = '#166534';
        c.beginPath();
        c.ellipse(cx - 6, cy + 4, 3, 7, -Math.PI / 4, 0, 2 * Math.PI);
        c.ellipse(cx + 6, cy - 4, 3, 7, Math.PI / 4, 0, 2 * Math.PI);
        c.fill();
        // Red rose circle
        c.fillStyle = '#991b1b';
        c.beginPath();
        c.arc(cx, cy, 8, 0, 2 * Math.PI);
        c.fill();
        // Inner swirl
        c.strokeStyle = '#f43f5e';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(cx, cy, 4, 0.2, Math.PI + 0.5);
        c.stroke();
        c.restore();
      };

      for (let y = 45; y < h; y += 120) {
        drawRose(ctx, 22, y);
        drawRose(ctx, w - 22, y + 60);
      }

      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
    }
  }
};
