/**
 * Sample Assets Generator for Tools Hub
 * Generates procedural sample assets (images and video) for 1-click instant testing.
 */
// Polyfill CanvasRenderingContext2D.roundRect if not supported
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 0) {
    const radius = typeof r === 'number' ? r : (r[0] || 0);
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + w - radius, y);
    this.quadraticCurveTo(x + w, y, x + w, y + radius);
    this.lineTo(x + w, y + h - radius);
    this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    this.lineTo(x + radius, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    return this;
  };
}

const SampleAssets = {
  /**
   * Generates a sample YouTuber creator cutout (with transparent background)
   * @returns {Promise<string>} Data URL PNG
   */
  async createCreatorSample() {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Transparent background for subject cutout
    ctx.clearRect(0, 0, 1000, 1000);

    ctx.save();
    ctx.translate(500, 520);

    // Torso / Hoodie
    ctx.beginPath();
    ctx.ellipse(0, 360, 360, 240, 0, 0, Math.PI * 2);
    const hoodieGrad = ctx.createLinearGradient(-300, 150, 300, 500);
    hoodieGrad.addColorStop(0, '#1e1b4b');
    hoodieGrad.addColorStop(0.5, '#4338ca');
    hoodieGrad.addColorStop(1, '#6366f1');
    ctx.fillStyle = hoodieGrad;
    ctx.fill();

    // Hoodie Drawstrings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-60, 220);
    ctx.lineTo(-70, 380);
    ctx.moveTo(60, 220);
    ctx.lineTo(70, 380);
    ctx.stroke();

    // Neck
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(-60, 100, 120, 100);

    // Face / Head (Expressive, Mouth Open in Awe)
    ctx.beginPath();
    ctx.ellipse(0, 30, 180, 220, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();

    // Hair (Trendy voluminous styling)
    ctx.beginPath();
    ctx.moveTo(-180, -30);
    ctx.bezierCurveTo(-220, -200, -100, -240, 0, -230);
    ctx.bezierCurveTo(120, -240, 220, -180, 180, -30);
    ctx.bezierCurveTo(140, -140, -120, -140, -180, -30);
    ctx.closePath();
    ctx.fillStyle = '#18181b';
    ctx.fill();

    // Eyebrows (Raised high in excitement)
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-130, -50);
    ctx.quadraticCurveTo(-80, -95, -30, -60);
    ctx.moveTo(30, -60);
    ctx.quadraticCurveTo(80, -95, 130, -50);
    ctx.stroke();

    // Wide Open Excited Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-75, -10, 42, 34, 0, 0, Math.PI * 2);
    ctx.ellipse(75, -10, 42, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Pupils
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(-75, -10, 18, 0, Math.PI * 2);
    ctx.arc(75, -10, 18, 0, Math.PI * 2);
    ctx.fill();

    // Eye Highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-80, -15, 6, 0, Math.PI * 2);
    ctx.arc(70, -15, 6, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(12, 35);
    ctx.lineTo(-12, 45);
    ctx.stroke();

    // Wide Open Smiling / Screaming Mouth (MrBeast classic)
    ctx.beginPath();
    ctx.moveTo(-90, 80);
    ctx.quadraticCurveTo(0, 70, 90, 80);
    ctx.quadraticCurveTo(110, 190, 0, 195);
    ctx.quadraticCurveTo(-110, 190, -90, 80);
    ctx.closePath();
    ctx.fillStyle = '#7f1d1d';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#18181b';
    ctx.stroke();

    // Teeth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-75, 85);
    ctx.quadraticCurveTo(0, 80, 75, 85);
    ctx.lineTo(65, 115);
    ctx.quadraticCurveTo(0, 110, -65, 115);
    ctx.closePath();
    ctx.fill();

    // Tongue
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(0, 175, 55, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    return canvas.toDataURL('image/png');
  },

  /**
   * Generates a sample product image (Cyberpunk Sneaker on studio background)
   * @returns {Promise<string>} Data URL
   */
  async createProductSample() {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Studio Background with soft center spotlight
    const bgGrad = ctx.createRadialGradient(500, 480, 50, 500, 500, 550);
    bgGrad.addColorStop(0, '#e5e7eb');
    bgGrad.addColorStop(0.7, '#d1d5db');
    bgGrad.addColorStop(1, '#9ca3af');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 1000);

    // Floor horizon line
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 680, 1000, 320);

    // Product drop shadow
    ctx.beginPath();
    ctx.ellipse(500, 720, 320, 45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.filter = 'blur(12px)';
    ctx.fill();
    ctx.filter = 'none';

    // Draw Stylish Sneaker Shape (Subject)
    ctx.save();
    ctx.translate(500, 500);

    // Sole
    ctx.beginPath();
    ctx.moveTo(-300, 140);
    ctx.bezierCurveTo(-260, 200, 220, 210, 310, 150);
    ctx.bezierCurveTo(330, 110, 260, 90, 210, 95);
    ctx.bezierCurveTo(50, 110, -100, 80, -290, 100);
    ctx.closePath();
    const soleGrad = ctx.createLinearGradient(-300, 100, 300, 200);
    soleGrad.addColorStop(0, '#ffffff');
    soleGrad.addColorStop(0.5, '#f3f4f6');
    soleGrad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = soleGrad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0891b2';
    ctx.stroke();

    // Upper Body
    ctx.beginPath();
    ctx.moveTo(-290, 95);
    ctx.bezierCurveTo(-240, 20, -150, -60, -50, -60);
    ctx.bezierCurveTo(40, -60, 90, 30, 170, 40);
    ctx.bezierCurveTo(240, 50, 290, 90, 300, 130);
    ctx.bezierCurveTo(200, 120, -100, 110, -290, 95);
    ctx.closePath();
    const upperGrad = ctx.createLinearGradient(-250, -60, 200, 120);
    upperGrad.addColorStop(0, '#8b5cf6');
    upperGrad.addColorStop(0.5, '#ec4899');
    upperGrad.addColorStop(1, '#f97316');
    ctx.fillStyle = upperGrad;
    ctx.fill();

    // Collar / Ankle
    ctx.beginPath();
    ctx.moveTo(-160, -30);
    ctx.bezierCurveTo(-140, -140, -60, -160, 0, -130);
    ctx.bezierCurveTo(30, -90, 10, -50, -40, -30);
    ctx.closePath();
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();

    // Swoosh / Dynamic Accent Line
    ctx.beginPath();
    ctx.moveTo(-140, 40);
    ctx.quadraticCurveTo(0, -30, 180, 50);
    ctx.quadraticCurveTo(20, 20, -140, 40);
    ctx.fillStyle = '#facc15';
    ctx.fill();

    // Laces details
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-60 + i * 35, -40 + i * 25);
      ctx.lineTo(-30 + i * 35, -30 + i * 25);
      ctx.stroke();
    }

    ctx.restore();

    return canvas.toDataURL('image/png');
  },

  /**
   * Generates a sample scenic photo with prominent watermarks and text stamps.
   * @returns {Promise<string>} Data URL
   */
  async createWatermarkedSample() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Beautiful Sunset Mountain Landscape
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 500);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(0.3, '#3b0764');
    skyGrad.addColorStop(0.6, '#9f1239');
    skyGrad.addColorStop(0.85, '#f97316');
    skyGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1200, 800);

    // Glowing Sun
    ctx.beginPath();
    ctx.arc(720, 420, 70, 0, Math.PI * 2);
    ctx.fillStyle = '#fffbeb';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Distant Mountains
    ctx.beginPath();
    ctx.moveTo(0, 520);
    ctx.lineTo(250, 360);
    ctx.lineTo(480, 470);
    ctx.lineTo(760, 340);
    ctx.lineTo(1050, 480);
    ctx.lineTo(1200, 420);
    ctx.lineTo(1200, 800);
    ctx.lineTo(0, 800);
    ctx.closePath();
    ctx.fillStyle = '#4c0519';
    ctx.fill();

    // Foreground Mountains & Lake
    ctx.beginPath();
    ctx.moveTo(0, 600);
    ctx.lineTo(320, 490);
    ctx.lineTo(650, 580);
    ctx.lineTo(950, 480);
    ctx.lineTo(1200, 560);
    ctx.lineTo(1200, 800);
    ctx.lineTo(0, 800);
    ctx.closePath();
    ctx.fillStyle = '#1c1917';
    ctx.fill();

    // Lake Reflection
    const waterGrad = ctx.createLinearGradient(0, 620, 0, 800);
    waterGrad.addColorStop(0, '#431407');
    waterGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 620, 1200, 180);

    // Soft water ripple lines
    ctx.fillStyle = 'rgba(254, 215, 170, 0.25)';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(600 - Math.random() * 200, 630 + i * 7, 100 + Math.random() * 180, 2);
    }

    // --- WATERMARKS & LOGO STAMPS ---
    // 1. Semi-transparent diagonal repeated watermark
    ctx.save();
    ctx.translate(600, 400);
    ctx.rotate(-Math.PI / 6);
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('STOCK PHOTO PREVIEW', 0, 0);
    ctx.fillText('STOCK PHOTO PREVIEW', 0, -180);
    ctx.fillText('STOCK PHOTO PREVIEW', 0, 180);
    ctx.restore();

    // 2. Corner Copyright Stamp
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('© 2026 TOOLS HUB SHUTTERSTOCK SAMPLE', 1160, 760);

    // 3. Center Watermark Badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(80, 80, 240, 60);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, 240, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAMPLE LOGO', 200, 118);

    return canvas.toDataURL('image/jpeg', 0.95);
  },

  /**
   * Generates a procedural animated video clip (15 seconds, 1280x720) with audio track
   * and returns a Blob URL ready for <video> playback!
   * @returns {Promise<string>} Blob URL of video
   */
  createSampleVideoBlob() {
    return new Promise((resolve) => {
      const width = 1280;
      const height = 720;
      const fps = 30;
      const duration = 12; // 12 seconds
      const totalFrames = fps * duration;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Audio Synthesis for real video sound (graceful fallback if blocked)
      let audioCtx = null;
      let osc = null;
      let dest = null;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          dest = audioCtx.createMediaStreamDestination();
          osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
        }
      } catch (e) {
        console.warn('AudioContext not available:', e);
      }

      // Video Stream
      const canvasStream = canvas.captureStream(fps);
      if (dest && dest.stream.getAudioTracks().length > 0) {
        canvasStream.addTrack(dest.stream.getAudioTracks()[0]);
      }

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: 2500000
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        try {
          if (osc) osc.stop();
          if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
        } catch (e) {}
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(URL.createObjectURL(blob));
      };

      recorder.start();

      let frame = 0;
      function renderFrame() {
        const t = frame / fps;
        const progress = frame / totalFrames;

        // Background studio dynamic mesh
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0a0d17');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Ambient moving neon light
        const lightX = width / 2 + Math.sin(t * 1.5) * 300;
        const lightY = height / 2 + Math.cos(t * 1.2) * 150;
        const radial = ctx.createRadialGradient(lightX, lightY, 20, lightX, lightY, 400);
        radial.addColorStop(0, 'rgba(139, 92, 246, 0.45)');
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);

        // Animated Speaker Character / Podcaster in center
        ctx.save();
        ctx.translate(width / 2, height / 2 + 50);

        // Head bounce
        const bounce = Math.sin(t * 5) * 8;

        // Shoulders / Torso
        ctx.beginPath();
        ctx.ellipse(0, 180, 160, 90, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#312e81';
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(0, 20 + bounce, 80, 0, Math.PI * 2);
        ctx.fillStyle = '#fcd34d';
        ctx.fill();

        // Sunglasses (cool podcaster look)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-55, 5 + bounce, 45, 25);
        ctx.fillRect(10, 5 + bounce, 45, 25);
        ctx.fillRect(-10, 12 + bounce, 20, 5);

        // Mouth animated talking
        const mouthOpen = 8 + Math.abs(Math.sin(t * 10)) * 14;
        ctx.beginPath();
        ctx.ellipse(0, 55 + bounce, 18, mouthOpen, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#991b1b';
        ctx.fill();

        // Studio Microphone
        ctx.beginPath();
        ctx.roundRect(-25, 60, 50, 75, 16);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        // Dynamic Waveform visualization at bottom
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = 100; x < width - 100; x += 15) {
          const waveHeight = Math.sin(x * 0.04 + t * 6) * 35 * Math.abs(Math.sin(t * 3));
          ctx.moveTo(x, height - 80 - waveHeight);
          ctx.lineTo(x, height - 80 + waveHeight);
        }
        ctx.stroke();

        // Top Scene Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VIRAL PODCAST SECRETS 🎙️', width / 2, 80);

        // Subtitle prompt banner
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = '500 20px sans-serif';
        ctx.fillText(`Scene Time: ${t.toFixed(1)}s / ${duration}s`, width / 2, 120);

        frame++;
        if (frame < totalFrames) {
          requestAnimationFrame(renderFrame);
        } else {
          recorder.stop();
        }
      }

      renderFrame();
    });
  }
};
