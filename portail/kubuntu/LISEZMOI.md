# Chromium → « Portail MJ » sur Kubuntu

Change le nom et le logo de Chromium dans KDE (menu, barre des tâches, Alt+Tab, bureau) : **Portail MJ** avec le sceau rouge et or. Chromium démarre aussi directement en plein écran.

Rien n'est modifié dans le système : le script crée une copie locale de l'entrée de menu de Chromium dans `~/.local/share/applications/`, prioritaire sur celle du système. Même profil Chromium : l'extension, la connexion MJ, le dossier de sons de Sonerezh… tout reste.

## Installer

Dans un terminal, dans ce dossier :

```bash
chmod +x installer.sh desinstaller.sh
./installer.sh
```

Variantes : `./installer.sh --nom "DnD"` (autre nom) · `./installer.sh --fenetre` (sans plein écran au démarrage).

Si la barre des tâches montre encore l'ancien logo : se déconnecter / reconnecter, ou `systemctl --user restart plasma-plasmashell`.

Pour l'épingler : lancer Portail MJ, clic droit sur son icône dans la barre des tâches → **Épingler**. Une épingle Chromium déjà en place prend le nouveau nom et le nouveau logo toute seule.

## Annuler

```bash
./desinstaller.sh
```

## Bon à savoir

- Fonctionne avec Chromium en snap (Kubuntu par défaut), en paquet `.deb` ou en flatpak.
- Une mise à jour de Chromium ne défait rien. Si une mise à jour change beaucoup l'entrée de Chromium, relancer `./installer.sh`.
- Pour que Portail MJ s'ouvre sur l'accueil du portail : Chromium → Paramètres → Au démarrage → « Ouvrir la page Nouvel onglet ».
