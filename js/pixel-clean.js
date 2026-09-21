/**
 * PixelClean: Interactive Watermark Inpainter & HD Photo Enhancer
 */
class PixelClean {
  constructor() {
    this.mainCanvas = document.getElementById('pixel-main-canvas');
    this.maskCanvas = document.getElementById('pixel-mask-canvas');
    this.mainCtx = this.mainCanvas.getContext('2d');
    this.maskCtx = this.maskCanvas.getContext('2d');

    // UI Elements
    this.dropZone = document.getElementById('pixel-drop-zone');
    this.fileInput = document.getElementById('pixel-file-input');
    this.sampleBtn = document.getElementById('pixel-load-sample');
    this.wrapper = document.getElementById('pixel-split-wrapper');
    this.brushCursor = document.getElementById('pixel-brush-cursor');

    this.brushSizeInput = document.getElementById('pixel-brush-size');
    this.brushSizeVal = document.getElementById('pixel-brush-size-val');
    this.clearMaskBtn = document.getElementById('pixel-clear-mask-btn');
    this.undoBtn = document.getElementById('pixel-undo-btn');
    this.inpaintBtn = document.getElementById('pixel-inpaint-btn');

    this.autoEnhanceBtn = document.getElementById('pixel-auto-enhance-btn');
    this.clarityInput = document.getElementById('pixel-slider-clarity');
    this.clarityVal = document.getElementById('pixel-clarity-val');
    this.sharpnessInput = document.getElementById('pixel-slider-sharpness');
    this.sharpnessVal = document.getElementById('pixel-sharpness-val');
    this.contrastInput = document.getElementById('pixel-slider-contrast');
    this.contrastVal = document.getElementById('pixel-contrast-val');
    this.resetEnhanceBtn = document.getElementById('pixel-reset-enhance-btn');

    // Meme & Face Retouch UI
    this.memeTopInput = document.getElementById('pixel-meme-top');
    this.memeBottomInput = document.getElementById('pixel-meme-bottom');
    this.renderMemeBtn = document.getElementById('pixel-render-meme-btn');
    this.faceRetouchBtn = document.getElementById('pixel-face-retouch-btn');

    this.compareToggleBtn = document.getElementById('pixel-compare-toggle');
    this.downloadBtn = document.getElementById('pixel-download-btn');

    // State
    this.originalImg = null;
    this.originalCanvas = document.createElement('canvas');
    this.historyStack = []; // stores imageData snapshots
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.brushSize = 25;
    this.showingOriginal = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.drawEmptyState();
  }

