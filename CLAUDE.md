# Consignes pour Claude — dalmor-ui

Ce dépôt est la **source unique des couleurs, polices et du thème jour / nuit** des apps Dal-Mor (DnD_MJ, DnD_Character, Sonerezh, Portail). Lire `README.md` avant toute modification.

- Changer une couleur = modifier `theme.css` ici, **dans les deux thèmes** (`html[data-theme="jour"]` et `html[data-theme="nuit"]`), puis mettre à jour le tableau du README.
- Ne jamais renommer ni supprimer une variable existante : les trois apps en dépendent. Ajouter plutôt.
- `theme.js` doit rester sans dépendance, chargeable en `<script>` synchrone dans `<head>`. Clé de stockage **par app** : `dalmor-theme:<1er segment du chemin>` (`jour` | `nuit`). Ne pas la changer (le Portail l'écrit aussi).
- Décision du propriétaire : **le thème ne se change que depuis le d20 du Portail**, et seulement pour l'app ouverte. Ne jamais ajouter de bouton de thème dans une app ni de réglage commun à toutes les apps.
- Après une modification, vérifier les trois apps dans les deux thèmes (mêmes chemins que GitHub Pages : `/DnD_MJ/`, `/DnD_Character/`, `/Sonerezh/`, `/dalmor-ui/`).
- Les apps sont servies sur la même origine : un changement de `theme.css` / `theme.js` est en ligne pour toutes, sans toucher à leurs dépôts. Les service workers MJ / Fiches ne le montrent qu'au 2ᵉ chargement.
- `portail/` = source de l'extension Chromium (pas servie aux apps). La recharger dans `chrome://extensions` après modification.
- Pousser directement sur `main` est autorisé par le propriétaire.
