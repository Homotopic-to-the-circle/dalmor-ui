// Portail MJ — tourne dans AideDD quand il est affiché dans le panneau latéral (iframe)
(() => {
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
