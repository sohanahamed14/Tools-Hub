/**
 * TextForge — All-In-One Text Suite
 * Case Converter, Text Analyzer / Counter & Text Cleaner
 */
class TextForge {
  constructor() {
    this.inputText = document.getElementById('text-forge-input');
    this.outputText = document.getElementById('text-forge-output');
    this.charCount = document.getElementById('tf-stat-chars');
    this.wordCount = document.getElementById('tf-stat-words');
    this.sentenceCount = document.getElementById('tf-stat-sentences');
    this.lineCount = document.getElementById('tf-stat-lines');
    this.readTime = document.getElementById('tf-stat-read');
    this.speakTime = document.getElementById('tf-stat-speak');

    this.bindEvents();
    this.updateStats();
  }

  bindEvents() {
    if (!this.inputText) return;

    this.inputText.addEventListener('input', () => {
      this.updateStats();
    });

    // Case Converter buttons
    document.querySelectorAll('[data-tf-case]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const caseType = btn.dataset.tfCase;
        this.convertCase(caseType);
      });
    });

    // Text cleaner buttons
    document.querySelectorAll('[data-tf-clean]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cleanType = btn.dataset.tfClean;
        this.cleanText(cleanType);
      });
    });

    // Copy and Clear
    const btnCopy = document.getElementById('btn-tf-copy');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const val = this.outputText ? this.outputText.value : this.inputText.value;
        if (!val) {
          window.App.showToast('Nothing to copy', 'warning');
          return;
        }
        navigator.clipboard.writeText(val).then(() => {
          window.App.showToast('Copied to clipboard!', 'success');
        });
      });
    }

    const btnClear = document.getElementById('btn-tf-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.inputText.value = '';
        if (this.outputText) this.outputText.value = '';
        this.updateStats();
        window.App.showToast('Cleared input', 'info');
      });
    }

    const btnSample = document.getElementById('btn-tf-sample');
    if (btnSample) {
      btnSample.addEventListener('click', () => {
        this.inputText.value = `Tools Hub is a premier, browser-native suite engineered for creators and developers.\nFeaturing over 30+ viral utilities: audio processing, video clipping, image background removal, QR generation, fancy fonts, and SEO tags.\nEvery single tool executes client-side with zero data uploaded to external servers. Fast, secure, and completely free!`;
        this.updateStats();
        this.convertCase('title');
      });
    }
  }

  updateStats() {
    const text = this.inputText ? this.inputText.value : '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text]).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;

    // Average reading speed: 225 wpm, speaking: 130 wpm
    const readMin = words > 0 ? (words / 225).toFixed(1) : '0';
    const speakMin = words > 0 ? (words / 130).toFixed(1) : '0';

    if (this.charCount) this.charCount.textContent = chars.toLocaleString();
    if (this.wordCount) this.wordCount.textContent = words.toLocaleString();
    if (this.sentenceCount) this.sentenceCount.textContent = sentences.toLocaleString();
    if (this.lineCount) this.lineCount.textContent = lines.toLocaleString();
    if (this.readTime) this.readTime.textContent = `${readMin} min`;
    if (this.speakTime) this.speakTime.textContent = `${speakMin} min`;
  }

  setOutput(result) {
    if (this.outputText) {
      this.outputText.value = result;
    } else if (this.inputText) {
      this.inputText.value = result;
    }
    window.App.showToast('Converted text!', 'success');
  }

  convertCase(type) {
    const text = this.inputText ? this.inputText.value : '';
    if (!text) {
      window.App.showToast('Please enter text first', 'warning');
      return;
    }

    let res = '';
    switch (type) {
      case 'upper':
        res = text.toUpperCase();
        break;
      case 'lower':
        res = text.toLowerCase();
        break;
      case 'title':
        res = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
      case 'sentence':
        res = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        res = text
          .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
          .replace(/^([A-Z])/, (m, chr) => chr.toLowerCase());
        break;
      case 'pascal':
        res = text
          .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
          .replace(/^([a-z])/, (m, chr) => chr.toUpperCase());
        break;
      case 'snake':
        res = text
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '')
          .toLowerCase();
        break;
      case 'constant':
        res = text
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '')
          .toUpperCase();
        break;
      case 'kebab':
        res = text
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')
          .toLowerCase();
        break;
      case 'alternating':
        res = text
          .split('')
          .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
          .join('');
        break;
      default:
        res = text;
    }

    this.setOutput(res);
  }

  cleanText(type) {
    const text = this.inputText ? this.inputText.value : '';
    if (!text) return;

    let res = text;
    switch (type) {
      case 'extra-spaces':
        res = text.replace(/[ \t]+/g, ' ').trim();
        break;
      case 'empty-lines':
        res = text.replace(/^\s*[\r\n]/gm, '');
        break;
      case 'strip-html':
        res = text.replace(/<[^>]*>?/gm, '');
        break;
      case 'dedupe-lines': {
        const lines = text.split(/\r?\n/);
        res = [...new Set(lines)].join('\n');
        break;
      }
      case 'sort-az': {
        const lines = text.split(/\r?\n/);
        res = lines.sort((a, b) => a.localeCompare(b)).join('\n');
        break;
      }
      default:
        break;
    }

    this.setOutput(res);
  }

  render() {
    this.updateStats();
  }
}
