/**
 * ShadowForge — CSS Glassmorphism & Box Shadow Studio
 * Interactive visual generator for modern shadows & glassmorphism
 */
class ShadowForge {
  constructor() {
    this.activeTool = 'shadow'; // 'shadow' | 'glass'
    this.previewBox = document.getElementById('sf-preview-box');
    this.cssOutput = document.getElementById('sf-css-output');
    this.bindEvents();
    this.update();
  }

  bindEvents() {
    // Mode switcher
    document.querySelectorAll('[data-sf-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-sf-mode]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTool = btn.dataset.sfMode;

        document.querySelectorAll('.sf-mode-section').forEach((s) => s.classList.remove('active'));
        const sec = document.getElementById(`sf-section-${this.activeTool}`);
        if (sec) sec.classList.add('active');
        this.update();
      });
    });

    // Shadow inputs
    const shadowInputs = [
      'sf-x', 'sf-y', 'sf-blur', 'sf-spread', 'sf-color', 'sf-opacity', 'sf-inset', 'sf-radius'
    ];
    shadowInputs.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.update());
      }
    });

    // Glass inputs
    const glassInputs = [
      'sf-glass-blur', 'sf-glass-opacity', 'sf-glass-border', 'sf-glass-radius'
    ];
    glassInputs.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.update());
      }
    });

    // Preview background toggles
    document.querySelectorAll('[data-sf-bg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-sf-bg]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const stage = document.getElementById('sf-preview-stage');
        if (stage) {
          stage.dataset.bg = btn.dataset.sfBg;
        }
      });
    });

    // Copy CSS button
    const btnCopy = document.getElementById('btn-sf-copy');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (!this.cssOutput) return;
        navigator.clipboard.writeText(this.cssOutput.textContent);
        window.App.showToast('CSS copied to clipboard!', 'success');
      });
    }

    // Presets
    document.querySelectorAll('[data-sf-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.sfPreset;
        this.applyPreset(preset);
      });
    });
  }

  applyPreset(preset) {
    if (this.activeTool === 'shadow') {
      const presets = {
        subtle: { x: 0, y: 2, blur: 8, spread: 0, opacity: 8, inset: false },
        elevated: { x: 0, y: 10, blur: 25, spread: -5, opacity: 14, inset: false },
        deep: { x: 0, y: 20, blur: 40, spread: -10, opacity: 24, inset: false },
        colored: { x: 0, y: 12, blur: 30, spread: 0, opacity: 35, inset: false, color: '#474bff' },
        inner: { x: 0, y: 4, blur: 12, spread: 0, opacity: 15, inset: true }
      };
      const p = presets[preset];
      if (p) {
        if (p.x !== undefined) document.getElementById('sf-x').value = p.x;
        if (p.y !== undefined) document.getElementById('sf-y').value = p.y;
        if (p.blur !== undefined) document.getElementById('sf-blur').value = p.blur;
        if (p.spread !== undefined) document.getElementById('sf-spread').value = p.spread;
        if (p.opacity !== undefined) document.getElementById('sf-opacity').value = p.opacity;
        if (p.inset !== undefined) document.getElementById('sf-inset').checked = p.inset;
        if (p.color !== undefined) document.getElementById('sf-color').value = p.color;
        this.update();
      }
    } else {
      const presets = {
        frosted: { blur: 16, opacity: 40, border: 20 },
        crystal: { blur: 8, opacity: 20, border: 30 },
        heavy: { blur: 30, opacity: 60, border: 15 }
      };
      const p = presets[preset];
      if (p) {
        if (p.blur !== undefined) document.getElementById('sf-glass-blur').value = p.blur;
        if (p.opacity !== undefined) document.getElementById('sf-glass-opacity').value = p.opacity;
        if (p.border !== undefined) document.getElementById('sf-glass-border').value = p.border;
        this.update();
      }
    }
  }

  hexToRgb(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const num = parseInt(c, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  update() {
    if (!this.previewBox || !this.cssOutput) return;

    if (this.activeTool === 'shadow') {
      const x = document.getElementById('sf-x')?.value || 0;
      const y = document.getElementById('sf-y')?.value || 10;
      const blur = document.getElementById('sf-blur')?.value || 25;
      const spread = document.getElementById('sf-spread')?.value || 0;
      const hex = document.getElementById('sf-color')?.value || '#474bff';
      const opacity = (document.getElementById('sf-opacity')?.value || 15) / 100;
      const isInset = document.getElementById('sf-inset')?.checked;
      const radius = document.getElementById('sf-radius')?.value || 16;

      const [r, g, b] = this.hexToRgb(hex);
      const rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      const insetStr = isInset ? 'inset ' : '';
      const boxShadow = `${insetStr}${x}px ${y}px ${blur}px ${spread}px ${rgba}`;

      this.previewBox.style.backdropFilter = 'none';
      this.previewBox.style.webkitBackdropFilter = 'none';
      this.previewBox.style.background = 'var(--bg-secondary)';
      this.previewBox.style.border = '1px solid var(--border-color)';
      this.previewBox.style.borderRadius = `${radius}px`;
      this.previewBox.style.boxShadow = boxShadow;

      const css = `/* Box Shadow */\nbox-shadow: ${boxShadow};\nborder-radius: ${radius}px;`;
      this.cssOutput.textContent = css;

      // Update value tags
      this.setValueText('sf-val-x', `${x}px`);
      this.setValueText('sf-val-y', `${y}px`);
      this.setValueText('sf-val-blur', `${blur}px`);
      this.setValueText('sf-val-spread', `${spread}px`);
      this.setValueText('sf-val-opacity', `${Math.round(opacity * 100)}%`);
      this.setValueText('sf-val-radius', `${radius}px`);
    } else {
      const blur = document.getElementById('sf-glass-blur')?.value || 16;
      const opacity = (document.getElementById('sf-glass-opacity')?.value || 40) / 100;
      const borderAlpha = (document.getElementById('sf-glass-border')?.value || 20) / 100;
      const radius = document.getElementById('sf-glass-radius')?.value || 16;

      const bg = `rgba(255, 255, 255, ${opacity})`;
      const border = `1px solid rgba(255, 255, 255, ${borderAlpha})`;
      const backdrop = `blur(${blur}px)`;
      const shadow = `0 8px 32px 0 rgba(71, 75, 255, 0.15)`;

      this.previewBox.style.background = bg;
      this.previewBox.style.backdropFilter = backdrop;
      this.previewBox.style.webkitBackdropFilter = backdrop;
      this.previewBox.style.border = border;
      this.previewBox.style.borderRadius = `${radius}px`;
      this.previewBox.style.boxShadow = shadow;

      const css = `/* Modern Glassmorphism */\nbackground: ${bg};\nbackdrop-filter: ${backdrop};\n-webkit-backdrop-filter: ${backdrop};\nborder-radius: ${radius}px;\nborder: ${border};\nbox-shadow: ${shadow};`;
      this.cssOutput.textContent = css;

      this.setValueText('sf-val-glass-blur', `${blur}px`);
      this.setValueText('sf-val-glass-opacity', `${Math.round(opacity * 100)}%`);
      this.setValueText('sf-val-glass-border', `${Math.round(borderAlpha * 100)}%`);
      this.setValueText('sf-val-glass-radius', `${radius}px`);
    }
  }

  setValueText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  render() {
    this.update();
  }
}
