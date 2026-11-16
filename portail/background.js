// Portail MJ — service worker
const GH = 'https://homotopic-to-the-circle.github.io/';
const DEFAULTS = {
  apps: [
    { name: 'MJ',       icon: 'couronne',  url: GH + 'DnD_MJ/',        protect: false },
    { name: 'Sonerezh', icon: 'luth',      url: GH + 'Sonerezh/',      protect: true  },
    { name: 'Fiches',   icon: 'parchemin', url: GH + 'DnD_Character/', protect: false },
    { name: 'AideDD',   icon: 'livre',     url: 'https://www.aidedd.org/', protect: false }
  ],
  hubTheme: 'jour',    // thème de l'accueil / des réglages, changé depuis le d20
  siteThemes: {},      // thème du panneau du d20 sur les autres sites (AideDD…), par hôte
  aideddPanel: true,   // les liens AideDD s'ouvrent dans le panneau latéral, à côté de l'app
  reuseAidedd: true,   // sinon : un seul onglet AideDD, réutilisé
  side: 'right',
  handleY: 0.5,
  drawerW: 0.42,
  drawerZoom: 1
};
const OLD_ICONS = { '🐉': 'couronne', '🎵': 'luth', '📜': 'parchemin', '📖': 'livre' };

async function getCfg() {
  const { cfg } = await chrome.storage.local.get('cfg');
  const c = { ...DEFAULTS, ...(cfg || {}) };
  c.apps = c.apps.map((a) => ({ ...a, icon: OLD_ICONS[a.icon] || a.icon }));
  return c;
}
async function saveCfg(patch) {
  const cfg = { ...(await getCfg()), ...patch };
  await chrome.storage.local.set({ cfg });
  return cfg;
}

const HUB_URL = chrome.runtime.getURL('hub.html');
const isAidedd = (u) => /^https?:\/\/(www\.)?aidedd\.org\//i.test(u || '');
const isHub = (u) => (u || '').startsWith(HUB_URL) || /^chrome:\/\/newtab/i.test(u || '');
const tabUrl = (t) => t.url || t.pendingUrl || '';

function normBase(u) {
  return (u || '').toLowerCase().replace(/[?#].*$/, '').replace(/index\.html?$/, '');
}
function appMatches(app, url) {
  if (!url) return false;
  const base = normBase(app.match || app.url);
  return base && normBase(url).startsWith(base);
}
function appForUrl(apps, url) {
  // l'app dont le préfixe est le plus long gagne
  let best = null;
  for (const a of apps) if (appMatches(a, url) && (!best || (a.match || a.url).length > (best.match || best.url).length)) best = a;
  return best;
}

/* ---------- Historique des onglets (MRU) ---------- */
async function getMru() { return (await chrome.storage.session.get('mru')).mru || []; }
async function setMru(m) { await chrome.storage.session.set({ mru: m.slice(-40) }); }
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const m = (await getMru()).filter((id) => id !== tabId);
  m.push(tabId); await setMru(m);
});
chrome.tabs.onRemoved.addListener(async (tabId) => {
  await setMru((await getMru()).filter((id) => id !== tabId));
  newTabs.delete(tabId);
});
async function previousTab(currentId, windowId) {
  const m = await getMru();
  const tabs = await chrome.tabs.query(windowId ? { windowId } : {});
  const ids = new Set(tabs.map((t) => t.id));
  for (let i = m.length - 1; i >= 0; i--) if (m[i] !== currentId && ids.has(m[i])) return m[i];
  const other = tabs.find((t) => t.id !== currentId);
  return other ? other.id : null;
}
async function activate(tabId) {
  const t = await chrome.tabs.update(tabId, { active: true });
  try { await chrome.windows.update(t.windowId, { focused: true }); } catch (e) {}
}
async function switchLast(fromTab) {
  const cur = fromTab || (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];
  if (!cur) return;
  const prev = await previousTab(cur.id, cur.windowId);
  if (prev != null) await activate(prev);
}
async function closeTab(tabId) {
  const t = await chrome.tabs.get(tabId);
  if (t.active) {
    const prev = await previousTab(tabId, t.windowId);
    if (prev != null) await activate(prev);
    else await chrome.tabs.create({ windowId: t.windowId, url: HUB_URL });
  }
  await chrome.tabs.remove(tabId);
}

