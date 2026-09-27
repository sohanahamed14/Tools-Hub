/**
 * Tools Hub — Main Application Orchestrator
 * Inspired by 10015.io UI/UX Design with Light & Dark Mode
 */
window.App = {
  // Tool instances
  opus: null,
  drop: null,
  pixel: null,
  thumb: null,
  audio: null,
  post: null,
  script: null,
  qr: null,
  crop: null,
  typo: null,
  hash: null,
  color: null,
  meta: null,
  text: null,
  code: null,
  shadow: null,

  currentTool: 'home',
  theme: 'light',

  init() {
    this.setupTheme();
    this.setupNavigation();
    this.setupSearch();
    this.setupCategoryPills();
    this.setupToastContainer();

    // Initialize all tool modules
    try {
      if (typeof OpusReel !== 'undefined') this.opus = new OpusReel();
      if (typeof DropStudio !== 'undefined') this.drop = new DropStudio();
      if (typeof PixelClean !== 'undefined') this.pixel = new PixelClean();
      if (typeof ThumbForge !== 'undefined') this.thumb = new ThumbForge();
      if (typeof AudioStudio !== 'undefined') this.audio = new AudioStudio();
      if (typeof PostForge !== 'undefined') this.post = new PostForge();
      if (typeof ScriptForge !== 'undefined') this.script = new ScriptForge();
      if (typeof QRForge !== 'undefined') this.qr = new QRForge();
      if (typeof CropMatrix !== 'undefined') this.crop = new CropMatrix();
      if (typeof TypoForge !== 'undefined') this.typo = new TypoForge();
      if (typeof HashForge !== 'undefined') this.hash = new HashForge();
      if (typeof ColorForge !== 'undefined') this.color = new ColorForge();
      if (typeof MetaForge !== 'undefined') this.meta = new MetaForge();
      if (typeof TextForge !== 'undefined') this.text = new TextForge();
      if (typeof CodeForge !== 'undefined') this.code = new CodeForge();
      if (typeof ShadowForge !== 'undefined') this.shadow = new ShadowForge();
    } catch (err) {
      console.warn('Tool initialization notice:', err);
    }

    // Check hash for deep link
    this.handleHashChange();
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Welcome toast
    setTimeout(() => {
      this.showToast('Tools Hub: 35+ Online Tools Ready in One Box! 🚀', 'info');
    }, 350);
  },

  /* ==========================================================================
     Theme Management (Light / Dark Mode)
     ========================================================================== */
  setupTheme() {
    const savedTheme = localStorage.getItem('toolshub_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.theme = savedTheme || (prefersDark ? 'dark' : 'light');

    this.applyTheme(this.theme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const nextTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(nextTheme);
        this.showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
      });
    }

    // Listen to system theme change if no manual preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('toolshub_theme')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  },

  applyTheme(theme) {
    this.theme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('toolshub_theme', theme);

    const themeLabel = document.getElementById('theme-label');
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }

    // Re-render canvas tools if active
    if (this.currentTool === 'qr' && this.qr) this.qr.render();
    if (this.currentTool === 'color' && this.color) this.color.render();
    if (this.currentTool === 'post' && this.post) this.post.render();
    if (this.currentTool === 'shadow' && this.shadow) this.shadow.render();
  },

  /* ==========================================================================
     Navigation & Tool Switching
     ========================================================================== */
  setupNavigation() {
    // Tool card click handlers
    document.querySelectorAll('.tool-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const tabTarget = card.dataset.tab;
        if (tabTarget) {
          const toolKey = tabTarget.replace('tab-', '');
          this.openTool(toolKey);
        }
      });
    });

    // Brand logo home button
    const brandBtn = document.getElementById('btn-brand-home');
    if (brandBtn) {
      brandBtn.addEventListener('click', () => this.openHome());
    }

    // All tools nav link
    const navHomeBtn = document.getElementById('btn-nav-home');
    if (navHomeBtn) {
      navHomeBtn.addEventListener('click', () => this.openHome());
    }

    // Back to hub buttons inside tool panels
    document.querySelectorAll('.btn-back-hub').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openHome();
      });
    });

    // Categories dropdown toggle
    const catDropBtn = document.getElementById('btn-cat-dropdown');
    const catMenu = document.getElementById('cat-dropdown-menu');
    if (catDropBtn && catMenu) {
      catDropBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        catMenu.classList.toggle('active');
      });

      document.addEventListener('click', () => {
        catMenu.classList.remove('active');
      });

      catMenu.querySelectorAll('.dropdown-item').forEach((item) => {
        item.addEventListener('click', (e) => {
          this.openHome();
          catMenu.classList.remove('active');
        });
      });
    }

    // Scroll to top button in smart footer
    const scrollTopBtn = document.getElementById('btn-scroll-top');
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  },

  openHome() {
    this.currentTool = 'home';
    window.location.hash = '';

    // Pause video playback if leaving OpusReel
    if (this.opus && this.opus.isPlaying) {
      this.opus.pauseVideo();
    }

    document.querySelectorAll('.tool-panel').forEach((p) => p.classList.remove('active'));
    const homePanel = document.getElementById('panel-home');
    if (homePanel) homePanel.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openTool(toolKey) {
    const targetPanelId = `panel-${toolKey}`;
    const targetPanel = document.getElementById(targetPanelId);

    if (!targetPanel) {
      console.warn('Target panel not found:', targetPanelId);
      this.openHome();
      return;
    }

    this.currentTool = toolKey;
    window.location.hash = toolKey;

    // Pause video playback if switching away from OpusReel
    if (toolKey !== 'opus' && this.opus && this.opus.isPlaying) {
      this.opus.pauseVideo();
    }

    document.querySelectorAll('.tool-panel').forEach((p) => p.classList.remove('active'));
    targetPanel.classList.add('active');

    // Trigger tool render/update hooks
    if (toolKey === 'pixel' && this.pixel) this.pixel.updateBrushCursorSize();
    if (toolKey === 'post' && this.post) this.post.render();
    if (toolKey === 'qr' && this.qr) this.qr.render();
    if (toolKey === 'crop' && this.crop) this.crop.render();
    if (toolKey === 'typo' && this.typo) this.typo.render();
    if (toolKey === 'color' && this.color) this.color.render();
    if (toolKey === 'meta' && this.meta) this.meta.render();
    if (toolKey === 'text' && this.text) this.text.render();
    if (toolKey === 'code' && this.code) this.code.render();
    if (toolKey === 'shadow' && this.shadow) this.shadow.render();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  handleHashChange() {
    const hash = window.location.hash.replace('#', '').trim();
    if (!hash || hash.startsWith('cat-')) {
      if (!hash) {
        this.openHome();
      } else if (hash.startsWith('cat-')) {
        this.openHome();
        const catKey = hash.replace('cat-', '');
        const pill = document.querySelector(`.cat-pill[data-cat="${catKey}"]`);
        if (pill) {
          document.querySelectorAll('.cat-pill').forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          this.filterTools();
        }
        const targetSection = document.getElementById(hash);
        if (targetSection) {
          setTimeout(() => {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 60);
        }
      }
      return;
    }

    const validTools = [
      'opus', 'audio', 'drop', 'pixel', 'thumb', 'post', 'script',
      'qr', 'crop', 'typo', 'hash', 'color', 'meta', 'text', 'code', 'shadow'
    ];

    if (validTools.includes(hash)) {
      this.openTool(hash);
    }
  },

  /* ==========================================================================
     Live Search Filter (10015 style)
     ========================================================================== */
  setupSearch() {
    const searchInput = document.getElementById('home-search-input');
    const clearBtn = document.getElementById('search-clear-btn');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

      // If user is currently in a tool and starts typing, switch to home
      if (q && this.currentTool !== 'home') {
        this.openHome();
      }

      this.filterTools();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        this.filterTools();
      });
    }

    // Shortcut: Cmd+K / Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (this.currentTool !== 'home') this.openHome();
        searchInput.focus();
        searchInput.select();
      }
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        searchInput.blur();
        this.filterTools();
      }
    });
  },

  /* ==========================================================================
     Category Filter Pills
     ========================================================================== */
  setupCategoryPills() {
    const pills = document.querySelectorAll('.cat-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.filterTools();
      });
    });
  },

  filterTools() {
    const searchInput = document.getElementById('home-search-input');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (query) {
      const allPill = document.querySelector('.cat-pill[data-cat="all"]');
      if (allPill && !allPill.classList.contains('active')) {
        document.querySelectorAll('.cat-pill').forEach((p) => p.classList.remove('active'));
        allPill.classList.add('active');
      }
    }

    const activePill = document.querySelector('.cat-pill.active');
    const activeCat = activePill ? activePill.dataset.cat : 'all';

    const cards = document.querySelectorAll('.tool-card');
    cards.forEach((card) => {
      const cardCat = card.dataset.category || '';
      const catMatches = activeCat === 'all' || cardCat === activeCat;
      const textMatches = !query || card.textContent.toLowerCase().includes(query);

      if (catMatches && textMatches) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    // Check visibility of category groups
    document.querySelectorAll('.tool-category-group').forEach((group) => {
      const groupCat = group.dataset.group;
      const groupCards = group.querySelectorAll('.tool-card');
      let visibleInGroup = 0;

      groupCards.forEach((c) => {
        if (c.style.display !== 'none') visibleInGroup++;
      });

      if (activeCat !== 'all' && activeCat !== groupCat) {
        group.style.display = 'none';
      } else if (visibleInGroup === 0 && query) {
        group.style.display = 'none';
      } else {
        group.style.display = '';
      }
    });
  },

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */
  setupToastContainer() {
    this.toastContainer = document.getElementById('toast-container');
  },

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }
};

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
