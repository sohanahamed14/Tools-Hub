/**
 * CodeForge — All-In-One Developer Toolkit
 * URL Encoder/Decoder, Base64 Studio, JSON Formatter & Validator, HTML Entities
 */
class CodeForge {
  constructor() {
    this.activeSubtab = 'url';
    this.bindEvents();
  }

  bindEvents() {
    // Subtab switching
    document.querySelectorAll('[data-code-subtab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-code-subtab]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSubtab = btn.dataset.codeSubtab;

        document.querySelectorAll('.code-subpanel').forEach((p) => p.classList.remove('active'));
        const target = document.getElementById(`code-subpanel-${this.activeSubtab}`);
        if (target) target.classList.add('active');
      });
    });

    // --- URL Tool ---
    const urlIn = document.getElementById('cf-url-input');
    const urlOut = document.getElementById('cf-url-output');
    const btnUrlEncode = document.getElementById('btn-cf-url-encode');
    const btnUrlDecode = document.getElementById('btn-cf-url-decode');
    const btnUrlCopy = document.getElementById('btn-cf-url-copy');

    if (btnUrlEncode) {
      btnUrlEncode.addEventListener('click', () => {
        try {
          urlOut.value = encodeURIComponent(urlIn.value);
          window.App.showToast('URL Encoded!', 'success');
        } catch (e) {
          window.App.showToast('Encoding Error: ' + e.message, 'error');
        }
      });
    }

    if (btnUrlDecode) {
      btnUrlDecode.addEventListener('click', () => {
        try {
          urlOut.value = decodeURIComponent(urlIn.value);
          window.App.showToast('URL Decoded!', 'success');
        } catch (e) {
          window.App.showToast('Decoding Error: ' + e.message, 'error');
        }
      });
    }

    if (btnUrlCopy) {
      btnUrlCopy.addEventListener('click', () => {
        if (!urlOut.value) return;
        navigator.clipboard.writeText(urlOut.value);
        window.App.showToast('URL copied to clipboard!', 'success');
      });
    }

    // --- Base64 Tool ---
    const b64In = document.getElementById('cf-b64-input');
    const b64Out = document.getElementById('cf-b64-output');
    const btnB64Encode = document.getElementById('btn-cf-b64-encode');
    const btnB64Decode = document.getElementById('btn-cf-b64-decode');
    const btnB64Copy = document.getElementById('btn-cf-b64-copy');

    if (btnB64Encode) {
      btnB64Encode.addEventListener('click', () => {
        try {
          const bytes = new TextEncoder().encode(b64In.value);
          const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
          b64Out.value = btoa(binString);
          window.App.showToast('Base64 Encoded!', 'success');
        } catch (e) {
          window.App.showToast('Encoding Error: ' + e.message, 'error');
        }
      });
    }

    if (btnB64Decode) {
      btnB64Decode.addEventListener('click', () => {
        try {
          const binString = atob(b64In.value.trim());
          const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
          b64Out.value = new TextDecoder().decode(bytes);
          window.App.showToast('Base64 Decoded!', 'success');
        } catch (e) {
          window.App.showToast('Invalid Base64 string', 'error');
        }
      });
    }

    if (btnB64Copy) {
      btnB64Copy.addEventListener('click', () => {
        if (!b64Out.value) return;
        navigator.clipboard.writeText(b64Out.value);
        window.App.showToast('Base64 copied to clipboard!', 'success');
      });
    }

    // --- JSON Formatter Tool ---
    const jsonIn = document.getElementById('cf-json-input');
    const jsonOut = document.getElementById('cf-json-output');
    const jsonStatus = document.getElementById('cf-json-status');
    const btnJsonFormat = document.getElementById('btn-cf-json-format');
    const btnJsonMinify = document.getElementById('btn-cf-json-minify');
    const btnJsonValidate = document.getElementById('btn-cf-json-validate');
    const btnJsonCopy = document.getElementById('btn-cf-json-copy');
    const btnJsonSample = document.getElementById('btn-cf-json-sample');

    if (btnJsonFormat) {
      btnJsonFormat.addEventListener('click', () => {
        try {
          const parsed = JSON.parse(jsonIn.value);
          jsonOut.value = JSON.stringify(parsed, null, 2);
          if (jsonStatus) {
            jsonStatus.textContent = 'Valid JSON ✓';
            jsonStatus.className = 'status-badge status-success';
          }
          window.App.showToast('JSON Formatted!', 'success');
        } catch (e) {
          if (jsonStatus) {
            jsonStatus.textContent = 'Invalid JSON: ' + e.message;
            jsonStatus.className = 'status-badge status-error';
          }
          window.App.showToast('Invalid JSON syntax', 'error');
        }
      });
    }

    if (btnJsonMinify) {
      btnJsonMinify.addEventListener('click', () => {
        try {
          const parsed = JSON.parse(jsonIn.value);
          jsonOut.value = JSON.stringify(parsed);
          if (jsonStatus) {
            jsonStatus.textContent = 'Minified JSON ✓';
            jsonStatus.className = 'status-badge status-success';
          }
          window.App.showToast('JSON Minified!', 'success');
        } catch (e) {
          if (jsonStatus) {
            jsonStatus.textContent = 'Invalid JSON: ' + e.message;
            jsonStatus.className = 'status-badge status-error';
          }
          window.App.showToast('Invalid JSON syntax', 'error');
        }
      });
    }

    if (btnJsonValidate) {
      btnJsonValidate.addEventListener('click', () => {
        try {
          JSON.parse(jsonIn.value);
          if (jsonStatus) {
            jsonStatus.textContent = 'Valid JSON ✓';
            jsonStatus.className = 'status-badge status-success';
          }
          window.App.showToast('JSON is completely valid!', 'success');
        } catch (e) {
          if (jsonStatus) {
            jsonStatus.textContent = 'Syntax Error: ' + e.message;
            jsonStatus.className = 'status-badge status-error';
          }
          window.App.showToast('Invalid JSON: ' + e.message, 'error');
        }
      });
    }

    if (btnJsonCopy) {
      btnJsonCopy.addEventListener('click', () => {
        if (!jsonOut.value) return;
        navigator.clipboard.writeText(jsonOut.value);
        window.App.showToast('JSON copied to clipboard!', 'success');
      });
    }

    if (btnJsonSample) {
      btnJsonSample.addEventListener('click', () => {
        jsonIn.value = `{"app":"Tools Hub","version":2.0,"toolsCount":35,"features":["text-forge","drop-studio","code-forge","pixel-clean","opus-reel"],"clientSideOnly":true,"author":{"name":"Tools Hub Team","website":"https://tools-hub014.pages.dev"}}`;
        btnJsonFormat.click();
      });
    }
  }

  render() {}
}
