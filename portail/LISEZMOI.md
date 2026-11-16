# Portail MJ — extension Chromium (v1.4)

Mise à jour depuis une version précédente : remplacer le contenu du dossier, puis `chrome://extensions` → ↻ sur Portail MJ, et recharger les onglets ouverts.

## Installation (une fois)
1. Dézipper le dossier `portail-mj` quelque part dans ton home (ex. `~/DnD/portail-mj`) — ne pas le supprimer ensuite.
2. Chromium → `chrome://extensions` → activer **Mode développeur** (en haut à droite).
3. **Charger l'extension non empaquetée** → choisir le dossier `portail-mj`.
4. Au premier « nouvel onglet », Chromium demande si tu gardes la page de l'extension → **Conserver**.
5. Paramètres → *Au démarrage* → « Ouvrir la page Nouvel onglet » : Chromium démarre sur le Portail.
6. Option : lancer en plein écran direct : `chromium --start-fullscreen` (raccourci KDE).

## Usage
- **Dé doré flottant** (bord de l'écran, sur toutes les pages) :
  - tap → panneau : apps, onglets ouverts, retour/suivant, recharger, plein écran, fermer l'onglet ;
  - **appui long** → revient à l'onglet précédent (alt-tab tactile) ;
  - glisser verticalement → le déplacer.
- **Panneau AideDD** : un lien AideDD (fiche monstre dans l'app MJ, résultat de recherche) s'ouvre dans un panneau à droite, l'app reste visible à gauche. Poignée dorée = largeur ; en-tête : fiche précédente, taille du texte −/+, recherche, ouvrir en onglet, fermer.
- Si le panneau est désactivé (Réglages) : un seul onglet AideDD, réutilisé.
- **Sonerezh est protégée** : fermer son onglet demande un 2e tap (ça couperait la musique).
- **Recherche** : clavier AZERTY tactile intégré, résultats instantanés, noms FR ou VO :
  - sorts, monstres, objets / potions, dons (fiches AideDD) ;
  - **règles 2024** (`/regles-24/`) : chaque titre (états, actions, glossaire, propriétés et bottes d'armes…), les termes en gras (« Abri partiel ») ;
  - **armes, armures, équipement** : une entrée par ligne de tableau, caractéristiques affichées directement (dégâts, propriétés, botte, prix) ;
  - **dans le texte** : les paragraphes des règles (ex. « charger » → Chargement).
  - Le résultat s'ouvre dans le panneau, défilé jusqu'au bon endroit et surligné. La recherche web n'apparaît que si rien n'est trouvé.
  - Première construction de l'index : ~1 min (environ 100 à 250 pages de règles lues), puis mise à jour toutes les 2 semaines. Détail dans ⚙ Réglages.
- Raccourci clavier : `Alt+Q` = onglet précédent.

## Thème jour / nuit
- Bouton **lune / soleil** du panneau du d20 : bascule **la page ouverte** (l'app et le panneau du d20), sans toucher aux autres apps. C'est le seul endroit où changer le thème.
- Les onglets d'une même app suivent. Le choix est gardé (par app, sur cet ordinateur).
- Sur l'accueil et les réglages du portail : change leur thème. Sur AideDD ou un autre site : change seulement le panneau du d20.

## Limites
- Le dé n'apparaît pas sur les pages internes (`chrome://…`), le Chrome Web Store et le **lecteur PDF** intégré de Chromium. Sur ces pages : `Alt+Q` pour revenir à l'onglet précédent.
- Les URLs des apps sont celles de GitHub Pages par défaut ; si l'une est différente, corrige-la dans ⚙ Réglages.
- Après une mise à jour de l'extension, recharger les onglets déjà ouverts.
