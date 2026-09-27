/**
 * HashForge: Niche Hashtag Set Generator & Caption Builder
 * Generates optimized hashtag strategies by niche with mix of high/medium/low
 * competition tags, copy-paste sets, and character counting for Instagram/TikTok/YouTube.
 */
class HashForge {
  constructor() {
    this.nicheSelect = document.getElementById('hash-niche-select');
    this.customInput = document.getElementById('hash-custom-input');
    this.generateBtn = document.getElementById('hash-generate-btn');
    this.resultBox = document.getElementById('hash-result-box');
    this.countEl = document.getElementById('hash-tag-count');
    this.charCountEl = document.getElementById('hash-char-count');
    this.copyAllBtn = document.getElementById('hash-copy-all-btn');
    this.shuffleBtn = document.getElementById('hash-shuffle-btn');
    this.platformSelect = document.getElementById('hash-platform-select');
    this.setCountInput = document.getElementById('hash-set-count');
    if (!this.nicheSelect) return;
    this.currentTags = [];
    this.init();
  }

  init() {
    this.generateBtn.addEventListener('click', () => this.generate());
    this.copyAllBtn.addEventListener('click', () => this.copyAll());
    this.shuffleBtn.addEventListener('click', () => this.shuffle());
    this.nicheSelect.addEventListener('change', () => this.generate());
    this.generate();
  }

  getNicheData() {
    return {
      'finance': {
        high: ['#money','#finance','#investing','#business','#entrepreneur','#wealth','#crypto','#stocks','#success','#motivation','#millionaire','#trading','#passiveincome','#financialfreedom','#realestate'],
        mid: ['#moneymindset','#investingtips','#sidehuslte','#makemoney','#wealthbuilding','#budgeting','#personalfinance','#stockmarket','#cryptotrading','#financetips','#debtfree','#moneymatters','#creditrepair'],
        low: ['#financetiktok','#moneytok','#richdadpoordad','#fireMovement','#indexfunds','#dividendinvesting','#etfinvesting','#retirementtips','#financecoach','#moneycoach','#cashflowquadrant']
      },
      'fitness': {
        high: ['#fitness','#gym','#workout','#fitnessmotivation','#fit','#bodybuilding','#training','#health','#muscle','#fitfam','#weightloss','#exercise','#healthylifestyle','#gains','#protein'],
        mid: ['#gymlife','#workouttips','#fitspo','#legday','#chestday','#armday','#homeworkout','#fitnessjourney','#transformation','#mealprep','#macros','#ppl','#strengthtraining'],
        low: ['#fitnesstok','#gymtok','#bulkingseason','#cuttingseason','#recomp','#5x5stronglifts','#pushpulllegs','#creatine','#preworkout','#gymshark','#fitnessvlog','#nattyorbulk']
      },
      'tech': {
        high: ['#tech','#technology','#coding','#programming','#ai','#software','#developer','#python','#javascript','#startup','#innovation','#machinelearning','#webdev','#data','#automation'],
        mid: ['#techlife','#codingtips','#webdeveloper','#appdevelopment','#saas','#buildinpublic','#indiehacker','#reactjs','#nextjs','#chatgpt','#artificialintelligence','#devtools','#techstartup'],
        low: ['#techtok','#learntocode','#100daysofcode','#codenewbie','#devjourney','#sidehustletech','#nocode','#lowcode','#vibe coding','#aitools','#aistartup','#techcreator']
      },
      'food': {
        high: ['#food','#foodie','#cooking','#recipe','#instafood','#yummy','#delicious','#homemade','#baking','#healthyfood','#dinner','#lunch','#breakfast','#foodporn','#chef'],
        mid: ['#foodblogger','#cookingtips','#easymeal','#mealprep','#recipeideas','#30minutemeal','#onepotmeal','#airfryer','#instantpot','#veganrecipe','#glutenfree','#highprotein','#budgetmeals'],
        low: ['#foodtok','#recipetok','#whaticook','#whatieatinaday','#asmrcooking','#cookingasmr','#kitchenhacks','#pantrymeal','#lazycooking','#studentmeals','#mealideas','#easyrecipes']
      },
      'beauty': {
        high: ['#beauty','#makeup','#skincare','#hair','#fashion','#style','#glam','#beautytips','#mua','#cosmetics','#haircare','#nails','#selfcare','#glow','#lips'],
        mid: ['#makeupartist','#skincareroutine','#beautyhack','#makeuptutorial','#skincareproducts','#drugstoremakeup','#cleanbeauty','#kbeauty','#hairtutorial','#nailart','#beautyreview','#grwm','#glowup'],
        low: ['#beautytok','#skintok','#makeuptok','#hairtok','#glassskin','#morningroutine','#getreadywithme','#skinbarrierrepair','#retinol','#spf','#niacinamide','#slugging']
      },
      'travel': {
        high: ['#travel','#adventure','#explore','#wanderlust','#vacation','#travelgram','#trip','#nature','#photography','#beach','#travelphotography','#holiday','#sunset','#instatravel','#tourism'],
        mid: ['#travellife','#traveltips','#budgettravel','#solotravel','#backpacking','#travelblogger','#digitalnomad','#roadtrip','#flightdeals','#hotelreview','#travelguide','#hiddenspots','#travelcouple'],
        low: ['#traveltok','#travelreels','#cheapflights','#googlemapfinds','#mustvisit','#bucketlisttrip','#hostellife','#vanlife','#workandtravel','#passportstamps','#travelonthedime']
      },
      'gaming': {
        high: ['#gaming','#gamer','#videogames','#twitch','#ps5','#xbox','#pc','#streamer','#esports','#fortnite','#minecraft','#nintendo','#gameplay','#cod','#apex'],
        mid: ['#gaminglife','#gamingcommunity','#pcgaming','#consolegaming','#gameclips','#epicmoments','#gamingsetup','#streamerlife','#letsplay','#gamenight','#gamerlife','#indiegame','#retrogaming'],
        low: ['#gamingtok','#gametok','#cozygaming','#cozygamer','#steamdeck','#gamingaesthetic','#gamereview','#firstplaythrough','#gamingmoments','#clutchmoment','#squadwipe']
      },
      'motivation': {
        high: ['#motivation','#mindset','#success','#inspiration','#goals','#hustle','#grind','#discipline','#quotes','#selfimprovement','#growth','#believe','#positivity','#focus','#dreams'],
        mid: ['#growthmindset','#dailymotivation','#motivationalspeaker','#mentalhealth','#selfhelp','#productivitytips','#morningroutine','#levelup','#motivationalquotes','#stoicism','#atomichabits','#deepwork','#journaling'],
        low: ['#motivationtok','#masculinity','#goggins','#hormozi','#tateism','#sigmagrindset','#darkpsychology','#emotionalintelligence','#socialskills','#coldshowers','#selfmastery']
      }
    };
  }

