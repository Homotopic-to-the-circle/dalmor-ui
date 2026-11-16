#!/usr/bin/env bash
# Portail MJ — remet Chromium avec son nom et son logo d'origine.
set -euo pipefail
APPS="$HOME/.local/share/applications"
ICONES="$HOME/.local/share/icons/hicolor"
for f in "$APPS"/chromium_chromium.desktop "$APPS"/chromium.desktop "$APPS"/chromium-browser.desktop "$APPS"/org.chromium.Chromium.desktop; do
  [ -f "$f" ] || continue
  if grep -q "^X-PortailMJ=true" "$f"; then
    rm -f "$f"; echo "Retiré : $f"
    if [ -f "$f.avant-portail-mj" ]; then mv "$f.avant-portail-mj" "$f"; echo "Copie précédente remise : $f"; fi
  fi
done
for s in 16 22 24 32 48 64 128 256 512; do rm -f "$ICONES/${s}x${s}/apps/portail-mj.png"; done
rm -f "$HOME/.local/share/pixmaps/portail-mj.png"
command -v update-desktop-database >/dev/null && update-desktop-database -q "$APPS" 2>/dev/null || true
if command -v kbuildsycoca6 >/dev/null; then kbuildsycoca6 --noincremental >/dev/null 2>&1 || true
elif command -v kbuildsycoca5 >/dev/null; then kbuildsycoca5 --noincremental >/dev/null 2>&1 || true; fi
echo "Chromium a retrouvé son nom et son logo."