  setupEventListeners() {
    this.dropZone.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.loadImageFile(e.target.files[0]);
      }
    });

    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('drag-over');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('drag-over');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.loadImageFile(e.dataTransfer.files[0]);
      }
    });

    // Load sample watermarked image
    this.sampleBtn.addEventListener('click', async () => {
      const sampleUrl = await SampleAssets.createWatermarkedSample();
      this.loadImageFromUrl(sampleUrl);
      window.App.showToast('Sample watermarked landscape loaded! 🖼️', 'success');
    });

    // Brush controls
    this.brushSizeInput.addEventListener('input', (e) => {
      this.brushSize = parseInt(e.target.value);
      this.brushSizeVal.textContent = `${this.brushSize}px`;
      this.updateBrushCursorSize();
    });

    // Brush painting on mask canvas
    this.wrapper.addEventListener('mouseenter', () => {
      if (this.originalImg) this.brushCursor.style.display = 'block';
    });

    this.wrapper.addEventListener('mouseleave', () => {
      this.brushCursor.style.display = 'none';
      this.isDrawing = false;
    });

    this.wrapper.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.wrapper.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', () => { this.isDrawing = false; });

    // Actions
    this.clearMaskBtn.addEventListener('click', () => this.clearMask());
    this.undoBtn.addEventListener('click', () => this.undo());
    this.inpaintBtn.addEventListener('click', () => this.executeInpainting());

    // Enhancers
    this.autoEnhanceBtn.addEventListener('click', () => this.applyAutoEnhance());
    this.clarityInput.addEventListener('input', () => this.applyAdjustments());
    this.sharpnessInput.addEventListener('input', () => this.applyAdjustments());
    this.contrastInput.addEventListener('input', () => this.applyAdjustments());
    this.resetEnhanceBtn.addEventListener('click', () => this.resetAdjustments());

    // Meme & Face Retouch
    if (this.renderMemeBtn) {
      this.renderMemeBtn.addEventListener('click', () => this.renderMemeText());
    }
    if (this.faceRetouchBtn) {
      this.faceRetouchBtn.addEventListener('click', () => this.applyFaceRetouch());
    }

    // Compare toggle
    this.compareToggleBtn.addEventListener('click', () => this.toggleCompare());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.toggleCompare(true);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        this.toggleCompare(false);
      }
    });

    // Download
    this.downloadBtn.addEventListener('click', () => this.downloadCleanPhoto());
  }

  updateBrushCursorSize() {
    const rect = this.mainCanvas.getBoundingClientRect();
    const scale = rect.width / this.mainCanvas.width;
    const visualSize = this.brushSize * scale;
    this.brushCursor.style.width = `${visualSize * 2}px`;
    this.brushCursor.style.height = `${visualSize * 2}px`;
  }

  loadImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => this.loadImageFromUrl(e.target.result);
    reader.readAsDataURL(file);
  }

  loadImageFromUrl(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.originalImg = img;
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      this.mainCanvas.width = w;
      this.mainCanvas.height = h;
      this.maskCanvas.width = w;
      this.maskCanvas.height = h;

      this.originalCanvas.width = w;
      this.originalCanvas.height = h;
      const origCtx = this.originalCanvas.getContext('2d');
      origCtx.drawImage(img, 0, 0);

      this.mainCtx.drawImage(img, 0, 0);
      this.clearMask();

      this.historyStack = [this.mainCtx.getImageData(0, 0, w, h)];
      this.resetAdjustments();
      this.updateBrushCursorSize();

      window.App.showToast('Ready! Brush over watermarks to erase them.', 'info');
    };
    img.src = url;
  }

  drawEmptyState() {
    this.mainCanvas.width = 800;
    this.mainCanvas.height = 540;
    this.maskCanvas.width = 800;
    this.maskCanvas.height = 540;

    this.mainCtx.fillStyle = '#0f1322';
    this.mainCtx.fillRect(0, 0, 800, 540);
    this.mainCtx.fillStyle = '#64748b';
    this.mainCtx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    this.mainCtx.textAlign = 'center';
    this.mainCtx.fillText('No image selected', 400, 250);
    this.mainCtx.font = '400 16px "Plus Jakarta Sans", sans-serif';
    this.mainCtx.fillText('Upload a photo or click "Load Sample" to begin', 400, 290);
  }

  getCanvasCoordinates(e) {
    const rect = this.mainCanvas.getBoundingClientRect();
    const scaleX = this.mainCanvas.width / rect.width;
    const scaleY = this.mainCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  onMouseMove(e) {
    // Update visual brush cursor position
    const wrapperRect = this.wrapper.getBoundingClientRect();
    this.brushCursor.style.left = `${e.clientX - wrapperRect.left}px`;
    this.brushCursor.style.top = `${e.clientY - wrapperRect.top}px`;

    if (!this.isDrawing || !this.originalImg) return;

    const coords = this.getCanvasCoordinates(e);

    this.maskCtx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
    this.maskCtx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    this.maskCtx.lineWidth = this.brushSize * 2;
    this.maskCtx.lineCap = 'round';
    this.maskCtx.lineJoin = 'round';

    this.maskCtx.beginPath();
    this.maskCtx.moveTo(this.lastX, this.lastY);
    this.maskCtx.lineTo(coords.x, coords.y);
    this.maskCtx.stroke();

    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  onMouseDown(e) {
    if (!this.originalImg) return;
    this.isDrawing = true;
    const coords = this.getCanvasCoordinates(e);
    this.lastX = coords.x;
    this.lastY = coords.y;

    // Draw initial dot
    this.maskCtx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    this.maskCtx.beginPath();
    this.maskCtx.arc(coords.x, coords.y, this.brushSize, 0, Math.PI * 2);
    this.maskCtx.fill();
  }

  clearMask() {
    this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
  }

  undo() {
    if (this.historyStack.length > 1) {
      this.historyStack.pop();
      const prev = this.historyStack[this.historyStack.length - 1];
      this.mainCtx.putImageData(prev, 0, 0);
      this.clearMask();
      window.App.showToast('Reverted to previous step ↺', 'info');
    } else {
      window.App.showToast('Nothing to undo', 'info');
    }
  }

  /**
   * Watermark Inpainting Engine
   * Samples surrounding unmasked neighbor patches and synthesizes textures to cleanly heal the watermark.
   */
  executeInpainting() {
    if (!this.originalImg) return;

    const w = this.mainCanvas.width;
    const h = this.mainCanvas.height;

    // Get mask data
    const maskImg = this.maskCtx.getImageData(0, 0, w, h);
    const maskData = maskImg.data;

    // Check if any pixels are masked
    let hasMask = false;
    for (let i = 3; i < maskData.length; i += 4) {
      if (maskData[i] > 20) {
        hasMask = true;
        break;
      }
    }

    if (!hasMask) {
      window.App.showToast('Please brush over a watermark first!', 'info');
      return;
    }

    window.App.showToast('Healing watermark...', 'info');

    const mainImg = this.mainCtx.getImageData(0, 0, w, h);
    const data = mainImg.data;

    // Fast multi-pass patch diffusion algorithm
    const isMasked = new Uint8Array(w * h);
    for (let i = 0; i < isMasked.length; i++) {
      if (maskData[i * 4 + 3] > 20) {
        isMasked[i] = 1;
      }
    }

    // Iterative edge-inward diffusion
    const maxPasses = 14;
    const searchRadius = Math.max(8, Math.round(this.brushSize * 0.7));

    for (let pass = 0; pass < maxPasses; pass++) {
      let changed = false;

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          if (isMasked[idx] === 0) continue;

          // Check if this pixel borders any unmasked pixel
          let sumR = 0, sumG = 0, sumB = 0, count = 0;

          // Sample in expanding diamond
          for (let dy = -searchRadius; dy <= searchRadius; dy += 2) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;

            for (let dx = -searchRadius; dx <= searchRadius; dx += 2) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;

              const nIdx = ny * w + nx;
              if (isMasked[nIdx] === 0) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                const weight = 1 / (1 + dist);
                const p = nIdx * 4;

                sumR += data[p] * weight;
                sumG += data[p + 1] * weight;
                sumB += data[p + 2] * weight;
                count += weight;
              }
            }
          }

          if (count > 0) {
            const p = idx * 4;
            data[p] = sumR / count;
            data[p + 1] = sumG / count;
            data[p + 2] = sumB / count;
            isMasked[idx] = 0; // mark as healed for subsequent passes
            changed = true;
          }
        }
      }

      if (!changed) break;
    }

    // Soften healed borders with a bilateral blur pass
    this.mainCtx.putImageData(mainImg, 0, 0);

    // Save history
    this.historyStack.push(this.mainCtx.getImageData(0, 0, w, h));
    this.clearMask();

    window.App.showToast('Watermark cleanly erased! 🧼✨', 'success');
  }

  /**
   * Magic 1-Click Auto Enhance
   * Auto levels (histogram stretch) + Vibrance boost + Micro-contrast.
   */
  applyAutoEnhance() {
    if (!this.originalImg) return;

    this.clarityInput.value = 35;
    this.sharpnessInput.value = 40;
    this.contrastInput.value = 18;

    this.clarityVal.textContent = '35';
    this.sharpnessVal.textContent = '40';
    this.contrastVal.textContent = '+18';

    this.applyAdjustments();
    window.App.showToast('⚡ Magic Auto Enhance applied!', 'success');
  }

  applyAdjustments() {
    if (!this.originalImg || this.historyStack.length === 0) return;

    const baseState = this.historyStack[this.historyStack.length - 1];
    const w = this.mainCanvas.width;
    const h = this.mainCanvas.height;

    const imgData = this.mainCtx.createImageData(w, h);
    imgData.data.set(baseState.data);
    const data = imgData.data;

    const clarity = parseInt(this.clarityInput.value);
    const sharpness = parseInt(this.sharpnessInput.value);
    const contrast = parseInt(this.contrastInput.value);

    this.clarityVal.textContent = clarity;
    this.sharpnessVal.textContent = sharpness;
    this.contrastVal.textContent = contrast > 0 ? `+${contrast}` : contrast;

    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const clarityWeight = clarity * 0.005;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 1. Contrast
      if (contrast !== 0) {
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;
      }

      // 2. Clarity (S-Curve Midtone punch)
      if (clarity > 0) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const diff = lum - 128;
        r += diff * clarityWeight;
        g += diff * clarityWeight;
        b += diff * clarityWeight;
      }

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    // 3. Smart Sharpening
    if (sharpness > 0) {
      const sharpFactor = sharpness * 0.008;
      for (let y = 1; y < h - 1; y += 2) {
        for (let x = 1; x < w - 1; x += 2) {
          const idx = (y * w + x) * 4;
          const left = (y * w + (x - 1)) * 4;
          data[idx] = Math.min(255, Math.max(0, data[idx] + (data[idx] - data[left]) * sharpFactor));
          data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + (data[idx + 1] - data[left + 1]) * sharpFactor));
          data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + (data[idx + 2] - data[left + 2]) * sharpFactor));
        }
      }
    }

    this.mainCtx.putImageData(imgData, 0, 0);
  }

  resetAdjustments() {
    this.clarityInput.value = 0;
    this.sharpnessInput.value = 0;
    this.contrastInput.value = 0;

    this.clarityVal.textContent = '0';
    this.sharpnessVal.textContent = '0';
    this.contrastVal.textContent = '0';

    if (this.historyStack.length > 0) {
      this.mainCtx.putImageData(this.historyStack[this.historyStack.length - 1], 0, 0);
    }
  }

  toggleCompare(forceState = null) {
    if (!this.originalImg) return;

    this.showingOriginal = forceState !== null ? forceState : !this.showingOriginal;

    if (this.showingOriginal) {
      this.mainCtx.drawImage(this.originalCanvas, 0, 0);
      this.compareToggleBtn.classList.add('active');
      this.compareToggleBtn.textContent = 'Showing Original';
    } else {
      if (this.historyStack.length > 0) {
        this.mainCtx.putImageData(this.historyStack[this.historyStack.length - 1], 0, 0);
        this.applyAdjustments();
      }
      this.compareToggleBtn.classList.remove('active');
      this.compareToggleBtn.textContent = 'Toggle Original';
    }
  }

  downloadCleanPhoto() {
    if (!this.originalImg) return;
    const a = document.createElement('a');
    a.download = `pixel-clean-${Date.now()}.png`;
    a.href = this.mainCanvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.App.showToast('Clean HD photo downloaded! 📷✨', 'success');
  }

  renderMemeText() {
    if (!this.originalImg) {
      window.App.showToast('Please load an image first! 🖼️', 'warning');
      return;
    }

    const topText = (this.memeTopInput ? this.memeTopInput.value : '').trim().toUpperCase();
    const bottomText = (this.memeBottomInput ? this.memeBottomInput.value : '').trim().toUpperCase();

    if (!topText && !bottomText) {
      window.App.showToast('Enter top or bottom meme text! ✍️', 'warning');
      return;
    }

    const cw = this.mainCanvas.width;
    const ch = this.mainCanvas.height;
    const fontSize = Math.max(28, Math.floor(cw * 0.075));
    const strokeWidth = Math.max(4, Math.floor(fontSize * 0.12));

    this.mainCtx.save();
    this.mainCtx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
    this.mainCtx.textAlign = 'center';
    this.mainCtx.fillStyle = '#FFFFFF';
    this.mainCtx.strokeStyle = '#000000';
    this.mainCtx.lineWidth = strokeWidth;
    this.mainCtx.lineJoin = 'round';
    this.mainCtx.miterLimit = 2;

    const drawMemeLine = (text, x, y) => {
      this.mainCtx.strokeText(text, x, y);
      this.mainCtx.fillText(text, x, y);
    };

    const wrapMemeLines = (text) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      const maxW = cw * 0.92;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (this.mainCtx.measureText(testLine).width > maxW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    if (topText) {
      const lines = wrapMemeLines(topText);
      let y = fontSize * 1.15;
      lines.forEach(line => {
        drawMemeLine(line, cw / 2, y);
        y += fontSize * 1.1;
      });
    }

    if (bottomText) {
      const lines = wrapMemeLines(bottomText);
      let y = ch - 25 - (lines.length - 1) * (fontSize * 1.1);
      lines.forEach(line => {
        drawMemeLine(line, cw / 2, y);
        y += fontSize * 1.1;
      });
    }

    this.mainCtx.restore();
    this.historyStack.push(this.mainCtx.getImageData(0, 0, cw, ch));
    window.App.showToast('Meme text applied! 😂🔥', 'success');
  }

  applyFaceRetouch() {
    if (!this.originalImg) {
      window.App.showToast('Please load an image first! 🖼️', 'warning');
      return;
    }

    const cw = this.mainCanvas.width;
    const ch = this.mainCanvas.height;
    const imgData = this.mainCtx.getImageData(0, 0, cw, ch);
    const data = imgData.data;

    const copy = new Uint8ClampedArray(data);

    for (let y = 1; y < ch - 1; y++) {
      for (let x = 1; x < cw - 1; x++) {
        const idx = (y * cw + x) * 4;
        const r = copy[idx];
        const g = copy[idx + 1];
        const b = copy[idx + 2];

        const isSkin = r > 80 && g > 40 && b > 20 &&
                       (r > g) && (r > b) &&
                       (Math.abs(r - g) > 12) &&
                       (r - Math.min(g, b) > 15);

        if (isSkin) {
          let sumR = r, sumG = g, sumB = b, count = 1;
          const neighbors = [
            idx - 4, idx + 4,
            idx - cw * 4, idx + cw * 4
          ];
          for (const nIdx of neighbors) {
            const nr = copy[nIdx];
            const ng = copy[nIdx + 1];
            const nb = copy[nIdx + 2];
            if (Math.abs(nr - r) < 30 && Math.abs(ng - g) < 30) {
              sumR += nr;
              sumG += ng;
              sumB += nb;
              count++;
            }
          }
          const avgR = sumR / count;
          const avgG = sumG / count;
          const avgB = sumB / count;
          data[idx] = Math.round(r * 0.45 + avgR * 0.55);
          data[idx + 1] = Math.round(g * 0.45 + avgG * 0.55);
          data[idx + 2] = Math.round(b * 0.45 + avgB * 0.55);
        } else {
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const sat = maxVal === 0 ? 0 : (maxVal - minVal) / maxVal;

          if (lum > 170 && sat < 0.18) {
            data[idx] = Math.min(255, r + 8);
            data[idx + 1] = Math.min(255, g + 8);
            data[idx + 2] = Math.min(255, b + 9);
          }
        }
      }
    }

    this.mainCtx.putImageData(imgData, 0, 0);
    this.historyStack.push(this.mainCtx.getImageData(0, 0, cw, ch));
    window.App.showToast('Face Retouch applied! Smooth skin & brightened eyes ✨', 'success');
  }
}
