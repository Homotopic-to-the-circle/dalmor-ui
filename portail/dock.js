// Portail MJ — sceau flottant, panneau, recherche AideDD et panneau latéral AideDD.
// Thème « nuit » de Sonerezh : bleu marine profond, cadres dorés, IM Fell English SC + Alegreya.
(() => {
  if (window.top !== window || window.__portailMJ) return;
  window.__portailMJ = true;
  const HUB = !!window.__PORTAIL_HUB__;
  const ON_AIDEDD = /(^|\.)aidedd\.org$/i.test(location.hostname);
  const isAidedd = (u) => /^https?:\/\/(www\.)?aidedd\.org\//i.test(u || '');
  const I = self.pmjIcon;

  const send = (msg) => new Promise((res) => {
    try { chrome.runtime.sendMessage(msg, (r) => { void chrome.runtime.lastError; res(r); }); }
    catch (e) { res(null); }
  });

  /* ---------- Polices embarquées (chargées en mémoire : pas bloquées par la CSP des sites) ---------- */
  (async () => {
    if (!document.fonts || [...document.fonts].some((f) => f.family.replace(/"/g, '') === 'PMJ Fell')) return;
    const L = [['PMJ Fell', 'im-fell-english-sc-latin-400-normal', '400', 'normal'],
      ['PMJ Alegreya', 'alegreya-latin-400-normal', '400', 'normal'],
      ['PMJ Alegreya', 'alegreya-latin-400-italic', '400', 'italic'],
      ['PMJ Alegreya', 'alegreya-latin-700-normal', '700', 'normal']];
    for (const [fam, file, weight, style] of L) {
      try {
        const buf = await (await fetch(chrome.runtime.getURL(`fonts/${file}.woff2`))).arrayBuffer();
        const ff = new FontFace(fam, buf, { weight, style }); await ff.load(); document.fonts.add(ff);
      } catch (e) {}
    }
  })();

  const CSS = `
:host{all:initial}
:host{--disp:"PMJ Fell","IM Fell English SC",Georgia,"Times New Roman",serif;
  --body:"PMJ Alegreya","Alegreya",Georgia,"Times New Roman",serif;--dw:42vw}
/* NUIT = palette Sonerezh */
.nuit{--bg:#070d1c;--bg2:#0a1224;--card:#0e1830;--card2:#132042;--fg:#ece3cc;--muted:#8a93a9;--faint:#5b6479;
  --gold:#cfa955;--gold-hi:#ecd08a;--gold-dim:rgba(207,169,85,.38);--gold-soft:rgba(207,169,85,.12);--rule:rgba(207,169,85,.18);
  --red:#d06a58;--red-soft:rgba(208,106,88,.14);--on-acc:#0a1224;--key-b:rgba(207,169,85,.26);
  --grad:radial-gradient(ellipse at 50% -20%,#14234a 0%,#070d1c 60%);--scrim:rgba(3,6,14,.5);--shadow:rgba(0,0,0,.55);
  --filet:linear-gradient(90deg,var(--gold) 0%,var(--gold) 55%,transparent 100%);
  --cadre-sh:inset 0 0 0 3px var(--card),inset 0 0 0 4px rgba(207,169,85,.16);
  --cadre-sh2:inset 0 0 0 3px var(--card2),inset 0 0 0 4px var(--gold-dim)}
/* JOUR = palette app MJ / Fiches (parchemin, encre, lie-de-vin) */
.jour{--bg:#efe2c2;--bg2:#e7d6ae;--card:#f6ecd4;--card2:#fbf4e4;--fg:#2a1c12;--muted:#6e5a44;--faint:#9c8565;
  --gold:#7a1c12;--gold-hi:#7a1c12;--gold-dim:#cdb68c;--gold-soft:rgba(122,28,18,.08);--rule:rgba(122,28,18,.14);
  --red:#7a1c12;--red-soft:#ecd3b8;--on-acc:#fbf4e4;--key-b:#cdb68c;
  --grad:radial-gradient(ellipse at 50% -20%,#f8efda 0%,#efe2c2 60%);--scrim:rgba(42,28,18,.32);--shadow:rgba(80,50,20,.3);
  --filet:var(--gold);
  --cadre-sh:0 1px 0 rgba(255,255,255,.6) inset,0 1px 3px rgba(80,50,20,.12);
  --cadre-sh2:0 1px 0 rgba(255,255,255,.7) inset,0 0 0 1px var(--gold)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
button,input{font:inherit;color:inherit;margin:0}
button{cursor:pointer;touch-action:manipulation;background:none;border:0;padding:0}
svg{display:block}
.root{font:17px/1.35 var(--body);color:var(--fg)}
h1,h2{font-family:var(--disp);font-weight:400;margin:0;color:var(--gold-hi)}
h2{font-size:1.3rem;letter-spacing:.03em;padding-bottom:5px;position:relative}
h2::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--filet)}
.cadre{background:var(--card);border:1px solid var(--gold-dim);border-radius:4px;box-shadow:var(--cadre-sh)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 14px;background:transparent;border:1px solid var(--gold-dim);border-radius:3px;color:var(--gold-hi);font-family:var(--disp);font-size:1.05rem;white-space:nowrap}
.btn:active{background:var(--gold-soft)}
.btn svg{width:24px;height:24px}
.btn.plein{background:var(--gold);border-color:var(--gold);color:var(--on-acc)}
.btn.plein:active{filter:brightness(1.12)}
.btn.rouge{border-color:rgba(208,106,88,.55);color:var(--red)}
.btn.rouge:active,.btn.rouge.confirm{background:var(--red-soft)}
.btn.rouge.confirm{border-color:var(--red)}
.btn.on{background:var(--gold-soft);border-color:var(--gold)}
.chip{min-height:44px;padding:0 15px;border:1px solid var(--gold-dim);border-radius:22px;background:transparent;color:var(--fg);font-family:var(--disp);font-size:1.02rem;white-space:nowrap;flex:none}
.chip.on{background:var(--gold);border-color:var(--gold);color:var(--on-acc)}
.mini{width:52px;height:52px;flex:none;display:grid;place-items:center;border:1px solid transparent;border-radius:3px;color:var(--gold)}
.mini:active{border-color:var(--gold-dim);background:var(--gold-soft)}
.mini svg{width:22px;height:22px}
.mini.confirm{color:var(--red);border-color:var(--red);font-family:var(--disp);font-size:.95rem;width:auto;padding:0 10px}

/* sceau flottant */
.handle{position:fixed;z-index:2147483647;width:60px;height:60px;border-radius:50%;display:grid;place-items:center;color:#ecd08a;
  background:radial-gradient(circle at 42% 34%,#a8382a 0%,#7a1c12 48%,#4e0f09 100%);border:1.5px solid #cfa955;
  box-shadow:inset 0 0 0 4px rgba(78,15,9,.55),inset 0 0 0 5px rgba(236,208,138,.45),0 2px 3px rgba(0,0,0,.25),0 6px 16px rgba(30,10,5,.45);
  opacity:.85;touch-action:none;transition:opacity .2s,transform .15s,right .22s,left .22s}
.handle:active{opacity:1;transform:scale(.94)}
.handle svg{width:30px;height:30px;filter:drop-shadow(0 1px 0 rgba(40,8,4,.7))}
.handle.hold{box-shadow:inset 0 0 0 4px rgba(78,15,9,.55),inset 0 0 0 5px #ecd08a,0 0 0 8px rgba(207,169,85,.3)}

/* panneau */
.scrim{position:fixed;inset:0;z-index:2147483646;background:var(--scrim);opacity:0;pointer-events:none;transition:opacity .2s}
.open .scrim{opacity:1;pointer-events:auto}
.panel{position:fixed;top:0;bottom:0;right:0;z-index:2147483647;width:min(400px,92vw);display:flex;flex-direction:column;gap:12px;padding:10px 16px 14px;overflow-y:auto;overscroll-behavior:contain;
  background:var(--bg) var(--grad);border-left:1px solid var(--gold-dim);
  transform:translateX(105%);transition:transform .22s ease;box-shadow:-10px 0 34px var(--shadow);scrollbar-width:thin;scrollbar-color:var(--gold-dim) transparent}
.left .panel{left:0;right:auto;border-left:0;border-right:1px solid var(--gold-dim);transform:translateX(-105%)}
.open .panel{transform:none}
.tete{display:flex;align-items:center;gap:10px;padding-bottom:10px;border-bottom:1px solid var(--gold-dim)}
.marque{flex:1;display:flex;flex-direction:column;line-height:1}
.marque h1{font-size:1.75rem;letter-spacing:.04em}
.marque small{font-family:var(--disp);color:var(--muted);font-size:.8rem;letter-spacing:.08em;margin-top:4px}
.nav{display:flex;gap:6px}
.nav .btn{flex:1;padding:0;min-width:0}
.apps{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tile{position:relative;height:84px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:var(--gold)}
.tile svg,.tile .txt-ic{width:36px;height:36px;font-size:30px;line-height:36px;text-align:center}
.tile .nm{font-family:var(--disp);font-size:1.12rem;color:var(--fg);letter-spacing:.02em}
.tile:active{background:var(--card2)}
.tile.cur{border-color:var(--gold);background:var(--card2);box-shadow:var(--cadre-sh2)}
.tile.cur .nm{color:var(--gold-hi)}
.tile .ouv{position:absolute;top:8px;right:10px;width:7px;height:7px;background:var(--gold);transform:rotate(45deg)}
.search-btn{min-height:58px;font-size:1.2rem}
.tabs{display:flex;flex-direction:column}
.trow{display:flex;align-items:center;min-height:54px;border-bottom:1px solid var(--rule)}
.trow .t{flex:1;min-width:0;display:flex;align-items:center;gap:12px;min-height:54px;text-align:left;padding-left:4px;color:var(--fg)}
.trow .t:active{background:var(--gold-soft)}
.trow .t svg,.trow .t .txt-ic,.trow img{width:22px;height:22px;flex:none;color:var(--gold);font-size:16px;line-height:22px;text-align:center}
.trow .lab{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.trow .lab b{font-family:var(--disp);font-weight:400;color:var(--gold)}
.trow .lab i{color:var(--muted)}
.trow.act .t{box-shadow:inset 3px 0 0 var(--gold)}
.trow.act .lab{color:var(--gold-hi)}
.son{font-style:italic;color:var(--gold);font-size:.85rem;margin-left:6px}
.foot{display:flex;gap:8px;margin-top:auto;padding-top:6px}
.foot .btn{flex:1}
.vide{color:var(--faint);font-style:italic;padding:8px 2px}

/* accueil (nouvel onglet) */
.hub .panel{position:static;transform:none;width:min(1040px,96vw);margin:3vh auto;padding:18px 26px 22px;gap:18px;border:1px solid var(--gold-dim);border-radius:4px;
  background:var(--card);box-shadow:var(--cadre-sh),0 10px 40px var(--shadow);overflow:visible}
.hub .marque h1{font-size:2.3rem}
.hub .apps{grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}
.hub .tile{height:140px}
.hub .tile svg,.hub .tile .txt-ic{width:52px;height:52px;font-size:44px;line-height:52px}
.hub .tile .nm{font-size:1.35rem}

/* recherche */
.sov{position:fixed;inset:0;z-index:2147483647;display:none;flex-direction:column;gap:10px;padding:12px 16px 0;
  background:var(--bg) var(--grad)}
.sov.on{display:flex}
.sbar{display:flex;gap:8px;align-items:stretch}
.qw{flex:1;display:flex;align-items:center;gap:12px;padding:0 16px;color:var(--gold)}
.qw svg{width:26px;height:26px;flex:none}
.q{flex:1;min-width:0;height:60px;border:0;background:transparent;color:var(--fg);font:1.55rem var(--body);outline:none;user-select:text;-webkit-user-select:text}
.q::placeholder{color:var(--faint);font-style:italic}
.sbar .btn{width:60px;min-height:62px;padding:0}
.chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;flex:none;padding:1px}
.st{font-size:.85rem;color:var(--muted);font-style:italic;display:flex;gap:12px;align-items:center;min-height:20px}
.st button{color:var(--gold);font-style:normal;font-family:var(--disp);text-decoration:underline;text-underline-offset:3px}
.results{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--gold-dim) transparent}
.res{display:flex;align-items:center;gap:12px;width:100%;min-height:62px;padding:6px 6px;text-align:left;border-bottom:1px solid var(--rule);color:var(--fg)}
.res:active{background:var(--gold-soft)}
.res .n{font-weight:700;font-size:1.2rem}
.res .e{font-style:italic;color:var(--muted);font-size:.92rem}
.res .c{margin-left:auto;font-family:var(--disp);color:var(--gold);font-size:1rem;flex:none}
.res.web .n{font-weight:400;font-family:var(--disp);color:var(--gold-hi)}
.res.web{border-bottom:0;border-top:1px dashed var(--gold-dim);margin-top:4px}
.aide{color:var(--faint);font-style:italic;padding:18px 6px;font-size:1.05rem}
.kbd{flex:none;margin:0 -16px;padding:9px 8px 11px;display:flex;flex-direction:column;gap:7px;background:var(--bg2);border-top:1px solid var(--gold-dim)}
.kbd.off{display:none}
.kr{display:flex;gap:7px;justify-content:center}
.key{flex:1;max-width:86px;height:58px;border:1px solid var(--key-b);border-radius:3px;background:var(--card);color:var(--fg);font:1.4rem var(--body);display:grid;place-items:center}
.key:active{background:var(--gold-soft);border-color:var(--gold)}
.key.w2{max-width:176px;flex:2;font:1.05rem var(--disp);color:var(--gold-hi)}
.key.w5{max-width:540px;flex:6;font:1.05rem var(--disp);color:var(--muted)}
.key svg{width:26px;height:26px;color:var(--gold-hi)}

/* panneau latéral AideDD */
.drawer{position:fixed;top:0;bottom:0;right:0;z-index:2147483645;width:var(--dw);display:none;flex-direction:column;background:var(--bg);
  border-left:1px solid var(--gold);box-shadow:-10px 0 34px var(--shadow)}
.drawer.on{display:flex}
.left .drawer{right:auto;left:0;border-left:0;border-right:1px solid var(--gold)}
.dhead{display:flex;align-items:center;gap:2px;padding:4px 6px 4px 18px;background:var(--bg);border-bottom:1px solid var(--gold-dim);flex:none}
.dhead .ttl{flex:1;min-width:0;padding:0 8px;font-family:var(--disp);font-size:1.2rem;color:var(--gold-hi);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dhead .mini[disabled]{opacity:.3}
.dbody{flex:1;position:relative;background:#fff}
.dbody iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}
.dshield{position:absolute;inset:0;display:none}
.drawer.drag .dshield{display:block}
.grip{position:absolute;top:0;bottom:0;left:-16px;width:32px;z-index:2;touch-action:none;display:grid;place-items:center;cursor:ew-resize}
.left .grip{left:auto;right:-16px}
.grip i{width:12px;height:76px;border-radius:3px;background:var(--card);border:1px solid var(--gold);box-shadow:inset 3px 0 0 -1px var(--gold-dim),inset -3px 0 0 -1px var(--gold-dim)}
`;

  /* ---------- DOM ---------- */
  const host = document.createElement('div');
  host.id = 'portail-mj';
  host.style.cssText = HUB ? 'display:block' : 'all:initial;position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0';
  const root = host.attachShadow({ mode: 'open' });
  try { const sh = new CSSStyleSheet(); sh.replaceSync(CSS); root.adoptedStyleSheets = [sh]; }
  catch (e) { const s = document.createElement('style'); s.textContent = CSS; root.appendChild(s); }

  const wrap = document.createElement('div');
  wrap.className = 'root jour' + (HUB ? ' hub open' : '');
  wrap.innerHTML = `
    ${HUB ? '' : `<button class="handle" aria-label="Portail MJ">${I('de')}</button><div class="scrim"></div>`}
    <section class="drawer">
      <div class="grip"><i></i></div>
      <div class="dhead">
        <button class="mini" data-d="back" title="Fiche précédente">${I('back')}</button>
        <div class="ttl">AideDD</div>
        <button class="mini" data-d="zm" title="Plus petit">${I('minus')}</button>
        <button class="mini" data-d="zp" title="Plus grand">${I('plus')}</button>
        <button class="mini" data-d="search" title="Rechercher">${I('search')}</button>
        <button class="mini" data-d="tab" title="Ouvrir en onglet">${I('ext')}</button>
        <button class="mini" data-d="close" title="Fermer le panneau">${I('close')}</button>
      </div>
      <div class="dbody"><div class="dshield"></div></div>
    </section>
    <aside class="panel">
      <div class="tete">
        <div class="marque"><h1>Portail</h1><small>TABLE DU MAÎTRE DU JEU</small></div>
        ${HUB ? '' : `<button class="mini" data-a="hide" title="Fermer">${I('close')}</button>`}
      </div>
      <div class="nav">
        ${HUB ? '' : `<button class="btn" data-a="back" title="Page précédente">${I('back')}</button>
        <button class="btn" data-a="fwd" title="Page suivante">${I('fwd')}</button>
        <button class="btn" data-a="reload" title="Recharger">${I('reload')}</button>`}
        <button class="btn" data-a="last" title="Onglet précédent">${I('last')}</button>
        ${HUB ? '' : `<button class="btn" data-a="home" title="Accueil">${I('home')}</button>`}
        <button class="btn" data-a="fs" title="Plein écran">${I('fs')}</button>
        <button class="btn" data-a="theme" title="Jour / nuit (thème commun des apps)">${I('lune')}</button>
      </div>
      <h2>Apps</h2>
      <div class="apps"></div>
      <button class="btn plein search-btn" data-a="search">${I('search')} Rechercher dans AideDD</button>
      <h2>Onglets ouverts</h2>
      <div class="tabs"></div>
      <div class="foot">
        ${HUB ? '' : `<button class="btn rouge" data-a="closeTab">${I('close')} Fermer cet onglet</button>`}
        <button class="btn" data-a="options">${I('gear')} Réglages</button>
      </div>
    </aside>
    <div class="sov">
      <div class="sbar">
        <label class="qw cadre">${I('search')}<input class="q" type="text" inputmode="none" autocomplete="off" spellcheck="false" placeholder="sort, monstre, objet, don, règle…"></label>
        <button class="btn" data-s="kbd" title="Clavier tactile">${I('clavier')}</button>
        <button class="btn" data-s="close" title="Fermer">${I('close')}</button>
      </div>
      <div class="chips"></div>
      <div class="st"></div>
      <div class="results"></div>
      <div class="kbd"></div>
    </div>`;
  root.appendChild(wrap);
  (HUB ? document.body : document.documentElement).appendChild(host);

  const $ = (s) => root.querySelector(s);
  const panel = $('.panel'), appsEl = $('.apps'), tabsEl = $('.tabs');
  const sov = $('.sov'), q = $('.q'), resEl = $('.results'), stEl = $('.st'), chipsEl = $('.chips'), kbdEl = $('.kbd');
  const drawer = $('.drawer'), dbody = $('.dbody'), dttl = $('.dhead .ttl');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let S = null, CFG = { side: 'right', handleY: 0.5, drawerW: 0.42, drawerZoom: 1, aideddPanel: true };

  /* ---------- Placement ---------- */
  const handle = $('.handle');
  function applyCfg(c) {
    CFG = { ...CFG, ...c };
    const left = CFG.side === 'left';
    wrap.classList.toggle('left', left);
    pickTheme();
    wrap.style.setProperty('--dw', `${Math.round(Math.min(Math.max(CFG.drawerW || 0.42, 0.22), 0.8) * 100)}vw`);
    placeHandle();
  }
  /* ---------- Thème : jour (parchemin, comme MJ/Fiches) ou nuit (comme Sonerezh) ---------- */
  const nb = (u) => (u || '').toLowerCase().replace(/[?#].*$/, '').replace(/index\.html?$/, '');
  function appHere() {
    let best = null; const here = nb(location.href);
    for (const a of CFG.apps || []) { const p = nb(a.match || a.url); if (p && here.startsWith(p) && (!best || p.length > nb(best.match || best.url).length)) best = a; }
    return best;
  }
  function pageIsDark() {
    for (const el of [document.body, document.documentElement]) {
      if (!el) continue;
      const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
      if (!m) continue;
      const [r, g, b, al = 1] = m.map(Number);
      if (al < 0.1) continue;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b < 110;
    }
    return matchMedia('(prefers-color-scheme: dark)').matches;
  }
  // Thème commun Dal-Mor : dans une app Dal-Mor, on lit <html data-theme> posé par dalmor-ui/theme.js ;
  // ailleurs (accueil, AideDD…), on suit le dernier choix connu, recopié dans CFG.sharedTheme.
  const LSK = 'dalmor-theme';
  const ORDRE = ['jour', 'nuit', 'heure'];
  const isDalmorPage = () => document.documentElement.hasAttribute('data-theme') && /github\.io$|^localhost$/.test(location.hostname);
  const effectif = (c) => {
    if (c === 'heure') { const h = new Date().getHours(); return h >= 19 || h < 7 ? 'nuit' : 'jour'; }
    return c === 'nuit' ? 'nuit' : 'jour';
  };
  function choixActuel() {
    if (isDalmorPage()) { try { const v = localStorage.getItem(LSK); if (ORDRE.includes(v)) return v; } catch (e) {} return null; }
    return ORDRE.includes(CFG.sharedTheme) ? CFG.sharedTheme : null;
  }
  function pickTheme() {
    let t;
    if (isDalmorPage()) {
      t = document.documentElement.getAttribute('data-theme') === 'nuit' ? 'nuit' : 'jour';
      const c = choixActuel();
      if (c && c !== CFG.sharedTheme) { CFG.sharedTheme = c; send({ type: 'saveCfg', patch: { sharedTheme: c } }); }
    } else if (CFG.sharedTheme) t = effectif(CFG.sharedTheme);
    else t = pageIsDark() ? 'nuit' : 'jour';
    wrap.classList.toggle('jour', t === 'jour'); wrap.classList.toggle('nuit', t === 'nuit');
    updThemeBtn();
  }
  function updThemeBtn() {
    const b = root.querySelector('[data-a="theme"]'); if (!b) return;
    const nuit = wrap.classList.contains('nuit'), c = choixActuel();
    b.innerHTML = I(c === 'heure' ? 'horloge' : nuit ? 'soleil' : 'lune');
    b.title = c === 'heure' ? 'Thème : selon l’heure (toucher : jour)' : nuit ? 'Thème : nuit (toucher : selon l’heure)' : 'Thème : jour (toucher : nuit)';
  }
  // appliquer un choix dans cette page (si c'est une app Dal-Mor : stockage commun + theme.js)
  function appliquerChoix(v) {
    CFG.sharedTheme = v;
    if (isDalmorPage()) {
      try { localStorage.setItem(LSK, v); } catch (e) {}
      window.dispatchEvent(new Event('dalmor-theme-sync'));
    }
    pickTheme();
  }
  function placeHandle() {
    if (!handle) return;
    const left = CFG.side === 'left';
    const off = drawer.classList.contains('on') ? `calc(var(--dw) + 22px)` : '8px';
    handle.style.left = left ? off : '';
    handle.style.right = left ? '' : off;
    const y = Math.min(Math.max(CFG.handleY ?? 0.5, 0.05), 0.92);
    handle.style.top = `calc(${(y * 100).toFixed(2)}vh - 29px)`;
  }

  /* ---------- Sceau : tap = panneau, appui long = onglet précédent, glisser = déplacer ---------- */
  if (handle) {
    let down = null, timer = null;
    handle.addEventListener('pointerdown', (e) => {
      handle.setPointerCapture(e.pointerId);
      down = { y: e.clientY, drag: false, long: false };
      timer = setTimeout(() => { if (down && !down.drag) { down.long = true; handle.classList.add('hold'); send({ type: 'last' }); } }, 480);
      e.preventDefault();
    });
    handle.addEventListener('pointermove', (e) => {
      if (!down) return;
      if (!down.drag && Math.abs(e.clientY - down.y) > 10) { down.drag = true; clearTimeout(timer); }
      if (down.drag) handle.style.top = `${Math.min(Math.max(e.clientY - 29, 6), innerHeight - 64)}px`;
    });
    handle.addEventListener('pointerup', (e) => {
      if (!down) return;
      clearTimeout(timer); handle.classList.remove('hold');
      if (down.drag) { CFG.handleY = e.clientY / innerHeight; send({ type: 'saveCfg', patch: { handleY: CFG.handleY } }); }
      else if (!down.long) toggle(true);
      down = null;
    });
    handle.addEventListener('pointercancel', () => { clearTimeout(timer); handle.classList.remove('hold'); down = null; });
    $('.scrim').addEventListener('click', () => toggle(false));
  }

  async function toggle(open) {
    wrap.classList.toggle('open', open);
    if (open) await refresh();
  }

  /* ---------- Panneau ---------- */
  async function refresh() {
    S = await send({ type: 'state' });
    if (!S || S.error) return;
    applyCfg(S.cfg);
    appsEl.innerHTML = S.apps.map((a, i) =>
      `<button class="tile cadre${a.current ? ' cur' : ''}" data-app="${i}">${a.open ? '<i class="ouv"></i>' : ''}${I(a.icon)}<span class="nm">${esc(a.name)}</span></button>`).join('');
    tabsEl.innerHTML = S.tabs.map((t) => {
      const ic = t.hub ? I('home') : t.icon ? I(t.icon) : (t.fav && /^https?:/.test(t.fav) ? `<img src="${esc(t.fav)}" alt="">` : I('livre'));
      const lab = t.hub ? '<b>Accueil</b>' : t.app ? `<b>${esc(t.app)}</b> <i>· ${esc(t.title)}</i>` : esc(t.title);
      return `<div class="trow${t.active ? ' act' : ''}"><button class="t" data-tab="${t.id}">${ic}<span class="lab">${lab}</span>${t.audible ? '<span class="son">♪</span>' : ''}</button><button class="mini" data-x="${t.id}" data-p="${t.protect ? 1 : 0}">${I('close')}</button></div>`;
    }).join('') || '<div class="vide">Aucun onglet.</div>';
    updThemeBtn();
    const fsb = root.querySelector('[data-a="fs"]');
    if (fsb) fsb.classList.toggle('on', !!S.fullscreen);
  }

  function needsConfirm(btn, label) {
    if (btn.classList.contains('confirm')) return false;
    const old = btn.innerHTML;
    btn.classList.add('confirm'); btn.innerHTML = label;
    setTimeout(() => { btn.classList.remove('confirm'); btn.innerHTML = old; }, 2800);
    return true;
  }

  panel.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.app != null) { await send({ type: 'openApp', app: S.apps[+b.dataset.app] }); return HUB ? refresh() : toggle(false); }
    if (b.dataset.tab) { await send({ type: 'activate', tabId: +b.dataset.tab }); return HUB ? refresh() : toggle(false); }
    if (b.dataset.x) {
      if (b.dataset.p === '1' && needsConfirm(b, 'Sûr ?')) return;
      await send({ type: 'close', tabId: +b.dataset.x }); return refresh();
    }
    switch (b.dataset.a) {
      case 'hide': return toggle(false);
      case 'back': case 'fwd': case 'reload': case 'last': case 'home':
        if (!HUB) toggle(false);
        return send({ type: b.dataset.a });
      case 'fs': await send({ type: 'fs' }); return setTimeout(refresh, 300);
      case 'theme': {
        const c = choixActuel() || (wrap.classList.contains('nuit') ? 'nuit' : 'jour');
        const v = ORDRE[(ORDRE.indexOf(c) + 1) % ORDRE.length];
        appliquerChoix(v);
        return send({ type: 'setTheme', v }); // le service worker relaie à tous les onglets
      }
      case 'search': return openSearch();
      case 'options': return send({ type: 'options' });
      case 'closeTab':
        if (S && S.currentProtected && needsConfirm(b, 'Retoucher : coupe le son')) return;
        return send({ type: 'close' });
    }
  });

  /* ---------- Panneau latéral AideDD ---------- */
  let frame = null, stack = [];
  function loadFrame(url) {
    // nouvel iframe à chaque navigation pilotée : n'ajoute rien à l'historique de l'app
    if (frame) frame.remove();
    frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    frame.src = url;
    dbody.prepend(frame);
    dttl.textContent = 'AideDD';
  }
  function openDrawer(url) {
    if (!stack.length || stack[stack.length - 1] !== url) stack.push(url);
    loadFrame(url);
    drawer.classList.add('on');
    updBack(); placeHandle();
  }
  function closeDrawer() {
    drawer.classList.remove('on');
    if (frame) { frame.remove(); frame = null; }
    stack = []; placeHandle();
  }
  const updBack = () => { root.querySelector('[data-d="back"]').disabled = stack.length < 2; };
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!frame || e.source !== frame.contentWindow || !d || !d.portailFrame) return;
    if (d.url && stack[stack.length - 1] !== d.url) stack.push(d.url);
    if (d.title) dttl.textContent = d.title;
    if ((CFG.drawerZoom || 1) !== 1) frame.contentWindow.postMessage({ portail: 'zoom', z: CFG.drawerZoom }, '*');
    updBack();
  });
  drawer.querySelector('.dhead').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    switch (b.dataset.d) {
      case 'back': if (stack.length > 1) { stack.pop(); loadFrame(stack[stack.length - 1]); updBack(); } break;
      case 'zm': case 'zp': {
        const z = Math.round(Math.min(Math.max((CFG.drawerZoom || 1) + (b.dataset.d === 'zp' ? 0.1 : -0.1), 0.6), 1.8) * 10) / 10;
        CFG.drawerZoom = z; send({ type: 'saveCfg', patch: { drawerZoom: z } });
        if (frame) frame.contentWindow.postMessage({ portail: 'zoom', z }, '*');
        break;
      }
      case 'search': openSearch(); break;
      case 'tab': { const u = stack[stack.length - 1]; closeDrawer(); send({ type: 'openUrl', url: u }); break; }
      case 'close': closeDrawer(); break;
    }
  });
  // redimensionner en glissant la poignée dorée
  (() => {
    const grip = drawer.querySelector('.grip');
    let drag = false;
    grip.addEventListener('pointerdown', (e) => { grip.setPointerCapture(e.pointerId); drag = true; drawer.classList.add('drag'); e.preventDefault(); });
    grip.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const w = CFG.side === 'left' ? e.clientX / innerWidth : 1 - e.clientX / innerWidth;
      CFG.drawerW = Math.min(Math.max(w, 0.22), 0.8);
      applyCfg({});
    });
    const end = () => { if (!drag) return; drag = false; drawer.classList.remove('drag'); send({ type: 'saveCfg', patch: { drawerW: CFG.drawerW } }); };
    grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
  })();
  const usePanel = () => CFG.aideddPanel !== false && !ON_AIDEDD;
  // liens AideDD de la page → panneau (sans passer par un nouvel onglet)
  document.addEventListener('click', (e) => {
    if (!usePanel() || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const a = e.composedPath().find((n) => n.tagName === 'A' && n.href);
    if (!a || !isAidedd(a.href) || a.closest && a.closest('#portail-mj')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    openDrawer(a.href);
  }, true);
  // liens ouverts dans un nouvel onglet (window.open…) → renvoyés ici par le service worker
  chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (msg && msg.type === 'dalmorSet') { appliquerChoix(msg.v); reply(true); return; }
    if (msg && msg.type === 'showAidedd') {
      if (!usePanel()) { reply(false); return; }
      openDrawer(msg.url); reply(true);
    }
  });

  /* ---------- Recherche AideDD ---------- */
  const CHIPS = [['', 'Tout'], ['Sort', 'Sorts'], ['Monstre', 'Monstres'], ['Objet', 'Objets & potions'], ['Don', 'Dons'], ['Règle', 'Règles']];
  let cat = '', timer = null, kbdOn = true;
  chipsEl.innerHTML = CHIPS.map(([v, l]) => `<button class="chip${v === cat ? ' on' : ''}" data-c="${v}">${l}</button>`).join('');
  chipsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    cat = b.dataset.c;
    chipsEl.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === b));
    run();
  });
  const ROWS = [['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
    ['w', 'x', 'c', 'v', 'b', 'n', "'", '-', '⌫'], ['Effacer', '␣', 'Ouvrir']];
  kbdEl.innerHTML = ROWS.map((r) => `<div class="kr">${r.map((k) =>
    `<button class="key${k === '␣' ? ' w5' : k.length > 1 && k !== '⌫' ? ' w2' : ''}" data-k="${esc(k)}">${k === '␣' ? 'espace' : k === '⌫' ? I('backspace') : esc(k)}</button>`).join('')}</div>`).join('');
  kbdEl.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.key'); if (!b) return;
    e.preventDefault();
    const k = b.dataset.k;
    if (k === '⌫') q.value = q.value.slice(0, -1);
    else if (k === 'Effacer') q.value = '';
    else if (k === '␣') q.value += ' ';
    else if (k === 'Ouvrir') { const f = resEl.querySelector('.res'); if (f) f.click(); return; }
    else q.value += k;
    run();
  });
  ['keydown', 'keyup', 'keypress'].forEach((t) => q.addEventListener(t, (e) => {
    e.stopPropagation();
    if (t === 'keydown' && e.key === 'Escape') closeSearch();
    if (t === 'keydown' && e.key === 'Enter') { const f = resEl.querySelector('.res'); if (f) f.click(); }
  }));
  q.addEventListener('input', run);

  const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/œ/g, 'oe')
    .replace(/['’]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  function run() { clearTimeout(timer); timer = setTimeout(doSearch, 70); }
  async function doSearch() {
    const text = q.value.trim();
    const r = await send({ type: 'search', q: text, cat });
    if (!r || r.error) { resEl.innerHTML = '<div class="aide">Extension rechargée : rafraîchis la page.</div>'; return; }
    const info = r.info;
    const ago = info.date ? Math.round((Date.now() - info.date) / 864e5) : null;
    stEl.innerHTML = info.n
      ? `Index : ${info.n.toLocaleString('fr')} entrées, ${ago === 0 ? "à jour d'aujourd'hui" : `vieux de ${ago} j`} <button data-a="rebuild">Mettre à jour</button>`
      : `${info.building ? 'Construction de l’index…' : 'Index vide.'} <button data-a="rebuild">Construire l’index</button>`;
    if (!text) { resEl.innerHTML = '<div class="aide">Quelques lettres suffisent : « boule », « gobelin », « potion soins »…</div>'; return; }
    let html = r.results.map((it) =>
      `<button class="res" data-u="${esc(it.u)}"><div><div class="n">${esc(it.n)}</div>${it.e ? `<div class="e">${esc(it.e)}</div>` : ''}</div><span class="c">${esc(it.c)}</span></button>`).join('');
    if (!r.results.length) {
      const s = slugify(text);
      html += '<div class="aide">Rien dans l’index. Essais directs :</div>' + [['spell', 'Sort'], ['monster', 'Monstre'], ['magic-item', 'Objet'], ['feat', 'Don']]
        .filter(([, c]) => !cat || cat === c).map(([seg, c]) =>
          `<button class="res" data-u="https://www.aidedd.org/${seg}/fr/${s}"><div><div class="n">${esc(text)}</div><div class="e">aidedd.org/${seg}/fr/${esc(s)}</div></div><span class="c">${c} ?</span></button>`).join('');
    }
    html += `<button class="res web" data-u="https://duckduckgo.com/?q=${encodeURIComponent('site:aidedd.org ' + text)}" data-web="1"><div><div class="n">Chercher « ${esc(text)} » sur tout AideDD</div><div class="e">règles, chapitres, tout le site — recherche web</div></div></button>`;
    resEl.innerHTML = html; resEl.scrollTop = 0;
  }
  resEl.addEventListener('click', (e) => {
    const b = e.target.closest('.res'); if (!b) return;
    closeSearch(); if (!HUB) toggle(false);
    if (usePanel() && !b.dataset.web) openDrawer(b.dataset.u);
    else send({ type: 'openUrl', url: b.dataset.u });
  });
  stEl.addEventListener('click', async (e) => {
    if (e.target.dataset.a !== 'rebuild') return;
    stEl.textContent = 'Construction de l’index… quelques secondes.';
    const r = await send({ type: 'buildIndex' });
    if (r && r.n === 0) stEl.textContent = 'Échec : AideDD injoignable ? (' + (r.errors || []).slice(0, 2).join(', ') + ')';
    else doSearch();
  });
  function openSearch() {
    sov.classList.add('on'); kbdEl.classList.toggle('off', !kbdOn);
    q.focus({ preventScroll: true }); q.select(); doSearch();
  }
  function closeSearch() { sov.classList.remove('on'); q.blur(); }
  sov.querySelector('.sbar').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.s === 'close') closeSearch();
    if (b.dataset.s === 'kbd') { kbdOn = !kbdOn; kbdEl.classList.toggle('off', !kbdOn); q.inputMode = kbdOn ? 'none' : 'text'; q.focus(); }
  });

  window.__portailOpenSearch = openSearch;           // utilisé par la page d'accueil
  window.addEventListener('portail-retheme', pickTheme);
  window.addEventListener('dalmor-theme', () => pickTheme());   // envoyé par dalmor-ui/theme.js
  window.addEventListener('storage', (e) => { if (e.key === LSK) pickTheme(); });
  /* ---------- Init ---------- */
  send({ type: 'getCfg' }).then((c) => c && !c.error && applyCfg(c));
  chrome.storage.onChanged.addListener((ch) => { if (ch.cfg && ch.cfg.newValue) applyCfg(ch.cfg.newValue); });
  if (HUB) {
    refresh(); setInterval(() => { if (!document.hidden) refresh(); }, 2000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  }
})();
