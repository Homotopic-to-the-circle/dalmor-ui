// Portail MJ — page d'accueil (nouvel onglet)
(() => {
  const I = self.pmjIcon;
  const send = (msg) => new Promise((r) => chrome.runtime.sendMessage(msg, (x) => { void chrome.runtime.lastError; r(x); }));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (id) => document.getElementById(id);

  $('sceau').innerHTML = I('de');
  $('s-ic').outerHTML = I('search');
  $('b-last').innerHTML = I('last') + 'Onglet précédent';
  $('b-fs').innerHTML = I('fs') + 'Plein écran';
  $('b-opt').innerHTML = I('gear') + 'Réglages';

  function setTheme(t) {
    if (t === 'heure') { const h = new Date().getHours(); t = h >= 19 || h < 7 ? 'nuit' : 'jour'; }
    if (t !== 'nuit') t = 'jour';
    if (document.body.className !== t) {
      document.body.className = t;
      window.dispatchEvent(new Event('portail-retheme')); // le panneau du sceau suit
    }
  }

  const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function clock() {
    const d = new Date();
    $('date').innerHTML = `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}<b>${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}</b>`;
  }

  let S = null;
  async function refresh() {
    S = await send({ type: 'state' });
    if (!S || S.error) return;
    const ht = S.cfg.hubTheme || 'commun';
    setTheme(ht === 'commun' ? (S.cfg.sharedTheme || 'jour') : ht);
    $('b-fs').classList.toggle('on', !!S.fullscreen);
    $('apps').innerHTML = S.apps.map((a, i) => {
      const tab = S.tabs.find((t) => t.app === a.name);
      const etat = a.open ? (tab && tab.audible ? '♪ en lecture' : 'ouvert') : 'lancer';
      return `<button class="app cadre${a.open ? ' ouvert' : ''}" data-app="${i}"><div class="med">${I(a.icon)}</div><div class="nom">${esc(a.name)}</div><div class="etat">${etat}</div></button>`;
    }).join('');
    const tabs = S.tabs.filter((t) => !t.hub);
    $('tabs').innerHTML = tabs.map((t) => {
      const ic = t.icon ? I(t.icon) : (t.fav && /^https?:/.test(t.fav) ? `<img src="${esc(t.fav)}" alt="">` : I('livre'));
      const title = t.app && t.title.toLowerCase().startsWith(t.app.toLowerCase()) ? t.title.slice(t.app.length).replace(/^\s*[·\-—:|]\s*/, '') : t.title;
      const lab = t.app ? `<b>${esc(t.app)}</b><i>${esc(title)}</i>` : esc(t.title);
      return `<div class="ong"><button class="t" data-tab="${t.id}">${ic}<span class="lab">${lab}</span>${t.audible ? '<span class="son">♪</span>' : ''}</button><button class="x" data-x="${t.id}" data-p="${t.protect ? 1 : 0}">${I('close')}</button></div>`;
    }).join('') || '<div class="vide">Aucun autre onglet ouvert. Touche une app pour la lancer.</div>';
  }

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b || b.closest('#portail-mj')) return;
    if (b.dataset.app != null) return send({ type: 'openApp', app: S.apps[+b.dataset.app] });
    if (b.dataset.tab) return send({ type: 'activate', tabId: +b.dataset.tab });
    if (b.dataset.x) {
      if (b.dataset.p === '1' && !b.classList.contains('sur')) {
        const old = b.innerHTML; b.classList.add('sur'); b.textContent = 'Sûr ? (coupe le son)';
        setTimeout(() => { b.classList.remove('sur'); b.innerHTML = old; }, 2800); return;
      }
      await send({ type: 'close', tabId: +b.dataset.x }); return refresh();
    }
    if (b.id === 'search') return window.__portailOpenSearch && window.__portailOpenSearch();
    if (b.dataset.a === 'last') return send({ type: 'last' });
    if (b.dataset.a === 'fs') { await send({ type: 'fs' }); return setTimeout(refresh, 300); }
    if (b.dataset.a === 'options') return send({ type: 'options' });
  });

  clock(); setInterval(clock, 15000);
  refresh(); setInterval(() => { if (!document.hidden) refresh(); }, 2500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
