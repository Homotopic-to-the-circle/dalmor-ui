#!/usr/bin/env bash
# Portail MJ — renomme Chromium en « Portail MJ » avec le logo du sceau, dans KDE (Kubuntu).
# Ne modifie aucun fichier système : crée une copie locale de l'entrée de menu de Chromium
# dans ~/.local/share/applications (prioritaire sur celle du système) + les icônes.
# Même profil Chromium : extension, connexion MJ, dossier de sons Sonerezh… rien ne change.
#
#   ./installer.sh                 nom « Portail MJ », démarre en plein écran
#   ./installer.sh --nom "DnD"     autre nom
#   ./installer.sh --fenetre       sans le plein écran au démarrage
# Annuler : ./desinstaller.sh
set -euo pipefail

NOM="Portail MJ"
PLEIN_ECRAN=1
while [ $# -gt 0 ]; do
  case "$1" in
    --nom) NOM="${2:?nom manquant}"; shift 2 ;;
    --fenetre) PLEIN_ECRAN=0; shift ;;
    *) echo "Option inconnue : $1"; exit 1 ;;
  esac
done

ICI="$(cd "$(dirname "$0")" && pwd)"
APPS="$HOME/.local/share/applications"
ICONES="$HOME/.local/share/icons/hicolor"
MARQUE="X-PortailMJ=true"

# 1. Trouver l'entrée de menu de Chromium (snap, paquet, flatpak)
SOURCE=""
for f in \
  /var/lib/snapd/desktop/applications/chromium_chromium.desktop \
  /usr/share/applications/chromium.desktop \
  /usr/share/applications/chromium-browser.desktop \
  /var/lib/flatpak/exports/share/applications/org.chromium.Chromium.desktop \
  "$HOME/.local/share/flatpak/exports/share/applications/org.chromium.Chromium.desktop"; do
  if [ -f "$f" ]; then SOURCE="$f"; break; fi
done
if [ -z "$SOURCE" ]; then
  echo "Chromium introuvable. Installe-le (ex. : sudo snap install chromium) puis relance."
  exit 1
fi
ID="$(basename "$SOURCE")"
echo "Chromium trouvé : $SOURCE"

# 2. Icônes du sceau
for s in 16 22 24 32 48 64 128 256 512; do
  mkdir -p "$ICONES/${s}x${s}/apps"
  cp "$ICI/icones/portail-mj-$s.png" "$ICONES/${s}x${s}/apps/portail-mj.png"
done
mkdir -p "$HOME/.local/share/pixmaps"
cp "$ICI/icones/portail-mj-512.png" "$HOME/.local/share/pixmaps/portail-mj.png"

# 3. Copie locale de l'entrée, renommée
mkdir -p "$APPS"
CIBLE="$APPS/$ID"
if [ -f "$CIBLE" ] && ! grep -q "^$MARQUE" "$CIBLE"; then
  cp "$CIBLE" "$CIBLE.avant-portail-mj"   # une copie locale existait déjà : on la garde
  echo "Ancienne copie locale sauvegardée : $CIBLE.avant-portail-mj"
fi
awk -v nom="$NOM" -v pe="$PLEIN_ECRAN" -v marque="$MARQUE" '
  BEGIN { groupe = "" }
  /^\[/ { if (groupe == "[Desktop Entry]") print marque; groupe = $0; print; next }
  # noms et descriptions traduits : retirés pour que « nom » s affiche dans toutes les langues
  groupe == "[Desktop Entry]" && /^(Name|GenericName|Comment|X-GNOME-FullName)\[/ { next }
  groupe == "[Desktop Entry]" && /^Name=/        { print "Name=" nom; next }
  groupe == "[Desktop Entry]" && /^GenericName=/ { print "GenericName=Table du Maître du Jeu"; next }
  groupe == "[Desktop Entry]" && /^Comment=/     { print "Comment=MJ, Fiches, Sonerezh et AideDD (Dal-Mor)"; next }
  groupe == "[Desktop Entry]" && /^X-GNOME-FullName=/ { print "X-GNOME-FullName=" nom; next }
  groupe == "[Desktop Entry]" && /^Keywords=/    { print "Keywords=DnD;D&D;MJ;Portail;Dal-Mor;" substr($0, 10); next }
  /^Icon=/ { print "Icon=portail-mj"; next }
  groupe == "[Desktop Entry]" && /^Exec=/ && pe == 1 && $0 !~ /--start-fullscreen/ {
    if ($0 ~ / %[UuFf]/) { sub(/ %[UuFf]/, " --start-fullscreen&") } else { $0 = $0 " --start-fullscreen" }
    print; next
  }
  { print }
  END { if (groupe == "[Desktop Entry]") print marque }
' "$SOURCE" > "$CIBLE.tmp"
grep -q "^$MARQUE" "$CIBLE.tmp" || echo "$MARQUE" >> "$CIBLE.tmp"
mv "$CIBLE.tmp" "$CIBLE"
chmod 644 "$CIBLE"

# 4. Prévenir KDE
command -v gtk-update-icon-cache >/dev/null && gtk-update-icon-cache -q -t "$ICONES" 2>/dev/null || true
command -v update-desktop-database >/dev/null && update-desktop-database -q "$APPS" 2>/dev/null || true
if command -v kbuildsycoca6 >/dev/null; then kbuildsycoca6 --noincremental >/dev/null 2>&1 || true
elif command -v kbuildsycoca5 >/dev/null; then kbuildsycoca5 --noincremental >/dev/null 2>&1 || true; fi

echo
echo "C'est fait : Chromium s'appelle maintenant « $NOM » avec le logo du sceau."
echo "Si la barre des tâches montre encore l'ancien logo : déconnecte-toi / reconnecte-toi,"
echo "ou lance : systemctl --user restart plasma-plasmashell"
[ "$PLEIN_ECRAN" = 1 ] && echo "Il démarre en plein écran (F11 pour en sortir)."