/* ---------- Un seul onglet AideDD ---------- */
const newTabs = new Map(); // tabId -> création (ms)
const handling = new Set();
async function redirectToExistingAidedd(tab, url) {
  if (!isAidedd(url)) return false;
  if (handling.has(tab.id)) return true;
  handling.add(tab.id);
  try { return await redirectInner(tab, url); } finally { handling.delete(tab.id); }
}
async function redirectInner(tab, url) {
  const cfg = await getCfg();
  // 1) panneau latéral dans l'onglet qui a ouvert le lien (app MJ…)
  if (cfg.aideddPanel && tab.openerTabId != null) {
    let ok = false;
    try { ok = await chrome.tabs.sendMessage(tab.openerTabId, { type: 'showAidedd', url }, { frameId: 0 }); } catch (e) {}
    if (ok === true) {
      newTabs.delete(tab.id);
      try { await chrome.tabs.remove(tab.id); } catch (e) {}
      return true;
    }
  }
  // 2) sinon, réutiliser l'onglet AideDD existant
  if (!cfg.reuseAidedd) return false;
  const others = (await chrome.tabs.query({ windowId: tab.windowId }))
    .filter((t) => t.id !== tab.id && isAidedd(tabUrl(t)));
  if (!others.length) return false;
  newTabs.delete(tab.id);
  await chrome.tabs.update(others[0].id, { url, active: true });
  try { await chrome.tabs.remove(tab.id); } catch (e) {}
  return true;
}
chrome.tabs.onCreated.addListener(async (tab) => {
  newTabs.set(tab.id, Date.now());
  const url = tabUrl(tab);
  if (url && url !== 'about:blank') await redirectToExistingAidedd(tab, url);
});
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!info.url) return;
  const born = newTabs.get(tabId);
  if (!born) return;
  if (Date.now() - born > 6000) { newTabs.delete(tabId); return; }
  if (info.url === 'about:blank') return;
  if (tab.openerTabId == null) { try { tab = await chrome.tabs.get(tabId); } catch (e) { return; } }
  if (!(await redirectToExistingAidedd(tab, info.url))) newTabs.delete(tabId);
});

async function openUrl(url, fromTab) {
  const windowId = fromTab ? fromTab.windowId : undefined;
  if (isAidedd(url) && (await getCfg()).reuseAidedd) {
    const ex = (await chrome.tabs.query(windowId ? { windowId } : {})).find((t) => isAidedd(tabUrl(t)));
    if (ex) { await chrome.tabs.update(ex.id, { url, active: true }); return; }
  }
  const t = await chrome.tabs.create({ url, windowId, active: true });
  newTabs.delete(t.id);
}

async function openApp(app, fromTab) {
  const tabs = await chrome.tabs.query(fromTab ? { windowId: fromTab.windowId } : {});
  const cfg = await getCfg();
  const found = tabs.find((t) => appForUrl(cfg.apps, tabUrl(t)) && normBase(appForUrl(cfg.apps, tabUrl(t)).url) === normBase(app.url));
  if (found) return activate(found.id);
  const t = await chrome.tabs.create({ url: app.url, windowId: fromTab ? fromTab.windowId : undefined });
  newTabs.delete(t.id);
}

async function openHub(fromTab) {
  const tabs = await chrome.tabs.query(fromTab ? { windowId: fromTab.windowId } : {});
  const h = tabs.find((t) => isHub(tabUrl(t)));
  if (h) return activate(h.id);
  const t = await chrome.tabs.create({ url: HUB_URL, windowId: fromTab ? fromTab.windowId : undefined });
  newTabs.delete(t.id);
}

/* ---------- Plein écran (navigateur, persiste entre onglets) ---------- */
async function toggleFullscreen(windowId) {
  const w = windowId ? await chrome.windows.get(windowId) : await chrome.windows.getLastFocused();
  if (w.state === 'fullscreen') {
    const { prevState } = await chrome.storage.session.get('prevState');
    await chrome.windows.update(w.id, { state: prevState || 'maximized' });
  } else {
    await chrome.storage.session.set({ prevState: w.state === 'minimized' ? 'maximized' : w.state });
    await chrome.windows.update(w.id, { state: 'fullscreen' });
  }
}

/* ---------- Index AideDD ---------- */
const ORIGIN = 'https://www.aidedd.org/';
const SOURCES = ['spell/', 'spell/fr/', 'monster/', 'monster/fr/', 'magic-item/', 'magic-item/fr/',
  'feat/', 'feat/fr/', 'regles/', ''];
