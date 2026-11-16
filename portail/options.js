const send = (msg) => new Promise((r) => chrome.runtime.sendMessage(msg, r));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const I = self.pmjIcon;
const box = document.getElementById('apps');
let side = 'right';

function row(a = { icon: 'de', name: '', url: 'https://', match: '', protect: false, theme: 'auto' }) {
  const el = document.createElement('div');
  el.className = 'app';
  el.dataset.icon = a.icon;
  el.innerHTML = `
    <div class="ic-btn" title="Icône">${I(a.icon)}<div class="picker">${self.PMJ_APP_ICONS.map((k) => `<button data-k="${k}" class="${k === a.icon ? 'on' : ''}">${I(k)}</button>`).join('')}</div></div>
    <input type="text" class="nm" value="${esc(a.name)}" placeholder="Nom">
    <input type="text" class="url" value="${esc(a.url)}" placeholder="https://…">
    <button class="btn ico up" title="Monter">${I('back').replace('M15 5l-7 7 7 7', 'M5 15l7-7 7 7')}</button>
    <button class="btn ico rouge del" title="Supprimer">${I('close')}</button>
    <div class="more">
      <label class="ck" style="padding:0"><input type="checkbox" class="pr" ${a.protect ? 'checked' : ''}><span>Protégée</span></label>
      <input type="text" class="match" value="${esc(a.match || '')}" placeholder="préfixe d'URL pour reconnaître l'onglet (facultatif)">
    </div>`;
  const ib = el.querySelector('.ic-btn'), pk = el.querySelector('.picker');
  ib.addEventListener('click', (e) => {
    const b = e.target.closest('.picker button');
    if (b) {
      el.dataset.icon = b.dataset.k;
      ib.firstChild.remove(); ib.insertAdjacentHTML('afterbegin', I(b.dataset.k));
      pk.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      pk.classList.remove('on'); e.stopPropagation(); return;
    }
    document.querySelectorAll('.picker.on').forEach((p) => p !== pk && p.classList.remove('on'));
    pk.classList.toggle('on');
  });
  el.querySelector('.del').onclick = () => el.remove();
  el.querySelector('.up').onclick = () => el.previousElementSibling && box.insertBefore(el, el.previousElementSibling);
  box.appendChild(el);
}
document.addEventListener('click', (e) => { if (!e.target.closest('.ic-btn')) document.querySelectorAll('.picker.on').forEach((p) => p.classList.remove('on')); });


function setHub(v) { document.body.className = v === 'nuit' ? 'nuit' : 'jour'; } // suit l'accueil (d20)
function setSide(v) { side = v; document.querySelectorAll('#side button').forEach((b) => b.classList.toggle('on', b.dataset.v === v)); }
document.getElementById('side').onclick = (e) => { const b = e.target.closest('button'); if (b) setSide(b.dataset.v); };

async function load() {
  const cfg = await send({ type: 'getCfg' });
  box.innerHTML = '';
  cfg.apps.forEach(row);
  document.getElementById('panel').checked = cfg.aideddPanel !== false;
  document.getElementById('reuse').checked = !!cfg.reuseAidedd;
  setSide(cfg.side || 'right');
  setHub(cfg.hubTheme);
  info();
}
async function info() {
  const i = await send({ type: 'indexInfo' });
  const d = i.date ? new Date(i.date).toLocaleString('fr') : 'jamais';
  document.getElementById('idx').textContent =
    `${i.listes.toLocaleString('fr')} sorts, monstres, objets et dons · ${i.regles.toLocaleString('fr')} entrées de règles 2024 (titres, armes, armures, équipement) lues sur ${i.pages} pages · ${i.textes.toLocaleString('fr')} paragraphes pour la recherche dans le texte. Dernière mise à jour : ${d}.` +
    (i.errors && i.errors.length ? ` Pages en échec : ${i.errors.join(', ')}.` : '');
}

document.getElementById('add').onclick = () => row();
async function save() {
  const apps = [...box.querySelectorAll('.app')].map((el) => ({
    icon: el.dataset.icon || 'de',
    name: el.querySelector('.nm').value.trim(),
    url: el.querySelector('.url').value.trim(),
    match: el.querySelector('.match').value.trim() || undefined,
    protect: el.querySelector('.pr').checked
  })).filter((a) => a.name && /^https?:\/\//.test(a.url));
  await send({ type: 'saveCfg', patch: { apps, aideddPanel: document.getElementById('panel').checked, reuseAidedd: document.getElementById('reuse').checked, side } });
  const m = document.getElementById('msg'); m.textContent = 'Enregistré.'; setTimeout(() => (m.textContent = ''), 2000);
}
document.getElementById('save').onclick = save;
// fermer l'onglet Réglages et revenir à l'onglet précédent
const quit = () => send({ type: 'close' });
document.getElementById('quit').onclick = quit;
document.getElementById('saveQuit').onclick = async () => { await save(); quit(); };
document.getElementById('reset').onclick = async () => { await send({ type: 'resetCfg' }); load(); };
document.getElementById('rebuild').onclick = async () => {
  document.getElementById('idx').textContent = 'Construction en cours…';
  await send({ type: 'buildIndex' }); info();
};
load();
window.addEventListener('portail-hub-theme', (e) => setHub(e.detail));
