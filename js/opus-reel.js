/**
 * OpusReel: 9:16 Smart Video Reframe, Viral Subtitles & Hooks Studio
 */
class OpusReel {
  constructor() {
    this.canvas = document.getElementById('opus-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.video = document.getElementById('opus-video-source');
    
    // UI Elements
    this.dropZone = document.getElementById('opus-drop-zone');
    this.fileInput = document.getElementById('opus-file-input');
    this.sampleBtn = document.getElementById('opus-load-sample');
    this.playPauseBtn = document.getElementById('opus-play-pause-btn');
    this.playIcon = document.getElementById('opus-play-icon');
    this.restartBtn = document.getElementById('opus-restart-btn');
    this.timelineTrack = document.getElementById('opus-timeline-track');
    this.timelineProgress = document.getElementById('opus-timeline-progress');
    this.timeReadout = document.getElementById('opus-time-readout');
    this.durationLabel = document.getElementById('opus-timeline-duration');
    this.panXInput = document.getElementById('opus-pan-x');
    this.panXVal = document.getElementById('opus-pan-x-val');
    this.zoomInput = document.getElementById('opus-zoom');
    this.zoomVal = document.getElementById('opus-zoom-val');
    this.hookSelect = document.getElementById('opus-hook-select');
    this.customHookInput = document.getElementById('opus-custom-hook');
    this.captionTextArea = document.getElementById('opus-caption-text');
    this.exportBtn = document.getElementById('opus-export-btn');

    // SilenceStripper & Audiogram UI
    this.silenceToggle = document.getElementById('opus-silence-toggle');
    this.silenceThresh = document.getElementById('opus-silence-thresh');
    this.silenceVal = document.getElementById('opus-silence-val');
    this.audiogramToggle = document.getElementById('opus-audiogram-toggle');

    // Teleprompter Pro UI
    this.openTeleprompterBtn = document.getElementById('opus-open-teleprompter-btn');
    this.teleprompterDrawer = document.getElementById('opus-teleprompter-drawer');
    this.teleprompterCloseBtn = document.getElementById('teleprompter-close-btn');
    this.teleprompterScrollBtn = document.getElementById('teleprompter-scroll-toggle-btn');
    this.teleprompterSpeed = document.getElementById('teleprompter-speed');
    this.teleprompterSpeedVal = document.getElementById('teleprompter-speed-val');
    this.teleprompterArea = document.getElementById('teleprompter-scroll-area');
    this.isTeleprompterScrolling = false;
    this.teleprompterScrollAnim = null;

    // State
    this.isPlaying = false;
    this.panX = 0.5; // 0 (left) to 1 (right)
    this.zoom = 1.0;
    this.targetDuration = 15;
    this.captionStyle = 'hormozi-yellow';
    this.isExporting = false;
    this.animationFrameId = null;

    // Default Transcript Lines
    this.defaultTranscript = [
      "IF YOU WANT TO GO VIRAL IN 2026...",
      "YOU MUST HOOK THEM IN THE FIRST 2 SECONDS!",
      "STOP MAKING BORING VIDEOS.",
      "USE DYNAMIC SUBTITLES AND HIGH ENERGY.",
      "TEST THIS VIRAL REEL GENERATOR RIGHT NOW!"
    ];

    this.init();
  }

  init() {
    // Populate default text
    this.captionTextArea.value = this.defaultTranscript.join('\n');

    // Event Listeners
    this.setupEventListeners();

    // Initial canvas placeholder
    this.drawEmptyState();
  }

  setupEventListeners() {
    // Drop zone & file loader
    this.dropZone.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.loadVideoFile(e.target.files[0]);
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
        this.loadVideoFile(e.dataTransfer.files[0]);
      }
    });

    // Sample video button
    this.sampleBtn.addEventListener('click', async () => {
      this.sampleBtn.disabled = true;
      this.sampleBtn.textContent = 'Generating... ⏳';
      window.App.showToast('Generating sample podcast video...', 'info');
      try {
        const videoBlobUrl = await SampleAssets.createSampleVideoBlob();
        this.video.src = videoBlobUrl;
        this.video.load();
        this.video.onloadeddata = () => {
          this.playVideo();
          window.App.showToast('Sample video loaded! 🎬', 'success');
          this.sampleBtn.disabled = false;
          this.sampleBtn.textContent = 'Load Sample 🎬';
        };
      } catch (err) {
        console.error(err);
        this.sampleBtn.disabled = false;
        this.sampleBtn.textContent = 'Load Sample 🎬';
      }
    });

    // Playback buttons
    this.playPauseBtn.addEventListener('click', () => this.togglePlay());
    this.restartBtn.addEventListener('click', () => {
      this.video.currentTime = 0;
      if (!this.isPlaying) this.playVideo();
    });

    // Timeline seeking
    this.timelineTrack.addEventListener('click', (e) => {
      if (!this.video.duration) return;
      const rect = this.timelineTrack.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      this.video.currentTime = pos * Math.min(this.video.duration, this.targetDuration);
      this.renderFrame();
    });

    // Pan & Zoom controls
    this.panXInput.addEventListener('input', (e) => {
      this.panX = parseInt(e.target.value) / 100;
      this.panXVal.textContent = this.panX === 0.5 ? 'Center' : `${Math.round(this.panX * 100)}%`;
      this.renderFrame();
    });

    this.zoomInput.addEventListener('input', (e) => {
      this.zoom = parseInt(e.target.value) / 100;
      this.zoomVal.textContent = `${this.zoom.toFixed(1)}x`;
      this.renderFrame();
    });

    // Hook select
    this.hookSelect.addEventListener('change', (e) => {
      if (e.target.value === 'CUSTOM') {
        this.customHookInput.classList.remove('hidden');
      } else {
        this.customHookInput.classList.add('hidden');
      }
      this.renderFrame();
    });

    this.customHookInput.addEventListener('input', () => this.renderFrame());
    this.captionTextArea.addEventListener('input', () => this.renderFrame());

    // Caption Style Pills
    document.querySelectorAll('.preset-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.preset-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.captionStyle = pill.dataset.style;
        this.renderFrame();
      });
    });

    // Target Duration Pills
    document.querySelectorAll('#panel-opus .pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#panel-opus .pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.targetDuration = parseInt(pill.dataset.duration);
        this.durationLabel.textContent = `${this.targetDuration}.0s`;
        this.renderFrame();
      });
    });

    // Export button
    this.exportBtn.addEventListener('click', () => this.exportReel());

    // SilenceStripper & Audiogram
    this.silenceThresh.addEventListener('input', (e) => {
      this.silenceVal.textContent = `${e.target.value}%`;
    });
    this.audiogramToggle.addEventListener('change', () => this.renderFrame());

    // Teleprompter Pro Drawer Listeners
    this.openTeleprompterBtn.addEventListener('click', () => {
      this.teleprompterDrawer.classList.toggle('hidden');
    });
    this.teleprompterCloseBtn.addEventListener('click', () => {
      this.teleprompterDrawer.classList.add('hidden');
      this.stopTeleprompterScroll();
    });
    this.teleprompterSpeed.addEventListener('input', (e) => {
      this.teleprompterSpeedVal.textContent = `${e.target.value}x`;
    });
    this.teleprompterScrollBtn.addEventListener('click', () => {
      this.toggleTeleprompterScroll();
    });

    // Video events
    this.video.addEventListener('timeupdate', () => this.onVideoTimeUpdate());
    this.video.addEventListener('ended', () => {
      this.video.currentTime = 0;
      this.video.play();
    });
  }

  toggleTeleprompterScroll() {
    if (this.isTeleprompterScrolling) {
      this.stopTeleprompterScroll();
    } else {
      this.isTeleprompterScrolling = true;
      this.teleprompterScrollBtn.textContent = '⏸ Pause';
      const scrollStep = () => {
        if (!this.isTeleprompterScrolling) return;
        const speed = parseInt(this.teleprompterSpeed.value);
        this.teleprompterArea.scrollTop += speed * 0.7;
        if (this.teleprompterArea.scrollTop >= this.teleprompterArea.scrollHeight - this.teleprompterArea.clientHeight) {
          this.teleprompterArea.scrollTop = 0;
        }
        this.teleprompterScrollAnim = requestAnimationFrame(scrollStep);
      };
      this.teleprompterScrollAnim = requestAnimationFrame(scrollStep);
    }
  }

  stopTeleprompterScroll() {
    this.isTeleprompterScrolling = false;
    this.teleprompterScrollBtn.textContent = '▶ Scroll';
    if (this.teleprompterScrollAnim) cancelAnimationFrame(this.teleprompterScrollAnim);
  }

  loadVideoFile(file) {
    const url = URL.createObjectURL(file);
    this.video.src = url;
    this.video.load();
    this.video.onloadeddata = () => {
      this.playVideo();
      window.App.showToast(`Loaded: ${file.name}`, 'success');
    };
  }

  togglePlay() {
    if (!this.video.src) return;
    if (this.isPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  playVideo() {
    this.video.play();
    this.isPlaying = true;
    this.playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    this.startRenderLoop();
  }

  pauseVideo() {
    this.video.pause();
    this.isPlaying = false;
    this.playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  startRenderLoop() {
    const loop = () => {
      if (this.isPlaying) {
        this.renderFrame();
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };
    loop();
  }

  onVideoTimeUpdate() {
    if (!this.video.duration) return;
    const cur = this.video.currentTime;
    const maxDur = Math.min(this.video.duration, this.targetDuration);

    if (cur >= maxDur) {
      this.video.currentTime = 0;
    }

    const pct = (cur / maxDur) * 100;
    this.timelineProgress.style.width = `${pct}%`;
    this.timeReadout.textContent = `${this.formatTime(cur)} / ${this.formatTime(maxDur)}`;
  }

  formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  drawEmptyState() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.fillStyle = '#0f1322';
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '600 36px "Plus Jakarta Sans", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('No video loaded', w / 2, h / 2 - 20);
    this.ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Load a video or click "Load Sample" to begin', w / 2, h / 2 + 30);
  }

  /**
   * Main 9:16 Reframe & Dynamic Caption Rendering Engine
   */
  renderFrame() {
    if (!this.video.videoWidth) {
      this.drawEmptyState();
      return;
    }

    const cw = this.canvas.width;  // 1080
    const ch = this.canvas.height; // 1920
    const vw = this.video.videoWidth;
    const vh = this.video.videoHeight;

    this.ctx.clearRect(0, 0, cw, ch);

    // 1. Calculate 9:16 Smart Crop
    // Target aspect ratio is 9:16 = 0.5625
    const targetAspect = cw / ch;
    const videoAspect = vw / vh;

    let sourceW, sourceH, sourceX, sourceY;

    if (videoAspect > targetAspect) {
      // Widescreen video: crop width with horizontal pan tracking
      sourceH = vh / this.zoom;
      sourceW = sourceH * targetAspect;
      const maxScrollX = vw - sourceW;
      sourceX = Math.max(0, Math.min(maxScrollX, maxScrollX * this.panX));
      sourceY = (vh - sourceH) / 2;
    } else {
      // Tall video: crop height
      sourceW = vw / this.zoom;
      sourceH = sourceW / targetAspect;
      sourceX = (vw - sourceW) / 2;
      sourceY = (vh - sourceH) / 2;
    }

    // Draw smart reframed video frame
    this.ctx.drawImage(this.video, sourceX, sourceY, sourceW, sourceH, 0, 0, cw, ch);

    // 2. Render Cinematic Vignette (Subtle top & bottom shadow for caption contrast)
    const vignette = this.ctx.createLinearGradient(0, 0, 0, ch);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    vignette.addColorStop(0.2, 'transparent');
    vignette.addColorStop(0.7, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    this.ctx.fillStyle = vignette;
    this.ctx.fillRect(0, 0, cw, ch);

    // 3. Render Viral Hook Banner at Top
    let hookText = this.hookSelect.value;
    if (hookText === 'CUSTOM') {
      hookText = this.customHookInput.value.trim();
    }
    if (hookText && hookText !== 'NONE') {
      this.renderHookBanner(hookText, cw);
    }

    // 4. Render Dynamic Word-by-Word Hormozi-Style Captions
    this.renderDynamicCaptions(cw, ch);

    // 5. Render Audiogram Soundwave Bars
    if (this.audiogramToggle && this.audiogramToggle.checked) {
      this.renderAudiogramBars(cw, ch);
    }

    // 6. Render Bottom Mini-Progress Bar
    if (this.video.duration) {
      const prog = (this.video.currentTime % this.targetDuration) / this.targetDuration;
      this.ctx.fillStyle = '#8b5cf6';
      this.ctx.fillRect(0, ch - 12, cw * prog, 12);
    }
  }

  renderAudiogramBars(cw, ch) {
    const barCount = 28;
    const barWidth = 14;
    const gap = 12;
    const totalWidth = barCount * (barWidth + gap);
    const startX = (cw - totalWidth) / 2;
    const baseY = ch * 0.88;
    const t = this.video.currentTime * 8;

    this.ctx.save();
    this.ctx.fillStyle = '#06b6d4';

    for (let i = 0; i < barCount; i++) {
      const wave = Math.abs(Math.sin(t + i * 0.45)) * Math.abs(Math.cos(t * 0.5 + i * 0.2));
      const barHeight = 8 + wave * 90;
      const x = startX + i * (barWidth + gap);
      const y = baseY - barHeight / 2;

      this.ctx.beginPath();
      this.ctx.roundRect(x, y, barWidth, barHeight, 6);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  renderHookBanner(text, cw) {
    this.ctx.save();
    this.ctx.font = '800 48px "Plus Jakarta Sans", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const paddingX = 40;
    const paddingY = 20;
    const textMetrics = this.ctx.measureText(text);
    const boxW = textMetrics.width + paddingX * 2;
    const boxH = 80;
    const boxX = (cw - boxW) / 2;
    const boxY = 160;

    // Glowing hook badge
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.beginPath();
    this.ctx.roundRect(boxX, boxY, boxW, boxH, 20);
    this.ctx.fill();

    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(text, cw / 2, boxY + boxH / 2);
    this.ctx.restore();
  }

  renderDynamicCaptions(cw, ch) {
    const rawLines = this.captionTextArea.value
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (rawLines.length === 0) return;

    const curTime = this.video.currentTime % this.targetDuration;
    const totalLines = rawLines.length;
    const lineDuration = this.targetDuration / totalLines;

    const activeLineIndex = Math.min(totalLines - 1, Math.floor(curTime / lineDuration));
    const activeLine = rawLines[activeLineIndex];
    const lineProgress = (curTime % lineDuration) / lineDuration;

    // Split active line into individual words
    const words = activeLine.split(/\s+/);
    const activeWordIndex = Math.min(words.length - 1, Math.floor(lineProgress * words.length));

    // Measure total width to center words horizontally
    this.ctx.save();
    this.ctx.font = '900 68px "Plus Jakarta Sans", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const centerY = ch * 0.72; // Standard reels caption sweet spot

    // Styling configurations
    let activeTextColor = '#facc15'; // Default yellow
    let activeBadgeColor = 'rgba(250, 204, 21, 0.2)';
    let normalTextColor = '#ffffff';

    if (this.captionStyle === 'cyber-cyan') {
      activeTextColor = '#22d3ee';
      activeBadgeColor = 'rgba(34, 211, 238, 0.25)';
    } else if (this.captionStyle === 'red-impact') {
      activeTextColor = '#f43f5e';
      activeBadgeColor = 'rgba(244, 63, 94, 0.25)';
    } else if (this.captionStyle === 'clean-white') {
      activeTextColor = '#ffffff';
      activeBadgeColor = 'rgba(255, 255, 255, 0.15)';
    }

    // Draw words with dynamic active highlight
    // Break into chunks of 3-4 words for high readability
    const maxWordsPerChunk = 4;
    const chunkStart = Math.floor(activeWordIndex / maxWordsPerChunk) * maxWordsPerChunk;
    const chunkWords = words.slice(chunkStart, chunkStart + maxWordsPerChunk);
    const chunkActiveIdx = activeWordIndex - chunkStart;

    // Calculate positions
    const wordSpacings = chunkWords.map(w => this.ctx.measureText(w + ' ').width);
    const totalChunkW = wordSpacings.reduce((a, b) => a + b, 0);
    let startX = (cw - totalChunkW) / 2;

    chunkWords.forEach((word, idx) => {
      const isCurrent = idx === chunkActiveIdx;
      const wordW = wordSpacings[idx];
      const wordCenterX = startX + wordW / 2;

      if (isCurrent) {
        // Active word bounce & background badge
        this.ctx.save();
        this.ctx.translate(wordCenterX, centerY);
        this.ctx.scale(1.12, 1.12);

        // Word background highlight pill
        this.ctx.fillStyle = activeBadgeColor;
        this.ctx.beginPath();
        this.ctx.roundRect(-wordW / 2 - 8, -45, wordW + 16, 90, 16);
        this.ctx.fill();

        // Thick black outline for viral pop
        this.ctx.lineWidth = 14;
        this.ctx.strokeStyle = '#000000';
        this.ctx.strokeText(word, 0, 0);

        this.ctx.fillStyle = activeTextColor;
        this.ctx.fillText(word, 0, 0);
        this.ctx.restore();
      } else {
        // Normal word
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = '#000000';
        this.ctx.strokeText(word, wordCenterX, centerY);

        this.ctx.fillStyle = normalTextColor;
        this.ctx.fillText(word, wordCenterX, centerY);
      }

      startX += wordW;
    });

    this.ctx.restore();
  }

  /**
   * Export the 9:16 Canvas to WebM / MP4 video file
   */
  async exportReel() {
    if (!this.video.src || this.isExporting) return;
    this.isExporting = true;
    this.exportBtn.disabled = true;
    this.exportBtn.textContent = 'Rendering 9:16 Reel... ⏳';

    window.App.showToast('Rendering reel in real-time. Please wait...', 'info');

    // Reset video to start
    this.video.currentTime = 0;
    this.playVideo();

    const stream = this.canvas.captureStream(30);

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 4000000
    });

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `opus-reel-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      this.isExporting = false;
      this.exportBtn.disabled = false;
      this.exportBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg> Render & Download Reel
      `;
      window.App.showToast('Reel rendered and downloaded! 🚀', 'success');
    };

    recorder.start();

    // Stop recorder after target duration
    setTimeout(() => {
      recorder.stop();
      this.pauseVideo();
    }, this.targetDuration * 1000);
  }
}
