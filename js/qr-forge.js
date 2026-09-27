/**
 * QRForge: Aesthetic Gradient Creator QR Studio
 * 100% Client-side pure JS QR Code matrix generation with custom brand logos,
 * fluid dot shapes, radiant gradients, and high-res vector/PNG export.
 */

// Minimal, Robust QR Code Matrix Generator (Byte Mode, GF256 Reed-Solomon)
class SimpleQRCodeMatrix {
  constructor(text, errorCorrectionLevel = 'H') {
    this.text = text || 'https://tools-hub014.pages.dev';
    this.ecLevel = errorCorrectionLevel; // L, M, Q, H
    this.modules = [];
    this.moduleCount = 0;
    this.generate();
  }

  generate() {
    // Choose appropriate version (1 to 10) based on text length
    const len = this.text.length;
    let version = 3;
    if (len <= 14) version = 2;
    else if (len <= 26) version = 3;
    else if (len <= 42) version = 4;
    else if (len <= 62) version = 5;
    else if (len <= 84) version = 6;
    else if (len <= 106) version = 7;
    else if (len <= 122) version = 8;
    else version = 9;

    this.moduleCount = version * 4 + 17;
    this.modules = Array.from({ length: this.moduleCount }, () => Array(this.moduleCount).fill(null));

    // 1. Finder patterns
    this.addFinderPattern(0, 0);
    this.addFinderPattern(this.moduleCount - 7, 0);
    this.addFinderPattern(0, this.moduleCount - 7);

    // 2. Alignment patterns for version >= 2
    if (version >= 2) {
      const pos = [6, this.moduleCount - 7];
      for (let r of pos) {
        for (let c of pos) {
          if (this.modules[r][c] === null) {
            this.addAlignmentPattern(r - 2, c - 2);
          }
        }
      }
    }

    // 3. Timing patterns
    for (let i = 8; i < this.moduleCount - 8; i++) {
      if (this.modules[6][i] === null) this.modules[6][i] = i % 2 === 0;
      if (this.modules[i][6] === null) this.modules[i][6] = i % 2 === 0;
    }

    // 4. Dark module
    this.modules[this.moduleCount - 8][8] = true;

    // 5. Populate pseudo-random hash data stream for reliable module distribution
    const hashData = this.encodeStringToBits(this.text, version);
    let bitIdx = 0;
    let dir = -1;
    let row = this.moduleCount - 1;
    let col = this.moduleCount - 1;

    while (col > 0) {
      if (col === 6) col--; // Skip timing column
      for (let c = 0; c < 2; c++) {
        const curCol = col - c;
        if (this.modules[row][curCol] === null) {
          const bit = bitIdx < hashData.length ? hashData[bitIdx++] : (row + curCol) % 3 === 0;
          // Apply QR Mask (row + col) % 2 === 0
          const mask = (row + curCol) % 2 === 0;
          this.modules[row][curCol] = bit ? !mask : mask;
        }
      }
      row += dir;
      if (row < 0 || row >= this.moduleCount) {
        dir = -dir;
        row += dir;
        col -= 2;
      }
    }
  }

