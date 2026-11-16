# Dal-Mor UI

Thème commun de toutes les apps de la campagne Dal-Mor : **un seul fichier de couleurs, deux thèmes (jour / nuit), mêmes polices partout.**

| App | Dépôt | Thème par défaut |
|---|---|---|
| MJ | [DnD_MJ](https://github.com/Homotopic-to-the-circle/DnD_MJ) | jour |
| Fiches (joueurs) | [DnD_Character](https://github.com/Homotopic-to-the-circle/DnD_Character) | jour |
| Sonerezh (son) | [Sonerezh](https://github.com/Homotopic-to-the-circle/Sonerezh) | nuit |
| Portail (extension Chromium) | [`portail/`](portail/) dans ce dépôt | suit les apps |

Page de démonstration : https://homotopic-to-the-circle.github.io/dalmor-ui/

## Comment ça marche

- Toutes les apps sont servies par GitHub Pages sur **la même origine** (`homotopic-to-the-circle.github.io`). Elles partagent donc le même `localStorage`.
- Le choix du thème est rangé dans `localStorage['dalmor-theme']` : `jour`, `nuit` ou `heure` (nuit de 19 h à 7 h). **Changer dans une app change toutes les autres**, onglets déjà ouverts compris (événement `storage`).
- Chaque appareil garde son propre choix (le téléphone d'un joueur n'est pas lié à l'ordinateur du MJ).
- Sans choix enregistré, chaque app garde son thème par défaut (`<html data-theme-defaut="nuit">` pour Sonerezh, jour sinon).
- `theme.js` pose `<html data-theme="jour|nuit">` (thème affiché) et `data-theme-choix` (choix brut) ; `theme.css` définit les variables pour chaque valeur.

## Intégrer une app

Dans `<head>`, **avant** les styles de l'app, sans `defer` (évite le flash de l'autre thème) :

```html
<meta name="theme-color" content="#efe2c2">
<script src="/dalmor-ui/theme.js"></script>
<link rel="stylesheet" href="/dalmor-ui/theme.css">
```

Puis un bouton de thème, n'importe où :

```html
<button data-dalmor-theme>Thème</button>          <!-- affiche « Thème : jour / nuit / selon l’heure » -->
<button data-dalmor-theme="ico"></button>         <!-- icône seule ☾ / ☀ / ◐ -->
```

Aucun JavaScript à écrire : `theme.js` gère le clic (jour → nuit → selon l'heure). Ne pas mettre d'attribut `data-a` / `data-act` dessus.

API si besoin : `Dalmor.theme.get()`, `Dalmor.theme.set('nuit')`, `Dalmor.theme.suivant()`, `Dalmor.theme.effectif()` ; événement `window` `dalmor-theme` (detail = `jour` | `nuit`) à chaque changement.

## Règles (à respecter dans toutes les apps)

1. **Aucune couleur en dur** dans le CSS ou le HTML généré : toujours `var(--…)` ci-dessous.
2. Une teinte transparente : `color-mix(in srgb, var(--accent) 20%, transparent)`. Une ombre : `rgba(var(--ombre), .3)`.
3. **Les couleurs se changent ici**, dans `theme.css`, jamais dans une app.
4. Chaque app garde un petit bloc `:root{…}` de **secours** (ses couleurs d'origine) au cas où `dalmor-ui` ne charge pas. Les sélecteurs `html[data-theme=…]` de `theme.css` passent par-dessus. Pour une nouvelle variable, écrire `var(--nouvelle, valeur-de-secours)`.
5. Nouvelle variable : l'ajouter **dans les deux thèmes** de `theme.css` et dans le tableau ci-dessous.
6. Exceptions assumées (ne suivent pas le thème) : la visionneuse d'images plein écran (toujours sombre), les pages imprimables (journal), le remplissage de canvas.

## Variables

| Variable | Rôle | Jour | Nuit |
|---|---|---|---|
| `--bg` | fond de page | `#efe2c2` | `#070d1c` |
| `--bg2` | fond enfoncé (champs dans un panneau, rail) | `#e7d6ae` | `#0a1224` |
| `--card` | cartes, cadres, panneaux | `#f6ecd4` | `#0e1830` |
| `--card2` | carte surélevée / sélectionnée | `#fbf4e4` | `#132042` |
| `--page-bg` | dégradé de fond (image) | parchemin | halo bleu |
| `--bar-bg` | barres collantes semi-transparentes | | |
| `--tile-a` `--tile-b` | dégradé des tuiles / pads | | |
| `--tile-on-a` `--tile-on-b` | tuile active | | |
| `--fg` | texte | `#2a1c12` | `#ece3cc` |
| `--muted` | texte secondaire | `#6e5a44` | `#8a93a9` |
| `--faint` | texte très discret | `#9c8565` | `#5b6479` |
| `--accent` | titres, filets, boutons, liens | `#7a1c12` | `#cfa955` |
| `--accent-hi` | accent renforcé (titres Sonerezh, élément qui joue) | `#7a1c12` | `#ecd08a` |
| `--accent-soft` | fond léger d'accent (survol, sélection) | `#ecd3b8` | or 14 % |
| `--on-accent` | texte sur fond d'accent | `#fbf4e4` | `#0a1224` |
| `--line` | bordures | `#cdb68c` | or 38 % |
| `--danger` `--danger-soft` | suppression, alerte | | |
| `--conc` `--conc-soft` | concentration (vert) | | |
| `--warn` `--warn-soft` | avertissement | | |
| `--ok` | succès | | |
| `--ombre` | triplet RGB pour `rgba(var(--ombre),a)` | `42,28,18` | `0,0,0` |
| `--card-sh` | ombre / filet intérieur des cartes | | |
| `--glow` | halo d'un élément actif | | |
| `--scrim` | voile derrière une fenêtre modale | | |
| `--disp` | police des titres : IM Fell English SC | | |
| `--body` | police du texte : Alegreya | | |

Les polices sont hébergées ici (`fonts/`), plus besoin de Google Fonts (les liens Google restants dans les apps ne servent que de secours).

## Mises à jour et cache

Les apps ont un service worker qui garde une copie des fichiers de la même origine, y compris `/dalmor-ui/…`. MJ et Fiches affichent la copie gardée puis vont chercher la nouvelle : **un changement ici apparaît au 2ᵉ chargement** (ou via « Mettre à jour l'application »). Sonerezh prend toujours la version en ligne si possible.

## Portail (extension Chromium)

Source dans [`portail/`](portail/) (installation : `portail/LISEZMOI.md`). Le sceau flottant lit `data-theme` de la page ; son bouton lune / soleil écrit le même `localStorage['dalmor-theme']` puis envoie l'événement `dalmor-theme-sync` à `theme.js`.
