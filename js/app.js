/**
 * Main Application Orchestrator for Tools Hub
 */
window.App = {
  opus: null,
  drop: null,
  pixel: null,
  thumb: null,
  audio: null,

  init() {
    this.setupTabs();
    this.setupToastContainer();
    this.setupHomeFilters();

    // Initialize Tool Modules
    this.opus = new OpusReel();
    this.drop = new DropStudio();
    this.pixel = new PixelClean();
    this.thumb = new ThumbForge();
    this.audio = new AudioStudio();

    // Welcome Toast
    setTimeout(() => {
      this.showToast('Welcome to Tools Hub! 11 Viral Creator Tools Ready 🚀', 'info');
    }, 400);
  },

  switchTab(tabId) {
    const tab = document.getElementById(tabId);
    if (!tab) return;
    const targetId = tab.dataset.target;

    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.tool-panel');

    tabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    panels.forEach((p) => p.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) targetPanel.classList.add('active');

    // Pause video playback if switching away from OpusReel
    if (targetId !== 'panel-opus' && this.opus && this.opus.isPlaying) {
      this.opus.pauseVideo();
    }

    // Trigger resize / update on newly visible panel
    if (targetId === 'panel-pixel' && this.pixel) {
      this.pixel.updateBrushCursorSize();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.id);
      });
    });

    // Home Card Launch Buttons
    document.querySelectorAll('.tool-launch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.dataset.launch;
        this.switchTab(targetTabId);
      });
    });

    // Back to Hub Buttons inside tools
    document.querySelectorAll('.btn-back-hub').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.switchTab('tab-home');
      });
    });
  },

  setupHomeFilters() {
    const searchInput = document.getElementById('home-search-input');
    const pills = document.querySelectorAll('.cat-pill');

    if (pills) {
      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          pills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          this.filterTools();
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.filterTools();
      });

      // Cmd+K / Ctrl+K shortcut to focus search
      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.switchTab('tab-home');
          searchInput.focus();
          searchInput.select();
        }
      });
    }
  },

  filterTools() {
    const activePill = document.querySelector('.cat-pill.active');
    const activeCat = activePill ? activePill.dataset.cat : 'all';
    const searchInput = document.getElementById('home-search-input');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

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
  },

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

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }
};

// Bootstrap when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
