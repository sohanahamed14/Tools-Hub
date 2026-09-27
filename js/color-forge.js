/**
 * ColorForge: Brand Palette Extractor & Gradient Generator
 * Upload an image → extract dominant colors → generate palettes, harmonies,
 * gradient CSS, and exportable brand kit cards. 100% Canvas pixel sampling.
 */
class ColorForge {
  constructor() {
    this.dropZone = document.getElementById('color-drop-zone');
    this.fileInput = document.getElementById('color-file-input');
    this.paletteGrid = document.getElementById('color-palette-grid');
    this.gradientPreview = document.getElementById('color-gradient-preview');
    this.gradientCss = document.getElementById('color-gradient-css');
    this.harmonyGrid = document.getElementById('color-harmony-grid');
    this.copyGradientBtn = document.getElementById('color-copy-gradient');
    this.exportBtn = document.getElementById('color-export-btn');
    this.countSelect = document.getElementById('color-count-select');
    this.paletteLabel = document.getElementById('color-palette-label');
    if (!this.dropZone) return;
    this.extractedColors = [];
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.init();
  }

  init() {
    this.dropZone.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => { if (e.target.files[0]) this.processImage(e.target.files[0]); });
    this.dropZone.addEventListener('dragover', (e) => { e.preventDefault(); this.dropZone.classList.add('drag-over'); });
    this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('drag-over'));
    this.dropZone.addEventListener('drop', (e) => { e.preventDefault(); this.dropZone.classList.remove('drag-over'); if (e.dataTransfer.files[0]) this.processImage(e.dataTransfer.files[0]); });
    if (this.copyGradientBtn) this.copyGradientBtn.addEventListener('click', () => this.copyGradient());
    if (this.exportBtn) this.exportBtn.addEventListener('click', () => this.exportPalette());
    if (this.countSelect) this.countSelect.addEventListener('change', () => { if (this.lastImageData) this.extract(this.lastImageData); });

    // Default demo palette
    this.extractedColors = ['#6C5CE7','#A29BFE','#FD79A8','#FDCB6E','#00CEC9','#55EFC4'];
    this.render();
  }

  processImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 200; // Downsample for speed
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        this.canvas.width = img.width * scale;
        this.canvas.height = img.height * scale;
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        this.lastImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.extract(this.lastImageData);
        this.dropZone.innerHTML = `<span class="drop-zone-checkmark">✅</span><span>Image loaded — ${this.extractedColors.length} colors extracted</span>`;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  extract(imageData) {
    const count = this.countSelect ? parseInt(this.countSelect.value) || 6 : 6;
    const pixels = imageData.data;
    const colorBuckets = {};

    // Quantize to 32 levels per channel for clustering
    for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel
      const r = Math.round(pixels[i] / 32) * 32;
      const g = Math.round(pixels[i+1] / 32) * 32;
      const b = Math.round(pixels[i+2] / 32) * 32;
      const a = pixels[i+3];
      if (a < 128) continue; // Skip transparent
      const key = `${r},${g},${b}`;
      colorBuckets[key] = (colorBuckets[key] || 0) + 1;
    }

    // Sort by frequency, then filter for diversity
    const sorted = Object.entries(colorBuckets)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0].split(',').map(Number));

    const selected = [];
    for (const [r, g, b] of sorted) {
      if (selected.length >= count) break;
      // Ensure minimum color distance from already-selected
      const tooClose = selected.some(s => {
        const dr = s[0] - r, dg = s[1] - g, db = s[2] - b;
        return Math.sqrt(dr*dr + dg*dg + db*db) < 60;
      });
      if (!tooClose) selected.push([r, g, b]);
    }

    // Fallback if not enough diverse colors
    while (selected.length < count && sorted.length > selected.length) {
      selected.push(sorted[selected.length]);
    }

    this.extractedColors = selected.map(([r,g,b]) => this.rgbToHex(r, g, b));
    this.render();
    if (window.App) window.App.showToast(`${this.extractedColors.length} colors extracted! 🎨`, 'success');
  }

  rgbToHex(r, g, b) {
    return '#' + [r,g,b].map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('');
  }

  hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return [r, g, b];
  }

  hexToHsl(hex) {
    let [r, g, b] = this.hexToRgb(hex).map(c => c / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  render() {
    this.renderPalette();
    this.renderGradient();
    this.renderHarmonies();
  }

  renderPalette() {
    if (!this.paletteGrid) return;
    this.paletteGrid.innerHTML = '';
    if (this.paletteLabel) this.paletteLabel.textContent = `${this.extractedColors.length} Colors Extracted`;

    this.extractedColors.forEach(hex => {
      const [h, s, l] = this.hexToHsl(hex);
      const [r, g, b] = this.hexToRgb(hex);
      const card = document.createElement('div');
      card.className = 'color-swatch-card';
      card.style.setProperty('--swatch-color', hex);
      card.innerHTML = `
        <div class="swatch-preview" style="background:${hex}"></div>
        <div class="swatch-info">
          <span class="swatch-hex">${hex.toUpperCase()}</span>
          <span class="swatch-meta">RGB(${r},${g},${b})</span>
          <span class="swatch-meta">HSL(${h}°,${s}%,${l}%)</span>
        </div>
      `;
      card.addEventListener('click', () => {
        navigator.clipboard.writeText(hex.toUpperCase()).then(() => {
          if (window.App) window.App.showToast(`${hex.toUpperCase()} copied! 🎨`, 'success');
        });
      });
      this.paletteGrid.appendChild(card);
    });
  }

  renderGradient() {
    if (!this.gradientPreview || this.extractedColors.length < 2) return;
    const css = `linear-gradient(135deg, ${this.extractedColors.join(', ')})`;
    this.gradientPreview.style.background = css;
    if (this.gradientCss) this.gradientCss.textContent = `background: ${css};`;
  }

  renderHarmonies() {
    if (!this.harmonyGrid || this.extractedColors.length < 1) return;
    this.harmonyGrid.innerHTML = '';
    const base = this.extractedColors[0];
    const [h, s, l] = this.hexToHsl(base);

    const harmonies = [
      { name: 'Complementary', offsets: [0, 180] },
      { name: 'Triadic', offsets: [0, 120, 240] },
      { name: 'Analogous', offsets: [-30, 0, 30] },
      { name: 'Split-Complementary', offsets: [0, 150, 210] },
    ];

    harmonies.forEach(harmony => {
      const row = document.createElement('div');
      row.className = 'harmony-row';
      const label = document.createElement('span');
      label.className = 'harmony-label';
      label.textContent = harmony.name;
      row.appendChild(label);
      const swatches = document.createElement('div');
      swatches.className = 'harmony-swatches';
      harmony.offsets.forEach(offset => {
        const newH = (h + offset + 360) % 360;
        const color = `hsl(${newH}, ${s}%, ${l}%)`;
        const sw = document.createElement('div');
        sw.className = 'harmony-swatch';
        sw.style.background = color;
        sw.title = `HSL(${newH}°, ${s}%, ${l}%)`;
        sw.addEventListener('click', () => {
          navigator.clipboard.writeText(color).then(() => {
            if (window.App) window.App.showToast(`${color} copied!`, 'success');
          });
        });
        swatches.appendChild(sw);
      });
      row.appendChild(swatches);
      this.harmonyGrid.appendChild(row);
    });
  }

  copyGradient() {
    const css = `background: linear-gradient(135deg, ${this.extractedColors.join(', ')});`;
    navigator.clipboard.writeText(css).then(() => {
      if (window.App) window.App.showToast('Gradient CSS copied! 🎨', 'success');
    });
  }

  exportPalette() {
    // Export as a PNG brand palette card
    const c = document.createElement('canvas');
    const w = 800, swH = 120, infoH = 40;
    const cols = this.extractedColors.length;
    c.width = w;
    c.height = swH + infoH + 20;
    const ctx = c.getContext('2d');

    // Background
    ctx.fillStyle = '#0f0f17';
    ctx.fillRect(0, 0, w, c.height);

    // Color swatches
    const colW = w / cols;
    this.extractedColors.forEach((hex, i) => {
      ctx.fillStyle = hex;
      ctx.fillRect(i * colW, 0, colW, swH);
      // Hex label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hex.toUpperCase(), i * colW + colW / 2, swH + 24);
    });

    // Title
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Generated by Tools Hub — ColorForge', w - 12, c.height - 6);

    const link = document.createElement('a');
    link.download = 'brand-palette.png';
    link.href = c.toDataURL('image/png');
    link.click();
    if (window.App) window.App.showToast('Brand palette exported! 📦', 'success');
  }
}