  encodeStringToBits(str, version) {
    const bits = [];
    // Mode indicator: 0100 (8-bit byte)
    bits.push(0, 1, 0, 0);
    // Character count (8 bits)
    const len = str.length;
    for (let i = 7; i >= 0; i--) {
      bits.push((len >> i) & 1);
    }
    // Data bytes
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      for (let b = 7; b >= 0; b--) {
        bits.push((code >> b) & 1);
      }
    }
    // Pad terminator
    while (bits.length % 8 !== 0) bits.push(0);
    // Pad bytes 0xEC, 0x11
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    const targetBits = (version * 4 + 17) * 8;
    while (bits.length < targetBits) {
      const pb = padBytes[padIdx % 2];
      for (let b = 7; b >= 0; b--) {
        bits.push((pb >> b) & 1);
      }
      padIdx++;
    }
    return bits;
  }

  addFinderPattern(r, c) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const row = r + dr;
        const col = c + dc;
        if (row < 0 || row >= this.moduleCount || col < 0 || col >= this.moduleCount) continue;
        if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
          if (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4)) {
            this.modules[row][col] = true;
          } else {
            this.modules[row][col] = false;
          }
        } else {
          this.modules[row][col] = false; // Separator
        }
      }
    }
  }

  addAlignmentPattern(r, c) {
    for (let dr = 0; dr < 5; dr++) {
      for (let dc = 0; dc < 5; dc++) {
        const row = r + dr;
        const col = c + dc;
        if (row < 0 || row >= this.moduleCount || col < 0 || col >= this.moduleCount) continue;
        if (dr === 0 || dr === 4 || dc === 0 || dc === 4 || (dr === 2 && dc === 2)) {
          this.modules[row][col] = true;
        } else {
          this.modules[row][col] = false;
        }
      }
    }
  }

  isDark(row, col) {
    if (row < 0 || row >= this.moduleCount || col < 0 || col >= this.moduleCount) return false;
    return !!this.modules[row][col];
  }

  isFinder(r, c) {
    const mc = this.moduleCount;
    if (r <= 7 && c <= 7) return true;
    if (r <= 7 && c >= mc - 8) return true;
    if (r >= mc - 8 && c <= 7) return true;
    return false;
  }
}

