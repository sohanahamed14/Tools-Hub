/**
 * TypoForge: Unicode Fancy Text Generator for Social Bios
 * Converts plain text to 20+ Unicode font styles for Instagram, Twitter, TikTok bios.
 * 100% client-side character mapping — no API calls.
 */
class TypoForge {
  constructor() {
    this.inputEl = document.getElementById('typo-input');
    this.outputGrid = document.getElementById('typo-output-grid');
    this.counterEl = document.getElementById('typo-char-counter');
    if (!this.inputEl) return;
    this.fonts = this.buildFontMaps();
    this.init();
  }

  init() {
    this.inputEl.addEventListener('input', () => this.render());
    this.render();
  }

  buildFontMaps() {
    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const maps = [
      { name: '𝔹𝕠𝕝𝕕 𝔻𝕠𝕦𝕓𝕝𝕖-𝕊𝕥𝕣𝕦𝕔𝕜', tag: 'Double-Struck', chars: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡' },
      { name: '𝓢𝓬𝓻𝓲𝓹𝓽 𝓑𝓸𝓵𝓭', tag: 'Script Bold', chars: '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝓍𝓎𝓏0123456789' },
      { name: '𝒮𝒸𝓇𝒾𝓅𝓉', tag: 'Script', chars: '𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏0123456789' },
      { name: '𝗕𝗼𝗹𝗱 𝗦𝗮𝗻𝘀', tag: 'Bold Sans', chars: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵' },
      { name: '𝘐𝘵𝘢𝘭𝘪𝘤 𝘚𝘢𝘯𝘴', tag: 'Italic Sans', chars: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻0123456789' },
      { name: '𝙱𝚘𝚕𝚍 𝙸𝚝𝚊𝚕𝚒𝚌 𝚂𝚊𝚗𝚜', tag: 'Bold Italic Sans', chars: '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯0123456789' },
      { name: '𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎', tag: 'Monospace', chars: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿' },
      { name: '𝔉𝔯𝔞𝔨𝔱𝔲𝔯 (Gothic)', tag: 'Fraktur', chars: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷0123456789' },
      { name: '𝕭𝖔𝖑𝖉 𝕱𝖗𝖆𝖐𝖙𝖚𝖗', tag: 'Bold Fraktur', chars: '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟0123456789' },
      { name: 'Ⓒⓘⓡⓒⓛⓔⓓ', tag: 'Circled', chars: 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨' },
      { name: '🅂🅀🅄🄰🅁🄴🄳', tag: 'Squared', chars: '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789' },
      { name: '🅝🅔🅖🅐🅣🅘🅥🅔 🅢🅠', tag: 'Neg Squared', chars: '🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩0123456789' },
    ];

    return maps.map(m => {
      const charArr = [...m.chars];
      const baseArr = [...base];
      const map = {};
      baseArr.forEach((c, i) => { if (charArr[i]) map[c] = charArr[i]; });
      return { name: m.name, tag: m.tag, map };
    });
  }

  convert(text, fontMap) {
    return [...text].map(c => fontMap[c] || c).join('');
  }

  render() {
    const text = this.inputEl.value || 'Your Bio Text Here';
    if (this.counterEl) this.counterEl.textContent = `${text.length} chars`;
    if (!this.outputGrid) return;
    this.outputGrid.innerHTML = '';

    // Special decorators first
    const decorators = [
      { name: '⊹ Sparkle Wrap ⊹', fn: t => `⊹ ${t} ⊹` },
      { name: '『 Japanese Bracket 』', fn: t => `『 ${t} 』` },
      { name: '✦ Star Divider ✦', fn: t => `✦ ${t} ✦` },
      { name: '═══ Title Bar ═══', fn: t => `═══ ${t} ═══` },
      { name: '【 Bold Bracket 】', fn: t => `【 ${t} 】` },
      { name: '◈ Diamond Frame ◈', fn: t => `◈ ${t} ◈` },
      { name: '꧁ Ornament ꧂', fn: t => `꧁ ${t} ꧂` },
      { name: 'S̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶', fn: t => [...t].map(c => c + '\u0336').join('') },
      { name: 'U̲n̲d̲e̲r̲l̲i̲n̲e̲', fn: t => [...t].map(c => c + '\u0332').join('') },
      { name: 'W̊i̊d̊e̊ ̊D̊o̊t̊s̊', fn: t => [...t].map(c => c + '\u030A').join('') },
      { name: 'Ｆｕｌｌｗｉｄｔｈ', fn: t => [...t].map(c => { const code = c.charCodeAt(0); if (code >= 33 && code <= 126) return String.fromCharCode(code + 65248); return c; }).join('') },
      { name: 'ꜱᴍᴀʟʟ ᴄᴀᴘꜱ', fn: t => { const sc = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ'; return [...t.toLowerCase()].map(c => { const i = 'abcdefghijklmnopqrstuvwxyz'.indexOf(c); return i >= 0 ? sc[i] : c; }).join(''); } },
      { name: 'ᵗⁱⁿʸ ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ', fn: t => { const sup = 'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ'; return [...t.toLowerCase()].map(c => { const i = 'abcdefghijklmnopqrstuvwxyz'.indexOf(c); return i >= 0 ? sup[i] : c; }).join(''); } },
      { name: 'ɟlıddǝp', fn: t => { const fl = 'ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz'; return [...t.toLowerCase()].reverse().map(c => { const i = 'abcdefghijklmnopqrstuvwxyz'.indexOf(c); return i >= 0 ? fl[i] : c; }).join(''); } },
      { name: '🄼🄸🅇🄴🄳 🅂🅃🅈🄻🄴', fn: t => [...t].map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join('') },
    ];

    // Font variants
    this.fonts.forEach(f => {
      const converted = this.convert(text, f.map);
      this.addCard(f.tag, converted);
    });

    // Decorators
    decorators.forEach(d => {
      const converted = d.fn(text);
      this.addCard(d.name, converted);
    });
  }

  addCard(label, text) {
    const card = document.createElement('div');
    card.className = 'typo-result-card';
    card.innerHTML = `
      <div class="typo-result-header">
        <span class="typo-result-label">${label}</span>
        <button class="btn-copy-typo" title="Copy to clipboard">📋 Copy</button>
      </div>
      <p class="typo-result-text">${this.escapeHtml(text)}</p>
    `;
    card.querySelector('.btn-copy-typo').addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        if (window.App) window.App.showToast(`"${label}" copied! 📋✨`, 'success');
      });
    });
    // Click entire card to copy
    card.querySelector('.typo-result-text').addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        if (window.App) window.App.showToast(`Copied! 📋`, 'success');
      });
    });
    this.outputGrid.appendChild(card);
  }

  escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
}
