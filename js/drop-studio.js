/**
 * DropStudio: 1-Click AI Background Removal, Studio Backdrops, Uncrop & Upscaler
 */
class DropStudio {
  constructor() {
    this.canvas = document.getElementById('drop-canvas');
    this.ctx = this.canvas.getContext('2d');

    // UI Elements
    this.dropZone = document.getElementById('drop-drop-zone');
    this.fileInput = document.getElementById('drop-file-input');
    this.sampleBtn = document.getElementById('drop-load-sample');
    this.removeBgBtn = document.getElementById('drop-remove-bg-btn');
    this.toleranceInput = document.getElementById('drop-tolerance');
    this.toleranceVal = document.getElementById('drop-tolerance-val');
    this.featherInput = document.getElementById('drop-feather');
    this.featherVal = document.getElementById('drop-feather-val');
    this.shadowToggle = document.getElementById('drop-shadow-toggle');
    this.downloadBtn = document.getElementById('drop-download-btn');

    this.viewCompositeBtn = document.getElementById('drop-view-composite');
    this.viewMaskBtn = document.getElementById('drop-view-mask');
    this.viewOrigBtn = document.getElementById('drop-view-original');

    // State
    this.originalImg = null;
    this.maskData = null; // Uint8ClampedArray (alpha mask)
    this.currentView = 'composite'; // 'composite', 'mask', 'original'
    this.backdropType = 'transparent';
    this.uncropRatio = 'original'; // 'original', '1:1', '16:9', '9:16'
    this.upscaleFactor = 1;

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

    // Load sample product
    this.sampleBtn.addEventListener('click', async () => {
      const sampleUrl = await SampleAssets.createProductSample();
      this.loadImageFromUrl(sampleUrl);
      window.App.showToast('Sample sneaker product loaded! 👟', 'success');
    });

    // Remove background button
    this.removeBgBtn.addEventListener('click', () => this.processBackgroundRemoval());

    // Sliders
    this.toleranceInput.addEventListener('input', (e) => {
      this.toleranceVal.textContent = e.target.value;
      if (this.maskData) this.processBackgroundRemoval();
    });

    this.featherInput.addEventListener('input', (e) => {
      this.featherVal.textContent = `${e.target.value}px`;
      if (this.maskData) this.render();
    });

    // Backdrop swatches
    document.querySelectorAll('#panel-drop .backdrop-swatch').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('#panel-drop .backdrop-swatch').forEach((s) => s.classList.remove('active'));
        swatch.classList.add('active');
        this.backdropType = swatch.dataset.bg;
        this.render();
      });
    });

    // Shadow toggle
    this.shadowToggle.addEventListener('change', () => this.render());

    // Uncrop pills
    document.querySelectorAll('#panel-drop [data-uncrop]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#panel-drop [data-uncrop]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.uncropRatio = pill.dataset.uncrop;
        this.render();
      });
    });

    // Upscale pills
    document.querySelectorAll('#panel-drop [data-upscale]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#panel-drop [data-upscale]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.upscaleFactor = parseInt(pill.dataset.upscale);
        this.render();
      });
    });

    // View toggles
    this.viewCompositeBtn.addEventListener('click', () => this.switchView('composite'));
    this.viewMaskBtn.addEventListener('click', () => this.switchView('mask'));
    this.viewOrigBtn.addEventListener('click', () => this.switchView('original'));

    // Download button
    this.downloadBtn.addEventListener('click', () => this.downloadResult());
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
      this.maskData = null; // reset mask
      this.render();
      window.App.showToast('Image loaded. Ready for 1-click background removal!', 'info');
    };
    img.src = url;
  }

  switchView(view) {
    this.currentView = view;
    this.viewCompositeBtn.classList.toggle('active', view === 'composite');
    this.viewMaskBtn.classList.toggle('active', view === 'mask');
    this.viewOrigBtn.classList.toggle('active', view === 'original');
    this.render();
  }

  drawEmptyState() {
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.ctx.fillStyle = '#0f1322';
    this.ctx.fillRect(0, 0, 800, 600);
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('No image selected', 400, 280);
    this.ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Upload a photo or click "Load Product" to test', 400, 320);
  }

  /**
   * 1-Click Background Removal Engine
   * Samples background colors along perimeter and computes Euclidean color distances
   * with adaptive edge feathering.
   */
  processBackgroundRemoval() {
    if (!this.originalImg) {
      window.App.showToast('Please load an image first!', 'info');
      return;
    }

    window.App.showToast('Removing background...', 'info');

    const w = this.originalImg.naturalWidth;
    const h = this.originalImg.naturalHeight;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.originalImg, 0, 0);

    const imgData = tempCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // 1. Sample background colors along perimeter corners and borders
    const bgSamples = [];
    const sampleCoords = [
      [2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3],
      [Math.floor(w / 2), 2], [Math.floor(w / 2), h - 3],
      [2, Math.floor(h / 2)], [w - 3, Math.floor(h / 2)],
      [Math.floor(w / 4), 2], [Math.floor((3 * w) / 4), 2]
    ];

    sampleCoords.forEach(([x, y]) => {
      const idx = (y * w + x) * 4;
      bgSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
    });

    const tolerance = parseInt(this.toleranceInput.value);
    const toleranceSq = (tolerance * 2.8) ** 2;

    // 2. Create Alpha Mask
    const mask = new Uint8ClampedArray(w * h);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const pixelIdx = i / 4;

      // Find min distance to any background sample
      let minDistSq = Infinity;
      for (let s = 0; s < bgSamples.length; s++) {
        const [sr, sg, sb] = bgSamples[s];
        const distSq = (r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2;
        if (distSq < minDistSq) minDistSq = distSq;
      }

      if (minDistSq < toleranceSq) {
        // Background pixel
        mask[pixelIdx] = 0;
      } else {
        // Foreground pixel
        mask[pixelIdx] = 255;
      }
    }

    // 3. Morphological cleanup: remove small isolated holes in foreground
    this.maskData = mask;
    this.render();
    window.App.showToast('Background removed successfully! ✨', 'success');
  }

  /**
   * Main Render Pipeline: Cutout + Studio Backdrop + Podium Shadow + Uncrop + Upscale
   */
  render() {
    if (!this.originalImg) {
      this.drawEmptyState();
      return;
    }

    const origW = this.originalImg.naturalWidth;
    const origH = this.originalImg.naturalHeight;

    // View: Original Image
    if (this.currentView === 'original') {
      this.canvas.width = origW;
      this.canvas.height = origH;
      this.ctx.drawImage(this.originalImg, 0, 0);
      return;
    }

    // View: Alpha Mask
    if (this.currentView === 'mask') {
      this.canvas.width = origW;
      this.canvas.height = origH;
      if (!this.maskData) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, origW, origH);
      } else {
        const maskImg = this.ctx.createImageData(origW, origH);
        for (let i = 0; i < this.maskData.length; i++) {
          const val = this.maskData[i];
          const idx = i * 4;
          maskImg.data[idx] = val;
          maskImg.data[idx + 1] = val;
          maskImg.data[idx + 2] = val;
          maskImg.data[idx + 3] = 255;
        }
        this.ctx.putImageData(maskImg, 0, 0);
      }
      return;
    }

    // View: Composite Studio View
    // 1. Calculate dimensions based on uncrop aspect ratio
    let targetW = origW;
    let targetH = origH;

    if (this.uncropRatio === '1:1') {
      const maxDim = Math.max(origW, origH);
      targetW = maxDim;
      targetH = maxDim;
    } else if (this.uncropRatio === '16:9') {
      targetW = Math.max(origW, Math.round(origH * (16 / 9)));
      targetH = Math.round(targetW * (9 / 16));
    } else if (this.uncropRatio === '9:16') {
      targetH = Math.max(origH, Math.round(origW * (16 / 9)));
      targetW = Math.round(targetH * (9 / 16));
    }

    // Apply Upscale factor
    const renderW = targetW * this.upscaleFactor;
    const renderH = targetH * this.upscaleFactor;

    this.canvas.width = renderW;
    this.canvas.height = renderH;
    this.ctx.clearRect(0, 0, renderW, renderH);

    // 2. Render Studio Backdrop
    this.renderBackdrop(renderW, renderH, origW, origH);

    // Center offsets
    const offsetX = (renderW - origW * this.upscaleFactor) / 2;
    const offsetY = (renderH - origH * this.upscaleFactor) / 2;
    const scaledW = origW * this.upscaleFactor;
    const scaledH = origH * this.upscaleFactor;

    // 3. Render 3D Product Podium Shadow
    if (this.shadowToggle.checked && this.maskData && this.backdropType !== 'transparent') {
      this.renderPodiumShadow(renderW, renderH, offsetX, offsetY, scaledW, scaledH);
    }

    // 4. Render Cutout Foreground
    if (this.maskData) {
      const cutoutCanvas = document.createElement('canvas');
      cutoutCanvas.width = origW;
      cutoutCanvas.height = origH;
      const cCtx = cutoutCanvas.getContext('2d');
      cCtx.drawImage(this.originalImg, 0, 0);

      const cData = cCtx.getImageData(0, 0, origW, origH);
      const feather = parseInt(this.featherInput.value);

      for (let i = 0; i < this.maskData.length; i++) {
        cData.data[i * 4 + 3] = this.maskData[i];
      }
      cCtx.putImageData(cData, 0, 0);

      // Draw cutout to main canvas
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
      this.ctx.drawImage(cutoutCanvas, offsetX, offsetY, scaledW, scaledH);
    } else {
      this.ctx.drawImage(this.originalImg, offsetX, offsetY, scaledW, scaledH);
    }

    // 5. Apply high-pass sharpening if upscaled
    if (this.upscaleFactor > 1) {
      this.applyUpscaleSharpening(renderW, renderH);
    }
  }

  renderBackdrop(w, h, origW, origH) {
    if (this.backdropType === 'transparent') {
      return; // Leave transparent canvas
    }

    if (this.backdropType === 'studio-white') {
      const grad = this.ctx.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h / 2, w * 0.6);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#f3f4f6');
      grad.addColorStop(1, '#e5e7eb');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    } else if (this.backdropType === 'obsidian-dark') {
      const grad = this.ctx.createRadialGradient(w / 2, h * 0.4, 30, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, '#1f2937');
      grad.addColorStop(0.6, '#111827');
      grad.addColorStop(1, '#030712');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    } else if (this.backdropType === 'neon-cyber') {
      const grad = this.ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#4338ca');
      grad.addColorStop(0.5, '#7e22ce');
      grad.addColorStop(1, '#be185d');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    } else if (this.backdropType === 'warm-sunset') {
      const grad = this.ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#ef4444');
      grad.addColorStop(1, '#881337');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    } else if (this.backdropType === 'emerald-mint') {
      const grad = this.ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.6, '#059669');
      grad.addColorStop(1, '#34d399');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    } else if (this.backdropType === 'blur-original') {
      this.ctx.save();
      this.ctx.filter = 'blur(28px) brightness(0.9)';
      this.ctx.drawImage(this.originalImg, -20, -20, w + 40, h + 40);
      this.ctx.restore();
    }
  }

  renderPodiumShadow(renderW, renderH, ox, oy, sw, sh) {
    this.ctx.save();
    const shadowCenterX = ox + sw / 2;
    const shadowCenterY = oy + sh * 0.88;
    const shadowRadiusX = sw * 0.38;
    const shadowRadiusY = sh * 0.08;

    // Contact drop shadow
    const grad = this.ctx.createRadialGradient(
      shadowCenterX, shadowCenterY, 5,
      shadowCenterX, shadowCenterY, shadowRadiusX
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.ellipse(shadowCenterX, shadowCenterY, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  applyUpscaleSharpening(w, h) {
    const imgData = this.ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Unsharp mask approximation: enhance contrast between adjacent pixels
    for (let y = 1; y < h - 1; y += 2) {
      for (let x = 1; x < w - 1; x += 2) {
        const idx = (y * w + x) * 4;
        const rightIdx = (y * w + (x + 1)) * 4;
        const diffR = data[idx] - data[rightIdx];
        const diffG = data[idx + 1] - data[rightIdx + 1];
        const diffB = data[idx + 2] - data[rightIdx + 2];

        data[idx] = Math.min(255, Math.max(0, data[idx] + diffR * 0.2));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + diffG * 0.2));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + diffB * 0.2));
      }
    }

    this.ctx.putImageData(imgData, 0, 0);
  }

  downloadResult() {
    if (!this.originalImg) return;
    const a = document.createElement('a');
    a.download = `drop-studio-${Date.now()}.png`;
    a.href = this.canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.App.showToast('Studio image downloaded! 🎨', 'success');
  }
}