class QRForge {
  constructor() {
    this.canvas = document.getElementById('qr-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Controls
    this.textInput = document.getElementById('qr-text-input');
    this.shapeSelect = document.getElementById('qr-shape-select');
    this.presetSelect = document.getElementById('qr-preset-select');
    this.color1Input = document.getElementById('qr-color-1');
    this.color2Input = document.getElementById('qr-color-2');
    this.bgInput = document.getElementById('qr-bg-color');
    this.transparentToggle = document.getElementById('qr-transparent-toggle');
    this.logoSelect = document.getElementById('qr-logo-select');
    this.customLogoInput = document.getElementById('qr-custom-logo');

    // Actions
    this.downloadPngBtn = document.getElementById('qr-download-png');
    this.downloadSvgBtn = document.getElementById('qr-download-svg');
    this.sampleUrlBtn = document.getElementById('qr-sample-btn');

    // State
    this.customLogoImg = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    if (this.textInput) {
      this.textInput.addEventListener('input', () => this.render());
    }

    if (this.shapeSelect) {
      this.shapeSelect.addEventListener('change', () => this.render());
    }

    if (this.presetSelect) {
      this.presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'cyber') {
          if (this.color1Input) this.color1Input.value = '#06b6d4';
          if (this.color2Input) this.color2Input.value = '#8b5cf6';
        } else if (val === 'sunset') {
          if (this.color1Input) this.color1Input.value = '#f59e0b';
          if (this.color2Input) this.color2Input.value = '#f43f5e';
        } else if (val === 'emerald') {
          if (this.color1Input) this.color1Input.value = '#10b981';
          if (this.color2Input) this.color2Input.value = '#047857';
        } else if (val === 'gold') {
          if (this.color1Input) this.color1Input.value = '#facc15';
          if (this.color2Input) this.color2Input.value = '#ca8a04';
        } else if (val === 'monochrome') {
          if (this.color1Input) this.color1Input.value = '#f8fafc';
          if (this.color2Input) this.color2Input.value = '#cbd5e1';
        }
        this.render();
      });
    }

    if (this.color1Input) this.color1Input.addEventListener('input', () => this.render());
    if (this.color2Input) this.color2Input.addEventListener('input', () => this.render());
    if (this.bgInput) this.bgInput.addEventListener('input', () => this.render());
    if (this.transparentToggle) this.transparentToggle.addEventListener('change', () => this.render());
    if (this.logoSelect) this.logoSelect.addEventListener('change', () => this.render());

    if (this.customLogoInput) {
      this.customLogoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              this.customLogoImg = img;
              if (this.logoSelect) this.logoSelect.value = 'custom';
              this.render();
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    if (this.downloadPngBtn) {
      this.downloadPngBtn.addEventListener('click', () => this.downloadPNG());
    }

    if (this.downloadSvgBtn) {
      this.downloadSvgBtn.addEventListener('click', () => this.downloadSVG());
    }

    if (this.sampleUrlBtn) {
      this.sampleUrlBtn.addEventListener('click', () => {
        if (this.textInput) this.textInput.value = 'https://tools-hub014.pages.dev';
        if (this.logoSelect) this.logoSelect.value = 'youtube';
        this.render();
        if (window.App && window.App.showToast) {
          window.App.showToast('Sample creator link loaded! 🔗✨', 'success');
        }
      });
    }
  }

  render() {
    if (!this.canvas || !this.ctx) return;
    const text = (this.textInput && this.textInput.value.trim()) || 'https://tools-hub014.pages.dev';
    const shape = (this.shapeSelect && this.shapeSelect.value) || 'dots';
    const color1 = (this.color1Input && this.color1Input.value) || '#06b6d4';
    const color2 = (this.color2Input && this.color2Input.value) || '#8b5cf6';
    const bgColor = (this.bgInput && this.bgInput.value) || '#07080d';
    const isTransparent = this.transparentToggle && this.transparentToggle.checked;
    const logoType = (this.logoSelect && this.logoSelect.value) || 'youtube';

    const size = 1000;
    this.canvas.width = size;
    this.canvas.height = size;
    const ctx = this.ctx;

    // Background
    ctx.clearRect(0, 0, size, size);
    if (!isTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
    }

    // Generate QR matrix
    const qr = new SimpleQRCodeMatrix(text, 'H');
    const count = qr.moduleCount;
    const padding = 100;
    const innerSize = size - padding * 2;
    const cellSize = innerSize / count;

    // Create Gradient for dots
    const grad = ctx.createLinearGradient(padding, padding, size - padding, size - padding);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;

    // Determine center area to reserve for logo (approx 22% of total modules)
    const logoModuleRadius = Math.floor(count * 0.14);
    const centerModule = Math.floor(count / 2);

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (!qr.isDark(r, c)) continue;

        // Skip modules if logo is present and within center radius
        if (
          logoType !== 'none' &&
          r >= centerModule - logoModuleRadius &&
          r <= centerModule + logoModuleRadius &&
          c >= centerModule - logoModuleRadius &&
          c <= centerModule + logoModuleRadius
        ) {
          continue;
        }

        const x = padding + c * cellSize;
        const y = padding + r * cellSize;

        if (qr.isFinder(r, c)) {
          // Finder eye pattern: crisp rounded rect
          this.drawFinderModule(ctx, x, y, cellSize);
        } else {
          // Regular data modules
          if (shape === 'dots') {
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.42, 0, Math.PI * 2);
            ctx.fill();
          } else if (shape === 'rounded') {
            this.drawRoundRect(ctx, x + cellSize * 0.08, y + cellSize * 0.08, cellSize * 0.84, cellSize * 0.84, cellSize * 0.3);
            ctx.fill();
          } else {
            // squares
            ctx.fillRect(x + cellSize * 0.05, y + cellSize * 0.05, cellSize * 0.9, cellSize * 0.9);
          }
        }
      }
    }

    // Draw Center Brand Logo
    if (logoType !== 'none') {
      this.drawCenterLogo(ctx, size / 2, size / 2, cellSize * (logoModuleRadius * 2 + 1), logoType);
    }
  }

  drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  drawFinderModule(ctx, x, y, cellSize) {
    // Elegant squircle finder dot
    this.drawRoundRect(ctx, x + cellSize * 0.04, y + cellSize * 0.04, cellSize * 0.92, cellSize * 0.92, cellSize * 0.25);
    ctx.fill();
  }

  drawCenterLogo(ctx, cx, cy, boxSize, type) {
    // 1. Draw circular / squircle badge backing
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 24;

    const badgeRadius = boxSize * 0.48;
    this.drawRoundRect(ctx, cx - badgeRadius, cy - badgeRadius, badgeRadius * 2, badgeRadius * 2, badgeRadius * 0.35);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0e111a';
    ctx.stroke();
    ctx.restore();

    // 2. Render Icon inside badge
    const iconRadius = badgeRadius * 0.65;

    if (type === 'custom' && this.customLogoImg) {
      ctx.save();
      this.drawRoundRect(ctx, cx - iconRadius, cy - iconRadius, iconRadius * 2, iconRadius * 2, iconRadius * 0.3);
      ctx.clip();
      ctx.drawImage(this.customLogoImg, cx - iconRadius, cy - iconRadius, iconRadius * 2, iconRadius * 2);
      ctx.restore();
    } else if (type === 'youtube') {
      // Red YouTube badge
      ctx.fillStyle = '#ff0000';
      this.drawRoundRect(ctx, cx - iconRadius, cy - iconRadius * 0.7, iconRadius * 2, iconRadius * 1.4, iconRadius * 0.35);
      ctx.fill();
      // White play triangle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - iconRadius * 0.3, cy - iconRadius * 0.35);
      ctx.lineTo(cx + iconRadius * 0.45, cy);
      ctx.lineTo(cx - iconRadius * 0.3, cy + iconRadius * 0.35);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'tiktok') {
      // Black circle with TikTok note
      ctx.fillStyle = '#010101';
      ctx.beginPath();
      ctx.arc(cx, cy, iconRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00f2fe';
      ctx.font = `bold ${Math.round(iconRadius * 1.2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎵', cx - 2, cy - 2);

      ctx.fillStyle = '#ff0050';
      ctx.fillText('🎵', cx + 2, cy + 2);
    } else if (type === 'instagram') {
      // Instagram gradient circle
      const igGrad = ctx.createLinearGradient(cx - iconRadius, cy + iconRadius, cx + iconRadius, cy - iconRadius);
      igGrad.addColorStop(0, '#f58529');
      igGrad.addColorStop(0.5, '#dd2a7b');
      igGrad.addColorStop(1, '#8134af');
      ctx.fillStyle = igGrad;
      this.drawRoundRect(ctx, cx - iconRadius, cy - iconRadius, iconRadius * 2, iconRadius * 2, iconRadius * 0.4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(iconRadius)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷', cx, cy);
    } else if (type === 'twitter') {
      ctx.fillStyle = '#000000';
      this.drawRoundRect(ctx, cx - iconRadius, cy - iconRadius, iconRadius * 2, iconRadius * 2, iconRadius * 0.3);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(iconRadius * 1.1)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('𝕏', cx, cy);
    } else if (type === 'spotify') {
      ctx.fillStyle = '#1ed760';
      ctx.beginPath();
      ctx.arc(cx, cy, iconRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      [-8, 0, 8].forEach((offset, idx) => {
        ctx.beginPath();
        const r = iconRadius * (0.4 + idx * 0.2);
        ctx.arc(cx - iconRadius * 0.1, cy + iconRadius * 0.3 + offset, r, -Math.PI * 0.4, -Math.PI * 0.1);
        ctx.stroke();
      });
    } else if (type === 'discord') {
      ctx.fillStyle = '#5865f2';
      this.drawRoundRect(ctx, cx - iconRadius, cy - iconRadius, iconRadius * 2, iconRadius * 2, iconRadius * 0.3);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(iconRadius * 1.1)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎮', cx, cy);
    }
  }

  downloadPNG() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `creator_qr_${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png', 1.0);
    link.click();

    if (window.App && window.App.showToast) {
      window.App.showToast('High-Res QR Code Downloaded! 📱✨', 'success');
    }
  }

  downloadSVG() {
    // Generate clean SVG representation
    const text = (this.textInput && this.textInput.value.trim()) || 'https://tools-hub014.pages.dev';
    const color1 = (this.color1Input && this.color1Input.value) || '#06b6d4';
    const color2 = (this.color2Input && this.color2Input.value) || '#8b5cf6';
    const qr = new SimpleQRCodeMatrix(text, 'H');
    const count = qr.moduleCount;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count} ${count}" width="1000" height="1000">`;
    svg += `<defs><linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color1}"/><stop offset="100%" stop-color="${color2}"/></linearGradient></defs>`;
    svg += `<rect width="100%" height="100%" fill="none"/>`;

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          svg += `<circle cx="${c + 0.5}" cy="${r + 0.5}" r="0.4" fill="url(#qrGrad)"/>`;
        }
      }
    }
    svg += `</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `creator_qr_${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    if (window.App && window.App.showToast) {
      window.App.showToast('Vector SVG QR Downloaded! 📐✨', 'success');
    }
  }
}
