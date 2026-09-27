/**
 * CropMatrix: 1-Click Multi-Platform Resizer & Seamless Carousel Splitter
 * Instant client-side aspect ratio conversion with smart ambient blur fill,
 * and 3x1 Instagram panoramic carousel tile slicing.
 */
class CropMatrix {
  constructor() {
    this.canvas = document.getElementById('crop-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Controls
    this.dropZone = document.getElementById('crop-drop-zone');
    this.fileInput = document.getElementById('crop-file-input');
    this.sampleBtn = document.getElementById('crop-sample-btn');

    this.modeSelect = document.getElementById('crop-mode-select'); // 'single', 'carousel'
    this.ratioSelect = document.getElementById('crop-ratio-select');
    this.fitStyleSelect = document.getElementById('crop-fit-style'); // 'contain-blur', 'cover', 'contain-solid'
    this.blurAmountInput = document.getElementById('crop-blur-amount');
    this.blurAmountVal = document.getElementById('crop-blur-val');

    // Actions
    this.downloadBtn = document.getElementById('crop-download-btn');
    this.downloadAllBtn = document.getElementById('crop-download-all-btn');

    // Carousel Container
    this.carouselBox = document.getElementById('crop-carousel-box');
    this.carouselSlidesContainer = document.getElementById('crop-carousel-slides');

    // State
    this.sourceImg = null;
    this.currentMode = 'single'; // 'single' or 'carousel'
    this.currentRatio = '9-16'; // '9-16', '16-9', '1-1', '4-5', '3-1', 'avatar'
    this.fitStyle = 'contain-blur';
    this.blurAmount = 25;

    this.ratios = {
      '9-16': { name: 'TikTok / Reel / Short (9:16)', w: 1080, h: 1920 },
      '16-9': { name: 'YouTube Landscape (16:9)', w: 1920, h: 1080 },
      '1-1': { name: 'Instagram Square (1:1)', w: 1080, h: 1080 },
      '4-5': { name: 'Instagram Portrait (4:5)', w: 1080, h: 1350 },
      '3-1': { name: 'Twitter / X Banner (3:1)', w: 1500, h: 500 },
      avatar: { name: 'Profile Avatar Circle (1:1)', w: 1080, h: 1080 }
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSample();
  }

  setupEventListeners() {
    if (this.dropZone) {
      this.dropZone.addEventListener('click', () => this.fileInput.click());
      this.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.dropZone.classList.add('drag-over');
      });
      this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('drag-over'));
      this.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.loadFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadFile(e.target.files[0]);
        }
      });
    }

    if (this.sampleBtn) {
      this.sampleBtn.addEventListener('click', () => this.loadSample());
    }

    if (this.modeSelect) {
      this.modeSelect.addEventListener('change', (e) => {
        this.currentMode = e.target.value;
        const isCarousel = this.currentMode === 'carousel';
        if (this.carouselBox) this.carouselBox.classList.toggle('hidden', !isCarousel);
        if (this.canvas) this.canvas.parentElement.classList.toggle('hidden', isCarousel);
        this.render();
      });
    }

    if (this.ratioSelect) {
      this.ratioSelect.addEventListener('change', (e) => {
        this.currentRatio = e.target.value;
        this.render();
      });
    }

    if (this.fitStyleSelect) {
      this.fitStyleSelect.addEventListener('change', (e) => {
        this.fitStyle = e.target.value;
        this.render();
      });
    }

    if (this.blurAmountInput) {
      this.blurAmountInput.addEventListener('input', (e) => {
        this.blurAmount = parseInt(e.target.value);
        if (this.blurAmountVal) this.blurAmountVal.textContent = `${this.blurAmount}px`;
        this.render();
      });
    }

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener('click', () => {
        if (this.currentMode === 'carousel') {
          this.downloadCarousel();
        } else {
          this.downloadCurrent();
        }
      });
    }

    if (this.downloadAllBtn) {
      this.downloadAllBtn.addEventListener('click', () => this.downloadAllFormats());
    }
  }

  loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.sourceImg = img;
        this.render();
        if (window.App && window.App.showToast) {
          window.App.showToast(`Image loaded: ${img.width}×${img.height}px 🖼️`, 'success');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  loadSample() {
    // Generate high-aesthetic procedural landscape graphic
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 1920;
    sampleCanvas.height = 1080;
    const ctx = sampleCanvas.getContext('2d');

    // Deep cosmic gradient
    const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#4c1d95');
    grad.addColorStop(1, '#0e7490');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Glowing geometric aura
    const rad = ctx.createRadialGradient(960, 540, 50, 960, 540, 600);
    rad.addColorStop(0, 'rgba(236, 72, 153, 0.6)');
    rad.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)');
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Stylized Typography
    ctx.font = '900 80px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('VIRAL CREATOR ART', 960, 500);

    ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('TOOLS HUB • MULTI-PLATFORM REPURPOSER', 960, 570);

    const img = new Image();
    img.onload = () => {
      this.sourceImg = img;
      this.render();
    };
    img.src = sampleCanvas.toDataURL();
  }

  render() {
    if (!this.sourceImg) return;

    if (this.currentMode === 'carousel') {
      this.renderCarousel();
    } else {
      this.renderSingle();
    }
  }

  renderSingle() {
    const target = this.ratios[this.currentRatio] || this.ratios['9-16'];
    const canvas = this.canvas;
    const ctx = this.ctx;
    canvas.width = target.w;
    canvas.height = target.h;

    const img = this.sourceImg;
    const imgRatio = img.width / img.height;
    const canvasRatio = target.w / target.h;

    ctx.clearRect(0, 0, target.w, target.h);

    if (this.fitStyle === 'cover') {
      // Zoom & crop to fill
      let drawW, drawH, drawX, drawY;
      if (imgRatio > canvasRatio) {
        drawH = target.h;
        drawW = img.width * (target.h / img.height);
        drawX = (target.w - drawW) / 2;
        drawY = 0;
      } else {
        drawW = target.w;
        drawH = img.height * (target.w / img.width);
        drawX = 0;
        drawY = (target.h - drawH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else if (this.fitStyle === 'contain-solid') {
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, target.w, target.h);

      let drawW, drawH, drawX, drawY;
      if (imgRatio > canvasRatio) {
        drawW = target.w;
        drawH = img.height * (target.w / img.width);
        drawX = 0;
        drawY = (target.h - drawH) / 2;
      } else {
        drawH = target.h;
        drawW = img.width * (target.h / img.height);
        drawX = (target.w - drawW) / 2;
        drawY = 0;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // Contain with Smart Ambient Gaussian Blur Backdrop
      // 1. Draw scaled blurred backdrop
      ctx.save();
      ctx.filter = `blur(${this.blurAmount}px) brightness(0.7)`;
      // Scale backdrop slightly larger to prevent blur edges
      const pad = 80;
      ctx.drawImage(img, -pad, -pad, target.w + pad * 2, target.h + pad * 2);
      ctx.restore();

      // 2. Overlay subtle dark scrim
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, target.w, target.h);

      // 3. Draw sharp centered foreground image with drop shadow
      let drawW, drawH, drawX, drawY;
      if (imgRatio > canvasRatio) {
        drawW = target.w;
        drawH = img.height * (target.w / img.width);
        drawX = 0;
        drawY = (target.h - drawH) / 2;
      } else {
        drawH = target.h;
        drawW = img.width * (target.h / img.height);
        drawX = (target.w - drawW) / 2;
        drawY = 0;
      }

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 40;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    // Avatar circular guide
    if (this.currentRatio === 'avatar') {
      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(target.w / 2, target.h / 2, target.w / 2 - 10, 0, Math.PI * 2);
      ctx.stroke();

      // Mask outside circle with subtle vignette
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.rect(0, 0, target.w, target.h);
      ctx.arc(target.w / 2, target.h / 2, target.w / 2 - 10, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    }
  }

  renderCarousel() {
    if (!this.carouselSlidesContainer || !this.sourceImg) return;
    this.carouselSlidesContainer.innerHTML = '';

    const img = this.sourceImg;
    // 3 seamless 1080x1080 slides
    const sliceCount = 3;
    const sliceWidth = img.width / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
      const slideCanvas = document.createElement('canvas');
      slideCanvas.width = 1080;
      slideCanvas.height = 1080;
      const sCtx = slideCanvas.getContext('2d');

      // Crop slice from original image and scale to 1080x1080
      sCtx.drawImage(
        img,
        i * sliceWidth,
        0,
        sliceWidth,
        img.height, // Source slice
        0,
        0,
        1080,
        1080 // Destination tile
      );

      const slideCard = document.createElement('div');
      slideCard.className = 'carousel-slide-card';
      slideCard.innerHTML = `
        <div class="carousel-slide-badge">Slide ${i + 1} of 3</div>
        <img class="carousel-slide-img" src="${slideCanvas.toDataURL()}" alt="Carousel Slide ${i + 1}">
        <button class="btn-ghost btn-sm btn-download-slide mt-2" data-index="${i + 1}">Download Slide ${i + 1} ↵</button>
      `;

      const downloadBtn = slideCard.querySelector('.btn-download-slide');
      downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `instagram_carousel_slide_${i + 1}.png`;
        link.href = slideCanvas.toDataURL('image/png', 1.0);
        link.click();
      });

      this.carouselSlidesContainer.appendChild(slideCard);
    }
  }

  downloadCurrent() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `cropmatrix_${this.currentRatio}_${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png', 1.0);
    link.click();
    if (window.App && window.App.showToast) {
      window.App.showToast(`Exported ${this.ratios[this.currentRatio].name}! 📸✨`, 'success');
    }
  }

  downloadCarousel() {
    const slides = this.carouselSlidesContainer.querySelectorAll('.carousel-slide-img');
    slides.forEach((img, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = `instagram_carousel_slide_${idx + 1}.png`;
        link.href = img.src;
        link.click();
      }, idx * 250);
    });

    if (window.App && window.App.showToast) {
      window.App.showToast('All 3 Carousel Slides Exported sequentially! 📲✨', 'success');
    }
  }

  downloadAllFormats() {
    if (!this.sourceImg) return;
    const formatKeys = ['9-16', '16-9', '1-1', '4-5', '3-1'];
    const prevRatio = this.currentRatio;

    formatKeys.forEach((key, idx) => {
      setTimeout(() => {
        this.currentRatio = key;
        this.renderSingle();
        const link = document.createElement('a');
        link.download = `social_${key}_${this.ratios[key].w}x${this.ratios[key].h}.png`;
        link.href = this.canvas.toDataURL('image/png', 1.0);
        link.click();

        if (idx === formatKeys.length - 1) {
          this.currentRatio = prevRatio;
          this.renderSingle();
          if (window.App && window.App.showToast) {
            window.App.showToast('Batch Exported All 5 Formats! 🚀✨', 'success');
          }
        }
      }, idx * 300);
    });
  }
}
