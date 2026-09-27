/**
 * MetaForge: SEO Meta Tag, Open Graph & Twitter Card Generator
 * Generates all essential meta tags with live preview of how the page
 * appears in Google Search, Twitter Cards, and Facebook/LinkedIn shares.
 * Copy the full HTML snippet or individual tags. 100% client-side.
 */
class MetaForge {
  constructor() {
    this.titleInput = document.getElementById('meta-title-input');
    this.descInput = document.getElementById('meta-desc-input');
    this.urlInput = document.getElementById('meta-url-input');
    this.imageInput = document.getElementById('meta-image-input');
    this.authorInput = document.getElementById('meta-author-input');
    this.keywordsInput = document.getElementById('meta-keywords-input');
    this.typeSelect = document.getElementById('meta-type-select');
    this.twitterSelect = document.getElementById('meta-twitter-card');
    this.codeOutput = document.getElementById('meta-code-output');
    this.googlePreview = document.getElementById('meta-google-preview');
    this.twitterPreview = document.getElementById('meta-twitter-preview');
    this.fbPreview = document.getElementById('meta-fb-preview');
    this.copyBtn = document.getElementById('meta-copy-btn');
    this.titleCounter = document.getElementById('meta-title-counter');
    this.descCounter = document.getElementById('meta-desc-counter');
    if (!this.titleInput) return;
    this.init();
  }

  init() {
    const fields = [this.titleInput, this.descInput, this.urlInput, this.imageInput, this.authorInput, this.keywordsInput, this.typeSelect, this.twitterSelect];
    fields.forEach(el => { if (el) el.addEventListener('input', () => this.render()); });
    if (this.copyBtn) this.copyBtn.addEventListener('click', () => this.copyAll());
    this.render();
  }

  getValues() {
    return {
      title: this.titleInput?.value || 'My Awesome Page',
      desc: this.descInput?.value || 'A compelling description of your page content that drives clicks.',
      url: this.urlInput?.value || 'https://example.com/page',
      image: this.imageInput?.value || 'https://example.com/og-image.jpg',
      author: this.authorInput?.value || '',
      keywords: this.keywordsInput?.value || '',
      type: this.typeSelect?.value || 'website',
      twitterCard: this.twitterSelect?.value || 'summary_large_image',
    };
  }

  generateTags(v) {
    let tags = [];
    tags.push(`<title>${this.esc(v.title)}</title>`);
    tags.push(`<meta name="description" content="${this.esc(v.desc)}">`);
    if (v.keywords) tags.push(`<meta name="keywords" content="${this.esc(v.keywords)}">`);
    if (v.author) tags.push(`<meta name="author" content="${this.esc(v.author)}">`);
    tags.push('');
    tags.push('<!-- Open Graph / Facebook -->');
    tags.push(`<meta property="og:type" content="${v.type}">`);
    tags.push(`<meta property="og:url" content="${this.esc(v.url)}">`);
    tags.push(`<meta property="og:title" content="${this.esc(v.title)}">`);
    tags.push(`<meta property="og:description" content="${this.esc(v.desc)}">`);
    tags.push(`<meta property="og:image" content="${this.esc(v.image)}">`);
    tags.push('');
    tags.push('<!-- Twitter Card -->');
    tags.push(`<meta name="twitter:card" content="${v.twitterCard}">`);
    tags.push(`<meta name="twitter:url" content="${this.esc(v.url)}">`);
    tags.push(`<meta name="twitter:title" content="${this.esc(v.title)}">`);
    tags.push(`<meta name="twitter:description" content="${this.esc(v.desc)}">`);
    tags.push(`<meta name="twitter:image" content="${this.esc(v.image)}">`);
    tags.push('');
    tags.push('<!-- Canonical -->');
    tags.push(`<link rel="canonical" href="${this.esc(v.url)}">`);
    return tags.join('\n');
  }

  render() {
    const v = this.getValues();

    // Update character counters
    if (this.titleCounter) {
      const len = v.title.length;
      this.titleCounter.textContent = `${len}/60`;
      this.titleCounter.className = 'meta-counter' + (len > 60 ? ' over' : len > 50 ? ' warn' : '');
    }
    if (this.descCounter) {
      const len = v.desc.length;
      this.descCounter.textContent = `${len}/160`;
      this.descCounter.className = 'meta-counter' + (len > 160 ? ' over' : len > 140 ? ' warn' : '');
    }

    // Code output
    if (this.codeOutput) {
      this.codeOutput.textContent = this.generateTags(v);
    }

    // Google Search Preview
    if (this.googlePreview) {
      const truncTitle = v.title.length > 60 ? v.title.slice(0, 57) + '...' : v.title;
      const truncDesc = v.desc.length > 160 ? v.desc.slice(0, 157) + '...' : v.desc;
      const displayUrl = v.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      this.googlePreview.innerHTML = `
        <div class="gp-breadcrumb">${this.escHtml(displayUrl)}</div>
        <div class="gp-title">${this.escHtml(truncTitle)}</div>
        <div class="gp-desc">${this.escHtml(truncDesc)}</div>
      `;
    }

    // Twitter Card Preview
    if (this.twitterPreview) {
      const domain = this.extractDomain(v.url);
      this.twitterPreview.innerHTML = `
        <div class="tp-image-placeholder">
          <span>🖼️ ${v.image ? 'og:image' : 'No image set'}</span>
        </div>
        <div class="tp-content">
          <div class="tp-domain">${this.escHtml(domain)}</div>
          <div class="tp-title">${this.escHtml(v.title)}</div>
          <div class="tp-desc">${this.escHtml(v.desc.slice(0, 100))}</div>
        </div>
      `;
    }

    // Facebook / LinkedIn Preview
    if (this.fbPreview) {
      const domain = this.extractDomain(v.url).toUpperCase();
      this.fbPreview.innerHTML = `
        <div class="fp-image-placeholder">
          <span>🖼️ ${v.image ? 'og:image' : 'No image'}</span>
        </div>
        <div class="fp-content">
          <div class="fp-domain">${this.escHtml(domain)}</div>
          <div class="fp-title">${this.escHtml(v.title)}</div>
          <div class="fp-desc">${this.escHtml(v.desc.slice(0, 120))}</div>
        </div>
      `;
    }
  }

  extractDomain(url) {
    try { return new URL(url).hostname; } catch { return url; }
  }

  copyAll() {
    const v = this.getValues();
    const code = this.generateTags(v);
    navigator.clipboard.writeText(code).then(() => {
      if (window.App) window.App.showToast('All meta tags copied! 🏷️📋', 'success');
    });
  }

  esc(s) { return s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
}
