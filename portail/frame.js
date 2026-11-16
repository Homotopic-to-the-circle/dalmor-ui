// Portail MJ — tourne dans les pages AideDD (panneau latéral et onglets).
//  - dans le panneau (iframe) : signale l'adresse / le titre au panneau, applique le zoom ;
//  - partout : une adresse se terminant par #pmj=<texte> (résultat de recherche d'une règle,
//    d'une arme…) fait défiler jusqu'au titre, à la ligne de tableau ou au paragraphe, et le surligne.
(() => {
  const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/œ/g, 'oe').replace(/[^a-z0-9]+/g, ' ').trim();
  const sansVo = (s) => s.replace(/\s*\[[^\]]*\]\s*$/, '');

  function trouver(cible) {
    const c = norm(cible);
    if (!c) return null;
    const txt = (el) => norm(sansVo(el.textContent.replace(/\s+/g, ' ').trim()));
    // 1. titre
    for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) if (txt(h) === c) return h;
    // 2. ligne de tableau (1re colonne)
    for (const tr of document.querySelectorAll('tr')) {
      const td = tr.querySelector('th,td');
      if (td && txt(td) === c) return tr;
    }
    // 3. terme en gras
    for (const b of document.querySelectorAll('strong,b')) if (txt(b).replace(/\s+$/, '') === c) return b.closest('p,li,dd') || b;
    // 4. paragraphe qui commence par le texte (recherche dans le texte)
    for (const p of document.querySelectorAll('p,li,dd')) if (txt(p).startsWith(c)) return p;
    // 5. titre qui commence par le texte
    for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) if (txt(h).startsWith(c)) return h;
    return null;
  }
  function surligner(el) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const avant = el.style.cssText;
    el.style.transition = 'background-color .6s, box-shadow .6s';
    el.style.backgroundColor = 'rgba(236, 208, 138, .55)';
    el.style.boxShadow = '0 0 0 3px rgba(207, 169, 85, .8)';
    setTimeout(() => { el.style.backgroundColor = 'transparent'; el.style.boxShadow = 'none'; }, 2600);
    setTimeout(() => { el.style.cssText = avant; }, 3400);
  }
  function aller() {
    const m = location.hash.match(/^#pmj=(.+)$/);
    if (!m) return;
    let cible; try { cible = decodeURIComponent(m[1]); } catch (e) { return; }
    let essais = 0;
    const tente = () => {
      const el = trouver(cible);
      if (el) surligner(el);
      else if (++essais < 10) setTimeout(tente, 250); // page encore en cours de construction
    };
    tente();
  }
  aller();
  window.addEventListener('hashchange', aller);

  if (window.top === window) return;
  const report = () => parent.postMessage({ portailFrame: true, url: location.href, title: document.title.replace(/\s*[»|].*$/, '') }, '*');
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object' || !d.portail) return;
    if (d.portail === 'zoom') document.documentElement.style.zoom = String(d.z);
    if (d.portail === 'ping') report();
  });
  report();
  window.addEventListener('pageshow', report);
})();