  generate() {
    const niche = this.nicheSelect.value;
    const platform = this.platformSelect ? this.platformSelect.value : 'instagram';
    const maxCount = this.setCountInput ? parseInt(this.setCountInput.value) || 30 : 30;
    const niches = this.getNicheData();
    const data = niches[niche];
    if (!data) return;

    const customRaw = this.customInput ? this.customInput.value.trim() : '';
    const customTags = customRaw ? customRaw.split(/[\s,]+/).filter(t => t).map(t => t.startsWith('#') ? t : '#' + t) : [];

    // Mix strategy: 30% high, 40% mid, 30% low (proven engagement formula)
    const highCount = Math.round(maxCount * 0.3);
    const midCount = Math.round(maxCount * 0.4);
    const lowCount = maxCount - highCount - midCount;

    const pick = (arr, n) => {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(n, shuffled.length));
    };

    let tags = [
      ...pick(data.high, highCount),
      ...pick(data.mid, midCount),
      ...pick(data.low, lowCount),
      ...customTags
    ];

    // Platform limits
    if (platform === 'tiktok') tags = tags.slice(0, 5);
    else if (platform === 'youtube') tags = tags.slice(0, 15);
    else tags = tags.slice(0, 30);

    this.currentTags = tags;
    this.renderTags();
  }

  shuffle() {
    this.currentTags.sort(() => Math.random() - 0.5);
    this.renderTags();
    if (window.App) window.App.showToast('Hashtags reshuffled! 🔀', 'info');
  }

  renderTags() {
    if (!this.resultBox) return;
    this.resultBox.innerHTML = '';

    this.currentTags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'hash-tag-pill';
      pill.textContent = tag;
      pill.addEventListener('click', () => {
        pill.classList.toggle('removed');
        this.updateCounts();
      });
      this.resultBox.appendChild(pill);
    });
    this.updateCounts();
  }

  updateCounts() {
    const activeTags = this.resultBox.querySelectorAll('.hash-tag-pill:not(.removed)');
    const tagTexts = [...activeTags].map(el => el.textContent);
    if (this.countEl) this.countEl.textContent = tagTexts.length;
    if (this.charCountEl) this.charCountEl.textContent = tagTexts.join(' ').length;
  }

  copyAll() {
    const activeTags = this.resultBox.querySelectorAll('.hash-tag-pill:not(.removed)');
    const text = [...activeTags].map(el => el.textContent).join(' ');
    if (!text) { if (window.App) window.App.showToast('No tags to copy!', 'warning'); return; }
    navigator.clipboard.writeText(text).then(() => {
      if (window.App) window.App.showToast(`${activeTags.length} hashtags copied! 📋✨`, 'success');
    });
  }
}
