/* Dal-Mor UI — thème jour / nuit de l'app ouverte.
   À charger dans <head>, AVANT theme.css, sans defer :
     <script src="/dalmor-ui/theme.js"></script>
     <link rel="stylesheet" href="/dalmor-ui/theme.css">

   - Chaque app a SON thème : localStorage['dalmor-theme:<app>'], où <app> est le 1er segment
     du chemin (DnD_MJ, DnD_Character, Sonerezh…). Valeurs : 'jour' | 'nuit' | 'heure'.
     Changer le thème d'une app ne touche pas les autres. Les onglets de la même app suivent.
   - Le thème se change UNIQUEMENT depuis le d20 flottant du Portail (extension Chromium) :
     il écrit cette clé puis envoie l'événement window 'dalmor-theme-sync'. Pas de bouton dans les apps.
   - Sans choix : thème par défaut de l'app, <html data-theme-defaut="nuit"> (sinon jour).
   - Pose <html data-theme="jour|nuit"> (thème appliqué) et data-theme-choix (choix brut).
   - API : Dalmor.theme.get(), .set('nuit'), .effectif(), .cle ; événement window 'dalmor-theme'
     (detail = thème appliqué) à chaque changement. */
(function () {
  var H = document.documentElement, VALEURS = ['jour', 'nuit', 'heure'];
  var app = (location.pathname.split('/')[1] || 'racine');
  var K = 'dalmor-theme:' + app;
  try { localStorage.removeItem('dalmor-theme'); } catch (e) {} // ancienne clé commune (v1)
  function lire() { try { var v = localStorage.getItem(K); return VALEURS.indexOf(v) >= 0 ? v : null; } catch (e) { return null; } }
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
    try { if (VALEURS.indexOf(v) >= 0) localStorage.setItem(K, v); else localStorage.removeItem(K); } catch (e) {}
    return applique(true);
  }

  applique(false);
  document.addEventListener('DOMContentLoaded', function () { applique(false); metaCouleur(dernier); });
  window.addEventListener('storage', function (e) { if (e.key === K || e.key === null) applique(true); });
  window.addEventListener('dalmor-theme-sync', function () { applique(true); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) applique(true); });
  setInterval(function () { if (lire() === 'heure') applique(true); }, 60000);

  window.Dalmor = window.Dalmor || {};
  window.Dalmor.theme = { cle: K, get: lire, effectif: function () { return effectif(lire()); }, set: set, applique: applique };
})();
