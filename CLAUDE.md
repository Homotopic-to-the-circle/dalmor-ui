# Consignes pour Claude — dalmor-ui

Ce dépôt est la **source unique des couleurs, polices et du thème jour / nuit** des apps Dal-Mor (DnD_MJ, DnD_Character, Sonerezh, Portail). Lire `README.md` avant toute modification.

- Changer une couleur = modifier `theme.css` ici, **dans les deux thèmes** (`html[data-theme="jour"]` et `html[data-theme="nuit"]`), puis mettre à jour le tableau du README.
- Ne jamais renommer ni supprimer une variable existante : les trois apps en dépendent. Ajouter plutôt.
- `theme.js` doit rester sans dépendance, chargeable en `<script>` synchrone dans `<head>`. Clé de stockage : `dalmor-theme` (`jour` | `nuit` | `heure`). Ne pas la changer.
- Après une modification, vérifier les trois apps dans les deux thèmes (mêmes chemins que GitHub Pages : `/DnD_MJ/`, `/DnD_Character/`, `/Sonerezh/`, `/dalmor-ui/`).
- Les apps sont servies sur la même origine : un changement ici est en ligne pour toutes, sans toucher à leurs dépôts. Les service workers MJ / Fiches ne le montrent qu'au 2ᵉ chargement.
- `portail/` = source de l'extension Chromium (pas servie aux apps). La recharger dans `chrome://extensions` après modification.
- Pousser directement sur `main` est autorisé par le propriétaire.
