// Portail MJ — lecteur des règles 2024 d'AideDD (document hors écran : DOMParser disponible ici,
// pas dans le service worker). Parcourt /regles-24/ en suivant les liens, et extrait :
//   - les titres (h1 à h5) → une entrée par notion, terme anglais [entre crochets] à part ;
//   - les termes en gras en tête de paragraphe (« Dégâts. », « Abri partiel [Half Cover] ») ;
//   - les lignes des tableaux des pages /equipement/ → une entrée par arme, armure, objet, avec ses colonnes ;
//   - les paragraphes → recherche dans le texte.
// Les résultats sont renvoyés au service worker par messages (qui le gardent éveillé pendant la lecture).
(() => {
  const MAX_PAGES = 260;
  const PAUSE = 120; // ms entre deux pages, pour rester poli avec AideDD

  const txt = (el) => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
  const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/[^a-z0-9]+/g, ' ').trim();
  const court = (s, n = 150) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);
  // « En péril [Bloodied] » → { n: 'En péril', e: 'Bloodied' }
  function nomVo(s) {
    const m = s.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
    return m ? { n: m[1].trim(), e: m[2].trim() } : { n: s.trim(), e: '' };
  }
  const ancre = (url, el, nom) => (el && el.id ? `${url}#${el.id}` : `${url}#pmj=${encodeURIComponent(nom)}`);

  function liens(doc, url, racine) {
    const out = new Set();
    for (const a of doc.querySelectorAll('a[href]')) {
      let u; try { u = new URL(a.getAttribute('href'), url); } catch (e) { continue; }
      if (!/(^|\.)aidedd\.org$|^localhost$/.test(u.hostname)) continue;
      if (!u.pathname.startsWith(new URL(racine).pathname)) continue;
      if (/\.(pdf|png|jpe?g|gif|webp|zip)$/i.test(u.pathname)) continue;
      out.add(u.origin + u.pathname.replace(/\/?$/, '/'));
    }
    return out;
  }

  // zone de contenu : le plus proche ancêtre du h1 qui contient l'essentiel des titres
  function zone(doc) {
    const h1 = doc.querySelector('h1');
    const tous = doc.querySelectorAll('h2,h3,h4,h5').length;
    if (!h1) return doc.body;
    let r = h1.parentElement;
    while (r && r !== doc.body && r.querySelectorAll('h2,h3,h4,h5').length < tous * 0.8) r = r.parentElement;
    return r || doc.body;
  }

  function lire(html, url) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const racine = self.__racine;
    const suivants = liens(doc, url, racine);
    doc.querySelectorAll('script,style,noscript,nav,header,footer,aside,form,iframe,svg').forEach((e) => e.remove());
    const z = zone(doc);
    const h1 = doc.querySelector('h1');
    const titrePage = txt(h1) || txt(doc.querySelector('title')).replace(/\s*».*$/, '');
    const equipement = /\/equipement\//.test(url);
    const catTable = /\/armes\//.test(url) ? 'Arme' : /\/armures\//.test(url) ? 'Armure' : 'Équipement';
    const entrees = [], textes = [];
    let section = -1; // index de l'entrée du titre courant

    const page = { n: titrePage, e: '', c: 'Règle', u: url, p: 'Règles 2024', s: '' };
    entrees.push(page); section = 0;

    const marche = doc.createTreeWalker(z, NodeFilter.SHOW_ELEMENT);
    for (let el = marche.currentNode; el; el = marche.nextNode()) {
      const tag = el.tagName;
      if (/^H[1-5]$/.test(tag)) {
        if (el === h1) continue;
        const brut = txt(el); if (!brut || brut.length > 90) continue;
        const { n, e } = nomVo(brut);
        entrees.push({ n, e, c: 'Règle', u: ancre(url, el, n), p: titrePage, s: '' });
        section = entrees.length - 1;
        continue;
      }
      if (tag === 'TABLE') {
        if (!equipement) continue;
        const lignes = [...el.querySelectorAll('tr')];
        if (lignes.length < 2) continue;
        const entetes = [...lignes[0].querySelectorAll('th,td')].map(txt);
        let groupe = '';
        for (const tr of lignes.slice(1)) {
          const cel = [...tr.querySelectorAll('th,td')];
          if (!cel.length) continue;
          const vals = cel.map(txt);
          if (!vals[0]) continue;
          if (vals.slice(1).every((v) => !v)) { groupe = vals[0]; continue; } // ligne de groupe
          if (cel[0].querySelector('a[href*="/spell/"],a[href*="/feat/"],a[href*="/monster/"],a[href*="/magic-item/"]')) continue;
          const { n, e } = nomVo(vals[0]);
          const s = vals.slice(1).map((v, i) => (v ? (entetes[i + 1] ? `${entetes[i + 1]} : ${v}` : v) : '')).filter(Boolean).join(' · ');
          entrees.push({ n, e, c: catTable, u: `${url}#pmj=${encodeURIComponent(n)}`, p: groupe || titrePage, s });
        }
        continue;
      }
      if (tag === 'P' || tag === 'LI' || tag === 'DD') {
        if (el.closest('table')) continue;
        const t = txt(el); if (t.length < 25) continue;
        // terme en gras en tête : « Dégâts. Si l'attaque… »
        const premier = el.firstElementChild;
        if (premier && /^(STRONG|B)$/.test(premier.tagName) && el.textContent.trimStart().startsWith(premier.textContent.trim())) {
          const terme = txt(premier).replace(/[.:]\s*$/, '');
          if (terme.length >= 3 && terme.length <= 60) {
            const { n, e } = nomVo(terme);
            const reste = t.slice(txt(premier).length).replace(/^[\s.:]+/, '');
            entrees.push({ n, e, c: 'Règle', u: `${url}#pmj=${encodeURIComponent(txt(premier).replace(/[.:]\s*$/, ''))}`,
              p: section >= 0 ? entrees[section].n : titrePage, s: court(reste) });
          }
        }
        if (section >= 0 && !entrees[section].s) entrees[section].s = court(t);
        textes.push({ t, i: section, u: `${url}#pmj=${encodeURIComponent(t.split(/\s+/).slice(0, 8).join(' '))}` });
      }
    }
    if (!page.s && textes[0]) page.s = court(textes[0].t);
    return { entrees, textes, suivants };
  }

  async function parcourir(racine, id) {
    self.__racine = racine;
    const vus = new Set([racine]), file = [racine];
    const entrees = [], textes = [], erreurs = [];
    const dejaTexte = new Set();
    let faits = 0;
    while (file.length && faits < MAX_PAGES) {
      const url = file.shift();
      try {
        const r = await fetch(url, { credentials: 'omit' });
        if (!r.ok) { erreurs.push(`${url.replace(racine, '')} ${r.status}`); }
        else {
          const res = lire(await r.text(), r.url.replace(/[?#].*$/, '').replace(/\/?$/, '/'));
          const base = entrees.length;
          entrees.push(...res.entrees);
          for (const x of res.textes) {
            const k = norm(x.t);
            if (dejaTexte.has(k)) continue; // texte répété sur chaque page (menus…)
            dejaTexte.add(k);
            textes.push({ t: x.t, u: x.u, i: x.i >= 0 ? base + x.i : -1 });
          }
          for (const s of res.suivants) if (!vus.has(s)) { vus.add(s); file.push(s); }
        }
      } catch (e) { erreurs.push(`${url.replace(racine, '')} ${e.message}`); }
      faits++;
      chrome.runtime.sendMessage({ type: 'reglesProgres', id, faits, total: Math.min(vus.size, MAX_PAGES) }).catch(() => {});
      await new Promise((ok) => setTimeout(ok, PAUSE));
    }
    // doublons de noms dans une même page (mêmes titres répétés) : on garde le premier
    const vusNom = new Set(), propres = [], remap = new Map();
    entrees.forEach((x, i) => {
      const k = x.c + '|' + norm(x.n) + '|' + x.u.replace(/#.*$/, '');
      if (vusNom.has(k)) return;
      vusNom.add(k); remap.set(i, propres.length); propres.push(x);
    });
    const textesOk = textes.map((x) => ({ ...x, i: remap.has(x.i) ? remap.get(x.i) : -1 }));
    chrome.runtime.sendMessage({ type: 'reglesFini', id, entrees: propres, textes: textesOk, pages: faits, erreurs }).catch(() => {});
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'reglesParcourir') parcourir(msg.racine, msg.id);
  });
  chrome.runtime.sendMessage({ type: 'offscreenPret' }).catch(() => {});
})();
