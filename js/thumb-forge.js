/**
 * ThumbForge: Viral Thumbnail Studio & Social Feed Simulator
 */
class ThumbForge {
  constructor() {
    this.canvas = document.getElementById('thumb-canvas');
    this.ctx = this.canvas.getContext('2d');

    // UI Elements
    this.dropZone = document.getElementById('thumb-drop-zone');
    this.fileInput = document.getElementById('thumb-file-input');
    this.sampleBtn = document.getElementById('thumb-load-sample');

    this.glowToggle = document.getElementById('thumb-glow-toggle');
    this.glowSizeInput = document.getElementById('thumb-glow-size');
    this.glowSizeVal = document.getElementById('thumb-glow-size-val');
    this.glowSpreadInput = document.getElementById('thumb-glow-spread');
    this.glowSpreadVal = document.getElementById('thumb-glow-spread-val');

    this.headlineInput = document.getElementById('thumb-headline-input');
    this.badgeSelect = document.getElementById('thumb-badge-select');
    this.feedTitleInput = document.getElementById('thumb-feed-title');
    this.feedChannelInput = document.getElementById('thumb-feed-channel');
    this.downloadBtn = document.getElementById('thumb-download-btn');

    // Simulator Switchers
    this.viewCanvasBtn = document.getElementById('thumb-view-canvas-btn');
    this.viewYtMobileBtn = document.getElementById('thumb-view-yt-mobile-btn');
    this.viewYtDesktopBtn = document.getElementById('thumb-view-yt-desktop-btn');
    this.viewTiktokBtn = document.getElementById('thumb-view-tiktok-btn');

    this.canvasContainer = document.getElementById('thumb-canvas-container');
    this.simYtMobile = document.getElementById('thumb-sim-yt-mobile');
    this.simYtDesktop = document.getElementById('thumb-sim-yt-desktop');
    this.simTiktok = document.getElementById('thumb-sim-tiktok');

    // Viral Title Scorer UI
    this.scoreGrade = document.getElementById('thumb-score-grade');
    this.scoreBar = document.getElementById('thumb-score-bar');
    this.charCount = document.getElementById('thumb-char-count');
    this.powerWords = document.getElementById('thumb-power-words');
    this.scoreTip = document.getElementById('thumb-score-tip');

    // State
    this.subjectImg = null;
    this.glowColor = '#06b6d4';
    this.glowThickness = 10;
    this.glowSpread = 25;
    this.textStyle = 'yellow-pop';
    this.currentView = 'canvas'; // 'canvas', 'yt-mobile', 'yt-desktop', 'tiktok'

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.render();
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

    // Sample creator button
    this.sampleBtn.addEventListener('click', async () => {
      const sampleUrl = await SampleAssets.createCreatorSample();
      this.loadImageFromUrl(sampleUrl);
      window.App.showToast('YouTuber creator loaded! 🧔⚡', 'success');
    });

    // Glow controls
    this.glowToggle.addEventListener('change', () => this.render());
    this.glowSizeInput.addEventListener('input', (e) => {
      this.glowThickness = parseInt(e.target.value);
      this.glowSizeVal.textContent = `${this.glowThickness}px`;
      this.render();
    });

    this.glowSpreadInput.addEventListener('input', (e) => {
      this.glowSpread = parseInt(e.target.value);
      this.glowSpreadVal.textContent = `${this.glowSpread}px`;
      this.render();
    });

    // Glow color swatches
    document.querySelectorAll('#panel-thumb [data-color]').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('#panel-thumb [data-color]').forEach((s) => s.classList.remove('active'));
        swatch.classList.add('active');
        this.glowColor = swatch.dataset.color;
        this.render();
      });
    });

    // Text & Badge inputs
    this.headlineInput.addEventListener('input', () => this.render());
    this.badgeSelect.addEventListener('change', () => this.render());

    // Text style pills
    document.querySelectorAll('#panel-thumb [data-tstyle]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#panel-thumb [data-tstyle]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.textStyle = pill.dataset.tstyle;
        this.render();
      });
    });

    // Feed Simulator view switchers
    this.viewCanvasBtn.addEventListener('click', () => this.switchView('canvas'));
    this.viewYtMobileBtn.addEventListener('click', () => this.switchView('yt-mobile'));
    this.viewYtDesktopBtn.addEventListener('click', () => this.switchView('yt-desktop'));
    this.viewTiktokBtn.addEventListener('click', () => this.switchView('tiktok'));

    // Feed meta updates
    this.feedTitleInput.addEventListener('input', () => {
      this.updateSimulatorText();
      this.updateTitleScorer();
    });
    this.feedChannelInput.addEventListener('input', () => this.updateSimulatorText());

    // Initial Title Score
    this.updateTitleScorer();

    // Download
    this.downloadBtn.addEventListener('click', () => this.downloadThumbnail());
  }

  updateTitleScorer() {
    if (!this.scoreGrade) return;
    const text = this.feedTitleInput.value.trim();
    const len = text.length;

    const powerList = ['survived', 'hours', 'insane', 'secret', 'shocking', 'impossible', 'built', 'ai', 'free', 'never', 'million', 'results', 'danger', 'revealed', 'worst', 'best', 'stop', '$'];
    const lower = text.toLowerCase();
    let powerCount = 0;
    powerList.forEach(w => {
      if (lower.includes(w)) powerCount++;
    });

    let score = 50;

    // Length scoring (optimal is 38 - 65 chars)
    if (len >= 38 && len <= 65) {
      score += 25;
      this.charCount.textContent = `${len} chars (Optimal)`;
      this.charCount.style.color = '#10b981';
    } else if (len < 38) {
      score += 10;
      this.charCount.textContent = `${len} chars (Too Short)`;
      this.charCount.style.color = '#f59e0b';
    } else {
      score += 5;
      this.charCount.textContent = `${len} chars (Truncated on Mobile)`;
      this.charCount.style.color = '#ef4444';
    }

    // Power words bonus
    score += Math.min(20, powerCount * 7);
    this.powerWords.textContent = `${powerCount} Power Words 🔥`;

    // Bracket curiosity gap bonus
    if (/\(.*\)|\{.*\}|\[.*\]/.test(text)) {
      score += 10;
    }

    score = Math.min(100, Math.max(20, score));
    this.scoreBar.style.width = `${score}%`;

    let grade = 'B';
    let tip = 'Add curiosity words or brackets e.g. (Insane Results)';
    if (score >= 90) {
      grade = 'A+';
      tip = '🔥 Exceptional title! High CTR and curiosity hook.';
    } else if (score >= 80) {
      grade = 'A';
      tip = 'Great title! Clear hook and optimal character length.';
    } else if (score >= 65) {
      grade = 'B';
      tip = 'Good start. Add stronger emotional power words.';
    } else {
      grade = 'C';
      tip = 'Keep length between 40-60 characters for mobile feeds.';
    }

    this.scoreGrade.textContent = `${grade} ${score}/100`;
    this.scoreTip.textContent = tip;
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
      this.subjectImg = img;
      this.render();
    };
    img.src = url;
  }

  switchView(view) {
    this.currentView = view;

    // Update buttons
    this.viewCanvasBtn.classList.toggle('active', view === 'canvas');
    this.viewYtMobileBtn.classList.toggle('active', view === 'yt-mobile');
    this.viewYtDesktopBtn.classList.toggle('active', view === 'yt-desktop');
    this.viewTiktokBtn.classList.toggle('active', view === 'tiktok');

    // Update containers
    this.canvasContainer.classList.toggle('hidden', view !== 'canvas');
    this.simYtMobile.classList.toggle('hidden', view !== 'yt-mobile');
    this.simYtDesktop.classList.toggle('hidden', view !== 'yt-desktop');
    this.simTiktok.classList.toggle('hidden', view !== 'tiktok');

    if (view !== 'canvas') {
      this.updateSimulatorImages();
      this.updateSimulatorText();
    }
  }

  updateSimulatorImages() {
    const dataUrl = this.canvas.toDataURL('image/jpeg', 0.92);
    const mobileImg = document.getElementById('sim-yt-mobile-img');
    const desktopImg = document.getElementById('sim-yt-desktop-img');
    const tiktokImg = document.getElementById('sim-tiktok-img');

    if (mobileImg) mobileImg.src = dataUrl;
    if (desktopImg) desktopImg.src = dataUrl;
    if (tiktokImg) tiktokImg.src = dataUrl;
  }

  updateSimulatorText() {
    const title = this.feedTitleInput.value.trim() || 'Video Title Preview';
    const channel = this.feedChannelInput.value.trim() || 'Creator Studio';

    const mobileTitle = document.getElementById('sim-yt-title-mobile');
    const mobileSub = document.getElementById('sim-yt-sub-mobile');
    const desktopTitle = document.getElementById('sim-yt-title-desktop');
    const desktopSub = document.getElementById('sim-yt-sub-desktop');
    const tiktokCaption = document.getElementById('sim-tiktok-title');

    if (mobileTitle) mobileTitle.textContent = title;
    if (mobileSub) mobileSub.textContent = channel;
    if (desktopTitle) desktopTitle.textContent = title;
    if (desktopSub) desktopSub.textContent = channel;
    if (tiktokCaption) tiktokCaption.textContent = title;
  }

  /**
   * Main Thumbnail Renderer (1280x720 16:9)
   */
  render() {
    const w = 1280;
    const h = 720;
    this.canvas.width = w;
    this.canvas.height = h;

    // 1. Cinematic Background: Dark Obsidian Studio with Spotlight
    const bgGrad = this.ctx.createRadialGradient(850, 420, 50, 640, 360, 800);
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Subtle background particles / grid texture
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 0; x < w; x += 40) {
      this.ctx.fillRect(x, 0, 1, h);
    }
    for (let y = 0; y < h; y += 40) {
      this.ctx.fillRect(0, y, w, 1);
    }

    // 2. Render Subject (Creator / Product)
    if (this.subjectImg) {
      this.renderSubjectWithGlow(w, h);
    } else {
      // Guide if no subject loaded
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.ellipse(920, 460, 260, 320, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#64748b';
      this.ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Creator Subject Area', 920, 460);
      this.ctx.restore();
    }

    // 3. Render Viral Alert Badge in Corner
    const badgeText = this.badgeSelect.value;
    if (badgeText && badgeText !== 'NONE') {
      this.renderBadge(badgeText);
    }

    // 4. Render High-Impact Viral Headline Text
    const headline = this.headlineInput.value.trim();
    if (headline) {
      this.renderHeadline(headline);
    }

    // Update simulators if currently active
    if (this.currentView !== 'canvas') {
      this.updateSimulatorImages();
    }
  }

  renderSubjectWithGlow(cw, ch) {
    const iw = this.subjectImg.naturalWidth;
    const ih = this.subjectImg.naturalHeight;

    // Target dimensions for subject (positioned on right half)
    const targetH = ch * 0.96;
    const targetW = (iw / ih) * targetH;
    const posX = cw - targetW - 20;
    const posY = ch - targetH + 20;

    // Create offscreen silhouette for neon glow and outline
    if (this.glowToggle.checked) {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = targetW;
      offCanvas.height = targetH;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(this.subjectImg, 0, 0, targetW, targetH);

      // Extract alpha mask for stroke
      const imgData = offCtx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 30) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        } else {
          data[i + 3] = 0;
        }
      }
      offCtx.putImageData(imgData, 0, 0);

      // Multi-layer neon shadow glow
      this.ctx.save();
      this.ctx.shadowColor = this.glowColor;
      this.ctx.shadowBlur = this.glowSpread;

      // Draw dilated perimeter outline
      const radius = this.glowThickness;
      const steps = 16;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        this.ctx.drawImage(offCanvas, posX + dx, posY + dy);
      }
      this.ctx.restore();
    }

    // Draw main subject photo crisply on top
    this.ctx.drawImage(this.subjectImg, posX, posY, targetW, targetH);
  }

  renderBadge(text) {
    this.ctx.save();
    this.ctx.translate(100, 95);
    this.ctx.rotate(-0.06); // Dynamic slight tilt

    this.ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
    const metrics = this.ctx.measureText(text);
    const badgeW = metrics.width + 48;
    const badgeH = 68;

    // Red fire badge background
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.roundRect(0, 0, badgeW, badgeH, 16);
    this.ctx.fill();

    // Inner bright border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, badgeW / 2, badgeH / 2);

    this.ctx.restore();
  }

  renderHeadline(text) {
    this.ctx.save();
    this.ctx.font = '900 76px "Plus Jakarta Sans", sans-serif';
    this.ctx.textBaseline = 'top';

    // Break text into maximum 3 words per line for massive impact
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    words.forEach((w) => {
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      if (this.ctx.measureText(testLine).width > 620) {
        if (currentLine) lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    // Styling configuration
    let fillStyle = '#facc15'; // default yellow
    let strokeColor = '#000000';
    let strokeWidth = 18;

    if (this.textStyle === 'cyan-glow') {
      fillStyle = '#22d3ee';
    } else if (this.textStyle === 'red-alert') {
      fillStyle = '#f43f5e';
    } else if (this.textStyle === 'pure-white') {
      fillStyle = '#ffffff';
    }

    const startX = 80;
    const startY = 200;
    const lineHeight = 95;

    lines.forEach((line, idx) => {
      const y = startY + idx * lineHeight;

      // Heavy drop shadow for separation
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      this.ctx.shadowBlur = 24;
      this.ctx.shadowOffsetX = 8;
      this.ctx.shadowOffsetY = 12;

      // Thick black stroke
      this.ctx.lineWidth = strokeWidth;
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineJoin = 'round';
      this.ctx.strokeText(line, startX, y);

      this.ctx.shadowColor = 'transparent';

      // Fill text
      this.ctx.fillStyle = fillStyle;
      this.ctx.fillText(line, startX, y);
    });

    this.ctx.restore();
  }

  downloadThumbnail() {
    const a = document.createElement('a');
    a.download = `thumbforge-1280x720-${Date.now()}.png`;
    a.href = this.canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.App.showToast('1280x720 Thumbnail downloaded! 🔥', 'success');
  }
}
