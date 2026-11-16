// Portail MJ — icônes au trait (mêmes codes que Sonerezh / MJ : trait doré, pas d'emoji)
self.PMJ_ICONS = {
  couronne: '<path d="M3 18.5h18M4.2 18.5 3 8l5 4 4-7.5 4 7.5 5-4-1.2 10.5"/><circle cx="12" cy="4" r=".6"/>',
  luth: '<path d="M9 18V5.5l11-2.2V16"/><circle cx="6.5" cy="18" r="2.6"/><circle cx="17.5" cy="16" r="2.6"/><path d="M9 9.5l11-2.2"/>',
  parchemin: '<path d="M7 3.5h11a2 2 0 0 1 2 2v1.8h-4.4M7 3.5a2 2 0 0 0-2 2v12a3 3 0 0 0 3 3h9.2a2 2 0 0 0 2-2V7.3M7 3.5a2 2 0 0 1 2 2v13a2 2 0 0 0 2 2"/><path d="M11.5 9.5h5M11.5 13h5M11.5 16.5h3"/>',
  livre: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5V20"/>',
  de: '<path d="M12 2.5l8.3 4.8v9.4L12 21.5l-8.3-4.8V7.3z"/><path d="M12 2.5 7.2 9.6h9.6zM7.2 9.6 3.7 16.7M16.8 9.6l3.5 7.1M7.2 9.6 12 16.7l4.8-7.1M3.7 16.7h16.6M12 16.7v4.8"/>',
  carte: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>',
  epee: '<path d="M14.5 3.5H20.5v6L10 20l-4-4z"/><path d="M5 15l4 4M3.5 20.5l2.5-2.5M17 7l-7.5 7.5"/>',
  bouclier: '<path d="M12 3l8 3v6c0 4.8-3.4 7.9-8 9-4.6-1.1-8-4.2-8-9V6z"/><path d="M12 3v18M4 10.5h16"/>',
  plume: '<path d="M20 4C11 4 5.5 9.5 5 20M20 4c0 7.5-5.5 11.5-12 12.3M10.5 10.5l3 3"/>',
  potion: '<path d="M9.5 3h5M10.5 3v5.2L5.6 16.4A3 3 0 0 0 8.2 21h7.6a3 3 0 0 0 2.6-4.6L13.5 8.2V3"/><path d="M7.4 14h9.2"/>',
  crane: '<path d="M12 3a7.5 7.5 0 0 0-7.5 7.5c0 2.6 1.3 4.4 3 5.5V20h9v-4c1.7-1.1 3-2.9 3-5.5A7.5 7.5 0 0 0 12 3z"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="11" r="1.6"/><path d="M10.5 20v-2.5M13.5 20v-2.5"/>',
  // interface
  soleil: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
  horloge: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/>',
  lune: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  fwd: '<path d="M9 5l7 7-7 7"/>',
  reload: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4.7h-4.7"/>',
  fs: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  home: '<path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  last: '<path d="M7 7.5h12l-3.2-3.2M17 16.5H5l3.2 3.2"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M5.5 18.5l1.9-1.9M16.6 7.4l1.9-1.9"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5"/>',
  minus: '<path d="M6 12h12"/>',
  plus: '<path d="M6 12h12M12 6v12"/>',
  clavier: '<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><path d="M6 9.5h1M9.5 9.5h1M13 9.5h1M16.5 9.5h1.5M6 12.5h1M9.5 12.5h1M13 12.5h1M16.5 12.5h1.5M8 15.5h8"/>',
  backspace: '<path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>'
};
self.PMJ_APP_ICONS = ['couronne', 'luth', 'parchemin', 'livre', 'de', 'carte', 'epee', 'bouclier', 'plume', 'potion', 'crane'];
self.pmjIcon = (k, cls = '') => {
  const p = self.PMJ_ICONS[k];
  if (!p) return `<span class="txt-ic ${cls}">${String(k || '◆').replace(/[&<>"]/g, '')}</span>`;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
};
