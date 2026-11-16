/* Dal-Mor UI — choix du thème jour / nuit, partagé par toutes les apps.
   À charger dans <head>, AVANT theme.css, sans defer :
     <script src="/dalmor-ui/theme.js"></script>
     <link rel="stylesheet" href="/dalmor-ui/theme.css">

   - Le choix est rangé dans localStorage['dalmor-theme'] : 'jour' | 'nuit' | 'heure'.
     Toutes les apps sont sur homotopic-to-the-circle.github.io → même stockage :
     changer dans une app change toutes les autres, onglets ouverts compris.
     Chaque appareil (téléphone d'un joueur…) garde son propre choix.
   - Sans choix : thème par défaut de l'app, <html data-theme-defaut="nuit"> (sinon jour).
   - Pose <html data-theme="jour|nuit"> (thème appliqué) et data-theme-choix (choix brut).
   - Tout élément [data-dalmor-theme] devient un bouton qui fait tourner jour → nuit → selon l'heure.
   - API : Dalmor.theme.get(), .set('nuit'), .suivant(), .applique()
     Événement 'dalmor-theme' sur window à chaque changement (detail = thème appliqué).
   - Le Portail (extension) écrit la même clé puis envoie l'événement 'dalmor-theme-sync'. */
(function () {
  var K = 'dalmor-theme', H = document.documentElement, ORDRE = ['jour', 'nuit', 'heure'];
  function lire() { try { var v = localStorage.getItem(K); return ORDRE.indexOf(v) >= 0 ? v : null; } catch (e) { return null; } }
  function effectif(choix) {
    if (choix === 'heure') { var h = new Date().getHours(); return h >= 19 || h < 7 ? 'nuit' : 'jour'; }
    if (choix === 'jour' || choix === 'nuit') return choix;
    return H.getAttribute('data-theme-defaut') === 'nuit' ? 'nuit' : 'jour';
  }
  function metaCouleur(t) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'nuit' ? '#070d1c' : '#efe2c2');
  }
  var dernier = null;
  function applique(doux) {
    var choix = lire(), t = effectif(choix);
    if (choix) H.setAttribute('data-theme-choix', choix); else H.removeAttribute('data-theme-choix');
    if (t === dernier && H.getAttribute('data-theme') === t) return t;
    if (doux && dernier) { H.classList.add('dalmor-bascule'); setTimeout(function () { H.classList.remove('dalmor-bascule'); }, 400); }
    H.setAttribute('data-theme', t);
    dernier = t;
    metaCouleur(t);
    try { window.dispatchEvent(new CustomEvent('dalmor-theme', { detail: t })); } catch (e) {}
    return t;
  }
  function set(v) {
    try { if (ORDRE.indexOf(v) >= 0) localStorage.setItem(K, v); else localStorage.removeItem(K); } catch (e) {}
    return applique(true);
  }
  function suivant() {
    var c = lire();
    // sans choix : on part du thème affiché pour que le premier toucher change bien quelque chose
    if (!c) c = effectif(null);
    return set(ORDRE[(ORDRE.indexOf(c) + 1) % ORDRE.length]);
  }

  applique(false);
  // l'attribut data-theme-defaut peut être posé dans le HTML après ce script : on revérifie
  document.addEventListener('DOMContentLoaded', function () { applique(false); metaCouleur(dernier); });
  window.addEventListener('storage', function (e) { if (e.key === K || e.key === null) applique(true); });
  window.addEventListener('dalmor-theme-sync', function () { applique(true); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) applique(true); });
  setInterval(function () { if (lire() === 'heure') applique(true); }, 60000);
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-dalmor-theme]');
    if (!b) return;
    e.preventDefault();
    suivant();
  });

  window.Dalmor = window.Dalmor || {};
  window.Dalmor.theme = { get: lire, effectif: function () { return effectif(lire()); }, set: set, suivant: suivant, applique: applique };
})();
