/**
 * AudioStudio: EchoKiller / Mic Polish & Viral Creator Soundboard
 */
class AudioStudio {
  constructor() {
    this.audioCtx = null;
    this.mediaStream = null;
    this.micSource = null;
    this.compressor = null;
    this.highpass = null;
    this.demud = null;
    this.presence = null;
    this.noiseGateGain = null;
    this.analyser = null;

    // UI Elements
    this.micToggleBtn = document.getElementById('audio-mic-toggle');
    this.micStatus = document.getElementById('audio-mic-status');
    this.bypassToggle = document.getElementById('audio-bypass-toggle');
    this.gateInput = document.getElementById('audio-gate-threshold');
    this.gateVal = document.getElementById('audio-gate-val');
    this.clarityInput = document.getElementById('audio-clarity-boost');
    this.clarityVal = document.getElementById('audio-clarity-val');
    this.compInput = document.getElementById('audio-compression');
    this.compVal = document.getElementById('audio-comp-val');
    this.waveCanvas = document.getElementById('audio-wave-canvas');
    this.waveCtx = this.waveCanvas.getContext('2d');

    this.isMicActive = false;
    this.isBypassed = false;
    this.animId = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupSoundboard();
    this.drawEmptyWaveform();
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  setupEventListeners() {
    this.micToggleBtn.addEventListener('click', () => this.toggleMic());

    this.bypassToggle.addEventListener('change', (e) => {
      this.isBypassed = e.target.checked;
      this.updateFilterNodes();
      window.App.showToast(this.isBypassed ? 'EchoKiller Bypassed (Original Audio)' : 'EchoKiller DSP Active! 🎙️✨', 'info');
    });

    this.gateInput.addEventListener('input', (e) => {
      this.gateVal.textContent = `${e.target.value} dB`;
      this.updateFilterNodes();
    });

    this.clarityInput.addEventListener('input', (e) => {
      this.clarityVal.textContent = `+${e.target.value} dB`;
      this.updateFilterNodes();
    });

    this.compInput.addEventListener('input', (e) => {
      this.compVal.textContent = `${e.target.value}:1`;
      this.updateFilterNodes();
    });
  }

  async toggleMic() {
    const ctx = this.getAudioContext();

    if (this.isMicActive) {
      this.stopMic();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.mediaStream = stream;
        this.buildAudioChain(stream);
        this.isMicActive = true;
        this.micToggleBtn.textContent = '⏹️ Stop Mic Test';
        this.micToggleBtn.classList.add('btn-danger');
        this.micStatus.textContent = '● Live Microphone Connected';
        this.micStatus.style.color = '#10b981';
        this.startWaveformVisualizer();
        window.App.showToast('Microphone connected. Speak to test EchoKiller DSP!', 'success');
      } catch (err) {
        console.error(err);
        window.App.showToast('Microphone access denied or unavailable', 'error');
      }
    }
  }

  stopMic() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
    }
    this.isMicActive = false;
    this.micToggleBtn.textContent = '🎙️ Start Mic Live Test';
    this.micToggleBtn.classList.remove('btn-danger');
    this.micStatus.textContent = 'Microphone disconnected';
    this.micStatus.style.color = 'var(--text-muted)';
    if (this.animId) cancelAnimationFrame(this.animId);
    this.drawEmptyWaveform();
  }

  buildAudioChain(stream) {
    const ctx = this.getAudioContext();
    this.micSource = ctx.createMediaStreamSource(stream);

    // 1. Highpass Filter (Cut low-frequency rumble < 80Hz)
    this.highpass = ctx.createBiquadFilter();
    this.highpass.type = 'highpass';
    this.highpass.frequency.setValueAtTime(80, ctx.currentTime);

    // 2. De-Mud Peaking Filter (Reduce 350Hz boxy room echo)
    this.demud = ctx.createBiquadFilter();
    this.demud.type = 'peaking';
    this.demud.frequency.setValueAtTime(350, ctx.currentTime);
    this.demud.gain.setValueAtTime(-4, ctx.currentTime);
    this.demud.Q.setValueAtTime(1.2, ctx.currentTime);

    // 3. Presence High Shelf (Crisp speech consonants 3.5kHz)
    this.presence = ctx.createBiquadFilter();
    this.presence.type = 'highshelf';
    this.presence.frequency.setValueAtTime(3500, ctx.currentTime);
    this.presence.gain.setValueAtTime(parseInt(this.clarityInput.value), ctx.currentTime);

    // 4. Dynamics Compressor (Studio Vocal Leveler)
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-24, ctx.currentTime);
    this.compressor.knee.setValueAtTime(10, ctx.currentTime);
    this.compressor.ratio.setValueAtTime(parseInt(this.compInput.value), ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, ctx.currentTime);

    // 5. Analyser for Waveform
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;

    // Connect nodes
    this.micSource.connect(this.highpass);
    this.highpass.connect(this.demud);
    this.demud.connect(this.presence);
    this.presence.connect(this.compressor);
    this.compressor.connect(this.analyser);
    // Don't connect directly to destination to prevent feedback howling in speakers
  }

  updateFilterNodes() {
    if (!this.audioCtx || !this.presence) return;
    const ctx = this.audioCtx;

    if (this.isBypassed) {
      this.highpass.frequency.setValueAtTime(10, ctx.currentTime);
      this.demud.gain.setValueAtTime(0, ctx.currentTime);
      this.presence.gain.setValueAtTime(0, ctx.currentTime);
      this.compressor.ratio.setValueAtTime(1, ctx.currentTime);
    } else {
      this.highpass.frequency.setValueAtTime(80, ctx.currentTime);
      this.demud.gain.setValueAtTime(-4, ctx.currentTime);
      this.presence.gain.setValueAtTime(parseInt(this.clarityInput.value), ctx.currentTime);
      this.compressor.ratio.setValueAtTime(parseInt(this.compInput.value), ctx.currentTime);
    }
  }

  startWaveformVisualizer() {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = this.waveCanvas;
    const ctx = this.waveCtx;

    const render = () => {
      this.animId = requestAnimationFrame(render);
      this.analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#0a0d17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = this.isBypassed ? '#94a3b8' : '#06b6d4';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  }

  drawEmptyWaveform() {
    this.waveCtx.fillStyle = '#0a0d17';
    this.waveCtx.fillRect(0, 0, this.waveCanvas.width, this.waveCanvas.height);
    this.waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.waveCtx.lineWidth = 2;
    this.waveCtx.beginPath();
    this.waveCtx.moveTo(0, this.waveCanvas.height / 2);
    this.waveCtx.lineTo(this.waveCanvas.width, this.waveCanvas.height / 2);
    this.waveCtx.stroke();
  }

  /**
   * Procedural Viral Soundboard Engine (100% Web Audio Synthesized)
   */
  setupSoundboard() {
    document.querySelectorAll('[data-sound]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sfx = btn.dataset.sound;
        this.playSfx(sfx);
        btn.classList.add('sound-fired');
        setTimeout(() => btn.classList.remove('sound-fired'), 300);
      });
    });
  }

  playSfx(type) {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    if (type === 'vine-boom') {
      // Deep sub bass drop + distortion
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.8);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } else if (type === 'cha-ching') {
      // Dual coin chime
      [1560, 2090].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.35, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.6);
      });
    } else if (type === 'whoosh') {
      // Filtered noise sweep
      const bufSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.4);
    } else if (type === 'airhorn') {
      // Fanfare staccato tone
      [466, 466, 466, 466, 622].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.1);
      });
    } else if (type === 'glitch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(250, now + 0.05);
      osc.frequency.setValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'ding') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.0);
    }
  }
}