const CATS = { spell: 'Sort', monster: 'Monstre', 'magic-item': 'Objet', feat: 'Don', regles: 'Règle' };
const FR_RE = /^https?:\/\/(?:www\.)?aidedd\.org\/([a-z0-9-]+)\/fr\/([^\/?#]+)\/?$/i;
const RULE_RE = /^https?:\/\/(?:www\.)?aidedd\.org\/regles\/([^?#]+?)\/?$/i;
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘',
  laquo: '«', raquo: '»', eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à', acirc: 'â',
  ccedil: 'ç', icirc: 'î', iuml: 'ï', ocirc: 'ô', ugrave: 'ù', ucirc: 'û', uuml: 'ü', oelig: 'œ',
  Eacute: 'É', Egrave: 'È', Agrave: 'À', Ccedil: 'Ç', OElig: 'Œ', hellip: '…', ndash: '–', mdash: '—' };

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1));
    return ENTITIES[e] ?? m;
  });
}
const clean = (h) => decode(h.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
function norm(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/[^a-z0-9]+/g, ' ').trim();
}
function fromSlug(slug) {
  let s = slug; try { s = decodeURIComponent(slug); } catch (e) {}
  s = s.replace(/\.(php|html?)$/, '').replace(/[-_]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const isBadName = (t) => !t || /^(fr|es|en|vo|vf)$/i.test(t) || t.length > 90;
function absUrl(h, base) { try { return new URL(decode(h), base).href; } catch (e) { return null; } }

function parsePage(html, base, map) {
  const chunks = html.split(/<tr[\s>]/i);
  for (const chunk of chunks) {
    const links = [];
    for (const m of chunk.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const href = absUrl(m[1], base);
      if (href) links.push({ href: href.replace(/#.*$/, ''), text: clean(m[2]) });
    }
    const frs = links.filter((l) => FR_RE.test(l.href));
    for (const l of frs) {
      const [, seg, slug] = l.href.match(FR_RE);
      if (seg === 'es' || seg === 'en') continue;
      let en = '';
      if (frs.length === 1) {
        const enRe = new RegExp('aidedd\\.org\\/' + seg + '\\/(?!fr\\/|es\\/)[^\\/?#]+', 'i');
        const enL = links.find((x) => enRe.test(x.href) && !isBadName(x.text));
        if (enL) en = enL.text;
      }
      add(map, { u: l.href, c: CATS[seg] || fromSlug(seg), n: isBadName(l.text) ? '' : l.text, slug, e: en });
    }
    for (const l of links) {
      const m = l.href.match(RULE_RE);
      if (!m) continue;
      const slug = m[1].split('/').pop();
      add(map, { u: l.href.replace(/\/?$/, '/'), c: 'Règle', n: isBadName(l.text) ? '' : l.text, slug, e: '' });
    }
  }
}
function add(map, it) {
  const prev = map.get(it.u);
  if (!prev) { map.set(it.u, it); return; }
  // garder le « vrai » nom (avec accents) plutôt que celui reconstruit depuis l'URL
  if (!prev.n && it.n) prev.n = it.n;
  if (!prev.e && it.e) prev.e = it.e;
}

let INDEX = null; // [{u,c,n,e,k,ke}]
let building = null;
async function loadIndex() {
  if (INDEX) return INDEX;
  const { idx } = await chrome.storage.local.get('idx');
  INDEX = (idx || []).map(prep);
  return INDEX;
}
function prep(it) {
  const n = it.n || fromSlug(it.slug || '');
  return { ...it, n, k: norm(n + ' ' + (it.slug || '').replace(/-/g, ' ')), ke: norm(it.e) };
}
async function buildIndex() {
  if (building) return building;
  building = (async () => {
    const map = new Map();
    const errors = [];
    for (const p of SOURCES) {
      try {
        const r = await fetch(ORIGIN + p, { credentials: 'omit' });
        if (!r.ok) { errors.push(p + ' ' + r.status); continue; }
        parsePage(await r.text(), ORIGIN + p, map);
      } catch (e) { errors.push(p + ' ' + e.message); }
    }
    const idx = [...map.values()];
    if (idx.length) {
      await chrome.storage.local.set({ idx, idxDate: Date.now(), idxErrors: errors });
      INDEX = idx.map(prep);
    } else {
      await chrome.storage.local.set({ idxErrors: errors });
    }
    return { n: idx.length, errors };
  })();
  try { return await building; } finally { building = null; }
}
async function indexInfo() {
  const { idxDate, idxErrors } = await chrome.storage.local.get(['idxDate', 'idxErrors']);
  const idx = await loadIndex();
  return { n: idx.length, date: idxDate || 0, errors: idxErrors || [], building: !!building };
}
async function maybeRefresh() {
  const { idxDate } = await chrome.storage.local.get('idxDate');
  if (!idxDate || Date.now() - idxDate > 14 * 864e5) buildIndex();
}

function search(q, cat) {
  const qn = norm(q);
  if (!qn || !INDEX) return [];
  const toks = qn.split(' ');
  const out = [];
  for (const it of INDEX) {
    if (cat && it.c !== cat) continue;
    let s = score(it.k, qn, toks);
    const se = it.ke ? score(it.ke, qn, toks) - 8 : 0;
    s = Math.max(s, se);
    if (s > 0) out.push([s, it]);
  }
  out.sort((a, b) => b[0] - a[0] || a[1].n.length - b[1].n.length || a[1].n.localeCompare(b[1].n));
  return out.slice(0, 40).map(([, it]) => ({ u: it.u, c: it.c, n: it.n, e: it.e }));
}
function score(k, qn, toks) {
  if (!k) return 0;
  if (k === qn) return 100;
  if (k.startsWith(qn)) return 85;
  const words = k.split(' ');
  if (toks.every((t) => words.some((w) => w.startsWith(t)))) return 60;
  if (k.includes(qn)) return 40;
  return 0;
}

/* ---------- Messages ---------- */
async function state(tab) {
  const cfg = await getCfg();
  const tabs = await chrome.tabs.query(tab ? { windowId: tab.windowId } : { lastFocusedWindow: true });
  const cur = tab || tabs.find((t) => t.active);
  const curApp = cur ? appForUrl(cfg.apps, tabUrl(cur)) : null;
  const apps = cfg.apps.map((a) => ({
    ...a,
    open: tabs.some((t) => { const x = appForUrl(cfg.apps, tabUrl(t)); return x && normBase(x.url) === normBase(a.url); }),
    current: !!curApp && normBase(curApp.url) === normBase(a.url)
  }));
  let win = null; try { win = await chrome.windows.get(cur ? cur.windowId : chrome.windows.WINDOW_ID_CURRENT); } catch (e) {}
  return {
    cfg, apps,
    currentId: cur ? cur.id : null,
    currentProtected: !!(curApp && curApp.protect),
    fullscreen: !!win && win.state === 'fullscreen',
    tabs: tabs.map((t) => {
      const a = appForUrl(cfg.apps, tabUrl(t));
      return { id: t.id, title: t.title || tabUrl(t), url: tabUrl(t), fav: t.favIconUrl || '',
        active: t.active, app: a ? a.name : '', icon: a ? a.icon : '', protect: !!(a && a.protect), hub: isHub(tabUrl(t)), audible: !!t.audible };
    })
  };
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  const tab = sender.tab;
  (async () => {
    switch (msg.type) {
      case 'state': return state(tab);
      case 'openApp': return openApp(msg.app, tab);
      case 'activate': return activate(msg.tabId);
      case 'close': return closeTab(msg.tabId ?? tab.id);
      case 'last': return switchLast(tab);
      case 'back': return chrome.tabs.goBack(tab.id).catch(() => {});
      case 'fwd': return chrome.tabs.goForward(tab.id).catch(() => {});
      case 'reload': return chrome.tabs.reload(tab.id);
      case 'fs': return toggleFullscreen(tab ? tab.windowId : undefined);
      case 'hub': return openHub(tab);
      case 'openUrl': return openUrl(msg.url, tab);
      case 'saveCfg': return saveCfg(msg.patch);
      case 'resetCfg': await chrome.storage.local.remove('cfg'); return getCfg();
      case 'getCfg': return getCfg();
      case 'search': await loadIndex(); maybeRefresh(); return { results: search(msg.q, msg.cat), info: await indexInfo() };
      case 'indexInfo': return indexInfo();
      case 'buildIndex': return buildIndex();
      case 'options': return chrome.runtime.openOptionsPage();
    }
  })().then((r) => reply(r ?? true), (e) => reply({ error: String(e && e.message || e) }));
  return true;
});

chrome.commands.onCommand.addListener((c) => { if (c === 'switch-last') switchLast(); });
chrome.action.onClicked.addListener((tab) => openHub(tab));
chrome.runtime.onInstalled.addListener(() => { buildIndex(); });
