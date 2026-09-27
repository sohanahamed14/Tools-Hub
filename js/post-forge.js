/**
 * PostForge: Viral Social Post & Mockup Studio
 * Renders viral Twitter/X cards, iOS push alerts, and Reddit story cards on 4K studio canvases.
 */
class PostForge {
  constructor() {
    this.canvas = document.getElementById('post-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Controls
    this.typeSelect = document.getElementById('post-type-select');
    this.bgStyleSelect = document.getElementById('post-bg-style');
    this.tiltToggle = document.getElementById('post-tilt-toggle');
    this.paddingInput = document.getElementById('post-padding-range');
    this.paddingVal = document.getElementById('post-padding-val');
    this.radiusInput = document.getElementById('post-radius-range');
    this.radiusVal = document.getElementById('post-radius-val');

    // Tweet Controls
    this.tweetControls = document.getElementById('post-tweet-controls');
    this.tweetNameInput = document.getElementById('post-tweet-name');
    this.tweetHandleInput = document.getElementById('post-tweet-handle');
    this.tweetBadgeSelect = document.getElementById('post-tweet-badge');
    this.tweetTextInput = document.getElementById('post-tweet-text');
    this.tweetViewsInput = document.getElementById('post-tweet-views');
    this.tweetLikesInput = document.getElementById('post-tweet-likes');
    this.tweetRetweetsInput = document.getElementById('post-tweet-retweets');
    this.tweetAvatarUpload = document.getElementById('post-avatar-upload');
    this.tweetMediaUpload = document.getElementById('post-media-upload');

    // iOS Notification Controls
    this.iosControls = document.getElementById('post-ios-controls');
    this.iosAppSelect = document.getElementById('post-ios-app');
    this.iosTitleInput = document.getElementById('post-ios-title');
    this.iosMessageInput = document.getElementById('post-ios-message');
    this.iosTimeInput = document.getElementById('post-ios-time');

    // Reddit Controls
    this.redditControls = document.getElementById('post-reddit-controls');
    this.redditSubInput = document.getElementById('post-reddit-sub');
    this.redditAuthorInput = document.getElementById('post-reddit-author');
    this.redditFlairInput = document.getElementById('post-reddit-flair');
    this.redditTitleInput = document.getElementById('post-reddit-title');
    this.redditBodyInput = document.getElementById('post-reddit-body');
    this.redditUpvotesInput = document.getElementById('post-reddit-upvotes');

    // Actions
    this.downloadBtn = document.getElementById('post-download-btn');
    this.copyBtn = document.getElementById('post-copy-btn');
    this.sampleBtn = document.getElementById('post-sample-btn');

    // State
    this.avatarImg = null;
    this.mediaImg = null;
    this.currentType = 'tweet'; // 'tweet', 'ios', 'reddit'
    this.bgStyle = 'cosmic'; // 'cosmic', 'sunset', 'cyber', 'obsidian', 'emerald', 'transparent'
    this.padding = 60;
    this.cornerRadius = 24;
    this.isTilt = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDefaultAvatar();
    this.render();
  }

  setupEventListeners() {
    // Mode Switch
    if (this.typeSelect) {
      this.typeSelect.addEventListener('change', (e) => {
        this.currentType = e.target.value;
        this.updateControlVisibility();
        this.render();
      });
    }

    // Canvas Background
    if (this.bgStyleSelect) {
      this.bgStyleSelect.addEventListener('change', (e) => {
        this.bgStyle = e.target.value;
        this.render();
      });
    }

    // Tilt Toggle
    if (this.tiltToggle) {
      this.tiltToggle.addEventListener('change', (e) => {
        this.isTilt = e.target.checked;
        this.render();
      });
    }

    // Sliders
    if (this.paddingInput) {
      this.paddingInput.addEventListener('input', (e) => {
        this.padding = parseInt(e.target.value);
        if (this.paddingVal) this.paddingVal.textContent = `${this.padding}px`;
        this.render();
      });
    }

    if (this.radiusInput) {
      this.radiusInput.addEventListener('input', (e) => {
        this.cornerRadius = parseInt(e.target.value);
        if (this.radiusVal) this.radiusVal.textContent = `${this.cornerRadius}px`;
        this.render();
      });
    }

    // Tweet Inputs
    const tweetInputs = [
      this.tweetNameInput,
      this.tweetHandleInput,
      this.tweetBadgeSelect,
      this.tweetTextInput,
      this.tweetViewsInput,
      this.tweetLikesInput,
      this.tweetRetweetsInput
    ];
    tweetInputs.forEach((el) => {
      if (el) el.addEventListener('input', () => this.render());
    });

    // Avatar Upload
    if (this.tweetAvatarUpload) {
      this.tweetAvatarUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              this.avatarImg = img;
              this.render();
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    // Tweet Media Upload
    if (this.tweetMediaUpload) {
      this.tweetMediaUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              this.mediaImg = img;
              this.render();
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    // iOS Inputs
    const iosInputs = [this.iosAppSelect, this.iosTitleInput, this.iosMessageInput, this.iosTimeInput];
    iosInputs.forEach((el) => {
      if (el) el.addEventListener('input', () => this.render());
    });

    // Reddit Inputs
    const redditInputs = [
      this.redditSubInput,
      this.redditAuthorInput,
      this.redditFlairInput,
      this.redditTitleInput,
      this.redditBodyInput,
      this.redditUpvotesInput
    ];
    redditInputs.forEach((el) => {
      if (el) el.addEventListener('input', () => this.render());
    });

    // Actions
    if (this.downloadBtn) {
      this.downloadBtn.addEventListener('click', () => this.downloadPNG());
    }

    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    }

    if (this.sampleBtn) {
      this.sampleBtn.addEventListener('click', () => this.loadViralPreset());
    }
  }

  updateControlVisibility() {
    if (this.tweetControls) this.tweetControls.classList.toggle('hidden', this.currentType !== 'tweet');
    if (this.iosControls) this.iosControls.classList.toggle('hidden', this.currentType !== 'ios');
    if (this.redditControls) this.redditControls.classList.toggle('hidden', this.currentType !== 'reddit');
  }

  loadDefaultAvatar() {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 160, 160);
    grad.addColorStop(0, '#8b5cf6');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(80, 80, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 70px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 80, 82);

    const img = new Image();
    img.onload = () => {
      this.avatarImg = img;
      this.render();
    };
    img.src = canvas.toDataURL();
  }

  loadViralPreset() {
    if (this.currentType === 'tweet') {
      if (this.tweetNameInput) this.tweetNameInput.value = 'Alex Hormozi';
      if (this.tweetHandleInput) this.tweetHandleInput.value = '@AlexHormozi';
      if (this.tweetBadgeSelect) this.tweetBadgeSelect.value = 'blue';
      if (this.tweetTextInput) {
        this.tweetTextInput.value =
          'Most people don’t lack motivation.\n\nThey lack clarity.\n\nWhen you know exactly what to do next, you just do it.\n\nRemove friction, define the #1 priority, and execute.';
      }
      if (this.tweetViewsInput) this.tweetViewsInput.value = '3.8M';
      if (this.tweetLikesInput) this.tweetLikesInput.value = '64.2K';
      if (this.tweetRetweetsInput) this.tweetRetweetsInput.value = '8,940';
      this.bgStyle = 'cosmic';
      if (this.bgStyleSelect) this.bgStyleSelect.value = 'cosmic';
    } else if (this.currentType === 'ios') {
      if (this.iosAppSelect) this.iosAppSelect.value = 'stripe';
      if (this.iosTitleInput) this.iosTitleInput.value = 'Stripe · Payment Received 🚀';
      if (this.iosMessageInput) this.iosMessageInput.value = 'You received $4,950.00 USD from Enterprise Client. Payout scheduled for tomorrow.';
      if (this.iosTimeInput) this.iosTimeInput.value = 'now';
      this.bgStyle = 'sunset';
      if (this.bgStyleSelect) this.bgStyleSelect.value = 'sunset';
    } else if (this.currentType === 'reddit') {
      if (this.redditSubInput) this.redditSubInput.value = 'r/AskReddit';
      if (this.redditAuthorInput) this.redditAuthorInput.value = 'u/CuriousThinker';
      if (this.redditFlairInput) this.redditFlairInput.value = '🔥 Viral Discussion';
      if (this.redditTitleInput) {
        this.redditTitleInput.value = 'What is a 1% skill that takes under 48 hours to learn but pays dividends for the rest of your life?';
      }
      if (this.redditBodyInput) {
        this.redditBodyInput.value =
          'For me, it was learning basic touch-typing without looking at keys and setting up macro keyboard shortcuts. Doubled my daily output overnight. What’s yours?';
      }
      if (this.redditUpvotesInput) this.redditUpvotesInput.value = '52.4k';
      this.bgStyle = 'cyber';
      if (this.bgStyleSelect) this.bgStyleSelect.value = 'cyber';
    }
    this.render();
    if (window.App && window.App.showToast) {
      window.App.showToast('Viral template preset loaded! 🚀', 'success');
    }
  }

  drawBackground(w, h) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    if (this.bgStyle === 'transparent') {
      return;
    }

    if (this.bgStyle === 'cosmic') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f0c1b');
      grad.addColorStop(0.5, '#2e1065');
      grad.addColorStop(1, '#082f49');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Glowing orbs
      const rad1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, 400);
      rad1.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
      rad1.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, w, h);

      const rad2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, 450);
      rad2.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      rad2.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = rad2;
      ctx.fillRect(0, 0, w, h);
    } else if (this.bgStyle === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#450a0a');
      grad.addColorStop(0.5, '#831843');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const rad = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.2, 550);
      rad.addColorStop(0, 'rgba(244, 63, 94, 0.5)');
      rad.addColorStop(0.8, 'rgba(245, 158, 11, 0.3)');
      rad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, w, h);
    } else if (this.bgStyle === 'cyber') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#042f2e');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const rad = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, 500);
      rad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, w, h);
    } else if (this.bgStyle === 'emerald') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Obsidian matte
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, w, h);

      // Subtle center glow
      const rad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, 600);
      rad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, w, h);
    }

    // Grid dots texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const spacing = 32;
    for (let x = spacing / 2; x < w; x += spacing) {
      for (let y = spacing / 2; y < h; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  render() {
    if (!this.canvas || !this.ctx) return;
    const w = 1400;
    const h = 1000;
    this.canvas.width = w;
    this.canvas.height = h;

    this.drawBackground(w, h);

    this.ctx.save();

    // 3D Tilt transform if enabled
    if (this.isTilt) {
      this.ctx.translate(w / 2, h / 2);
      this.ctx.transform(1, -0.05, 0.02, 0.98, 0, 0);
      this.ctx.translate(-w / 2, -h / 2);
    }

    if (this.currentType === 'tweet') {
      this.renderTweet(w, h);
    } else if (this.currentType === 'ios') {
      this.renderIOS(w, h);
    } else if (this.currentType === 'reddit') {
      this.renderReddit(w, h);
    }

    this.ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  wrapText(ctx, text, maxWidth) {
    const paragraphs = text.split('\n');
    const lines = [];

    paragraphs.forEach((para) => {
      if (para.trim() === '') {
        lines.push('');
        return;
      }
      const words = para.split(' ');
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    });

    return lines;
  }

  renderTweet(canvasW, canvasH) {
    const ctx = this.ctx;
    const pad = this.padding;
    const rad = this.cornerRadius;

    const cardW = 920;
    const cardX = (canvasW - cardW) / 2;
    const cardY = 140;

    const name = (this.tweetNameInput && this.tweetNameInput.value) || 'Creator';
    const handle = (this.tweetHandleInput && this.tweetHandleInput.value) || '@creator';
    const badge = (this.tweetBadgeSelect && this.tweetBadgeSelect.value) || 'blue';
    const text = (this.tweetTextInput && this.tweetTextInput.value) || 'Just launched our brand new creator studio! 🚀';
    const views = (this.tweetViewsInput && this.tweetViewsInput.value) || '1.8M';
    const likes = (this.tweetLikesInput && this.tweetLikesInput.value) || '42.5K';
    const retweets = (this.tweetRetweetsInput && this.tweetRetweetsInput.value) || '5,210';

    // Measure text height
    ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    const contentW = cardW - pad * 2;
    const lines = this.wrapText(ctx, text, contentW);
    const lineHeight = 42;
    const textHeight = lines.length * lineHeight;

    let mediaHeight = 0;
    if (this.mediaImg) {
      mediaHeight = 360;
    }

    const headerHeight = 80;
    const statsHeight = 80;
    const cardH = headerHeight + textHeight + mediaHeight + statsHeight + pad * 2 + 20;

    // Card Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 24;

    // Card Surface
    this.roundRect(ctx, cardX, cardY, cardW, cardH, rad);
    ctx.fillStyle = '#0a0d14';
    ctx.fill();
    ctx.restore();

    // Card Border
    ctx.save();
    this.roundRect(ctx, cardX, cardY, cardW, cardH, rad);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();
    ctx.restore();

    // 1. Header (Avatar + Name + Handle + X Logo)
    const avatarX = cardX + pad;
    const avatarY = cardY + pad;
    const avatarSize = 64;

    ctx.save();
    this.roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarSize / 2);
    ctx.clip();
    if (this.avatarImg) {
      ctx.drawImage(this.avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    } else {
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    }
    ctx.restore();

    // Name & Handle
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, avatarX + avatarSize + 16, avatarY + 6);

    const nameW = ctx.measureText(name).width;

    // Verified Badge
    if (badge === 'blue' || badge === 'gold') {
      const badgeX = avatarX + avatarSize + 16 + nameW + 8;
      const badgeY = avatarY + 8;

      ctx.save();
      ctx.fillStyle = badge === 'gold' ? '#eab308' : '#1d9bf0';
      ctx.beginPath();
      ctx.arc(badgeX + 10, badgeY + 10, 11, 0, Math.PI * 2);
      ctx.fill();

      // Checkmark icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', badgeX + 10, badgeY + 11);
      ctx.restore();
    }

    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#71767b';
    ctx.fillText(handle, avatarX + avatarSize + 16, avatarY + 36);

    // X Logo at top right
    const logoX = cardX + cardW - pad - 28;
    const logoY = avatarY + 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('𝕏', logoX, logoY + 8);

    // 2. Tweet Body Text
    let textY = avatarY + avatarSize + 24;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '400 26px "Plus Jakarta Sans", sans-serif';

    lines.forEach((line) => {
      if (line.startsWith('#') || line.includes('#') || line.includes('@')) {
        // Simple highlight rendering
        const words = line.split(' ');
        let wordX = cardX + pad;
        words.forEach((wrd) => {
          if (wrd.startsWith('#') || wrd.startsWith('@')) {
            ctx.fillStyle = '#1d9bf0';
          } else {
            ctx.fillStyle = '#e7e9ea';
          }
          ctx.fillText(wrd, wordX, textY);
          wordX += ctx.measureText(wrd + ' ').width;
        });
      } else {
        ctx.fillStyle = '#e7e9ea';
        ctx.fillText(line, cardX + pad, textY);
      }
      textY += lineHeight;
    });

    // 3. Media Attachment (if present)
    if (this.mediaImg) {
      const mediaY = textY + 12;
      const mediaW = contentW;
      const mediaH = 340;

      ctx.save();
      this.roundRect(ctx, cardX + pad, mediaY, mediaW, mediaH, 18);
      ctx.clip();
      ctx.drawImage(this.mediaImg, cardX + pad, mediaY, mediaW, mediaH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      textY = mediaY + mediaH + 16;
    }

    // 4. Timestamp & Device
    textY += 12;
    ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#71767b';
    ctx.fillText('10:42 PM · Sep 27, 2026 · Twitter for iPhone', cardX + pad, textY);

    // Divider line
    textY += 32;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + pad, textY);
    ctx.lineTo(cardX + cardW - pad, textY);
    ctx.stroke();

    // 5. Viral Metrics
    textY += 20;
    const metrics = [
      { label: 'Views', val: views, icon: '📊' },
      { label: 'Reposts', val: retweets, icon: '🔁' },
      { label: 'Likes', val: likes, icon: '❤️' },
      { label: 'Bookmarks', val: '12.4K', icon: '🔖' }
    ];

    const colW = contentW / metrics.length;
    metrics.forEach((m, idx) => {
      const mX = cardX + pad + idx * colW;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${m.icon} ${m.val}`, mX, textY);

      ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#71767b';
      ctx.fillText(m.label, mX + 32, textY + 28);
    });
  }

  renderIOS(canvasW, canvasH) {
    const ctx = this.ctx;
    const cardW = 860;
    const cardH = 200;
    const cardX = (canvasW - cardW) / 2;
    const cardY = 380;
    const rad = 28;

    const app = (this.iosAppSelect && this.iosAppSelect.value) || 'messages';
    const title = (this.iosTitleInput && this.iosTitleInput.value) || 'Payment Received 🚀';
    const message = (this.iosMessageInput && this.iosMessageInput.value) || 'You received $4,950.00 USD into your account.';
    const time = (this.iosTimeInput && this.iosTimeInput.value) || 'now';

    // Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    // Translucent glass surface
    this.roundRect(ctx, cardX, cardY, cardW, cardH, rad);
    ctx.fillStyle = 'rgba(25, 28, 36, 0.85)';
    ctx.fill();
    ctx.restore();

    // Border
    ctx.save();
    this.roundRect(ctx, cardX, cardY, cardW, cardH, rad);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();
    ctx.restore();

    // App Icon
    const iconSize = 48;
    const iconX = cardX + 28;
    const iconY = cardY + 28;

    ctx.save();
    this.roundRect(ctx, iconX, iconY, iconSize, iconSize, 12);
    ctx.clip();

    let appBg = '#3b82f6';
    let appSymbol = '💬';
    let appLabel = 'MESSAGES';

    if (app === 'stripe') {
      appBg = '#6366f1';
      appSymbol = '💳';
      appLabel = 'STRIPE';
    } else if (app === 'tiktok') {
      appBg = '#000000';
      appSymbol = '🎵';
      appLabel = 'TIKTOK';
    } else if (app === 'youtube') {
      appBg = '#ef4444';
      appSymbol = '▶️';
      appLabel = 'YOUTUBE';
    } else if (app === 'cashapp') {
      appBg = '#10b981';
      appSymbol = '💵';
      appLabel = 'CASH APP';
    }

    ctx.fillStyle = appBg;
    ctx.fillRect(iconX, iconY, iconSize, iconSize);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(appSymbol, iconX + iconSize / 2, iconY + iconSize / 2);
    ctx.restore();

    // Header Row: App Name & Time
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(appLabel, iconX + iconSize + 16, iconY + 4);

    ctx.textAlign = 'right';
    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(time, cardX + cardW - 32, iconY + 4);

    // Title
    ctx.textAlign = 'left';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, iconX + iconSize + 16, iconY + 30);

    // Body
    ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    const maxW = cardW - iconSize - 80;
    const lines = this.wrapText(ctx, message, maxW);
    let msgY = iconY + 70;
    lines.slice(0, 2).forEach((l) => {
      ctx.fillText(l, iconX + iconSize + 16, msgY);
      msgY += 26;
    });
  }

  renderReddit(canvasW, canvasH) {
    const ctx = this.ctx;
    const cardW = 900;
    const cardX = (canvasW - cardW) / 2;
    const cardY = 160;
    const rad = this.cornerRadius;
    const pad = this.padding;

    const sub = (this.redditSubInput && this.redditSubInput.value) || 'r/AskReddit';
    const author = (this.redditAuthorInput && this.redditAuthorInput.value) || 'u/viral_author';
    const flair = (this.redditFlairInput && this.redditFlairInput.value) || '🔥 Viral Story';
    const title = (this.redditTitleInput && this.redditTitleInput.value) || 'What is a life secret that instantly upgraded your life?';
    const body =
      (this.redditBodyInput && this.redditBodyInput.value) ||
      'I started doing the 2-minute rule: if an action takes less than two minutes, do it immediately instead of putting it off.';
    const upvotes = (this.redditUpvotesInput && this.redditUpvotesInput.value) || '42.8k';

    // Measure body
    ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
    const contentW = cardW - pad * 2 - 60; // minus vote col
    const bodyLines = this.wrapText(ctx, body, contentW);
    const bodyHeight = bodyLines.length * 34;

    ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
    const titleLines = this.wrapText(ctx, title, contentW);
    const titleHeight = titleLines.length * 40;

    const cardH = 140 + titleHeight + bodyHeight + 90 + pad;

    // Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 24;

    this.roundRect(ctx, cardX, cardY, cardW, cardH, rad);
    ctx.fillStyle = '#0e111a';
    ctx.fill();
    ctx.restore();

    // Border
    ctx.save();
    this.roundRect(ctx, cardX, cardY, cardW, cardH, rad);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();
    ctx.restore();

    // Left Vote Column
    const voteColX = cardX + 32;
    const voteColY = cardY + pad;

    // Upvote Arrow
    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▲', voteColX + 16, voteColY + 16);

    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ff4500';
    ctx.fillText(upvotes, voteColX + 16, voteColY + 46);

    ctx.fillStyle = '#64748b';
    ctx.fillText('▼', voteColX + 16, voteColY + 76);

    // Right Content
    const mainX = cardX + 90;
    let currY = cardY + pad - 4;

    // Header: sub + author
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(sub, mainX, currY);

    const subW = ctx.measureText(sub).width;
    ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(` • Posted by ${author} • 4h ago`, mainX + subW, currY + 3);

    // Flair pill
    currY += 36;
    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    const flairW = ctx.measureText(flair).width + 20;

    ctx.save();
    this.roundRect(ctx, mainX, currY, flairW, 26, 6);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.fillText(flair, mainX + 10, currY + 4);
    ctx.restore();

    // Title
    currY += 40;
    ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    titleLines.forEach((tl) => {
      ctx.fillText(tl, mainX, currY);
      currY += 40;
    });

    // Body
    currY += 12;
    ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    bodyLines.forEach((bl) => {
      ctx.fillText(bl, mainX, currY);
      currY += 34;
    });

    // Footer Actions
    currY += 24;
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('💬 3,410 Comments      ↗️ Share      ⭐ Save', mainX, currY);
  }

  downloadPNG() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `postforge_${this.currentType}_${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png', 1.0);
    link.click();

    if (window.App && window.App.showToast) {
      window.App.showToast('4K Post Graphic Exported! 📸✨', 'success');
    }
  }

  async copyToClipboard() {
    if (!this.canvas || !navigator.clipboard) return;
    try {
      this.canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        if (window.App && window.App.showToast) {
          window.App.showToast('Image copied to clipboard! 📋✨', 'success');
        }
      }, 'image/png');
    } catch (err) {
      if (window.App && window.App.showToast) {
        window.App.showToast('Clipboard copy not permitted by browser; please use Download.', 'warning');
      }
    }
  }
}
