# 🎉 APK COMPILÉ AVEC SUCCÈS !

## ✅ Build Réussi

**Status** : ✅ SUCCESS  
**Date** : 15 Décembre 2025  
**Durée** : ~7 minutes  
**Run ID** : 20236513567

---

## 📥 TÉLÉCHARGER L'APK

### 🔗 Lien Direct

**https://github.com/mel805/Bagbot-apk-dashboard-/actions/runs/20236513567**

### 📋 Instructions de Téléchargement

1. **Cliquez sur le lien ci-dessus**

2. **Scrollez vers le bas** de la page

3. **Trouvez la section "Artifacts"** (tout en bas, après les logs)

4. **Cliquez sur "bagbot-manager-release"**
   - Un fichier ZIP (environ 20-30 MB) se télécharge

5. **Décompressez le ZIP**
   - Sur Windows : Clic droit → Extraire tout
   - Sur Mac : Double-clic sur le fichier
   - Sur Linux : `unzip bagbot-manager-release.zip`

6. **Vous avez `app-release.apk` !** 🎊

---

## 📱 INSTALLATION SUR ANDROID

### Méthode 1 : Via USB

```bash
adb install app-release.apk
```

### Méthode 2 : Transfert Cloud

1. Uploadez l'APK sur Google Drive / Dropbox / OneDrive
2. Téléchargez-le depuis votre téléphone
3. Ouvrez le fichier

### Méthode 3 : Email

1. Envoyez-vous l'APK par email
2. Ouvrez l'email sur votre téléphone
3. Téléchargez et ouvrez le fichier

### Installation

1. Ouvrez `app-release.apk` sur votre Android
2. Si demandé : Autorisez l'installation depuis des sources inconnues
   - Paramètres → Sécurité → Sources inconnues ✅
3. Cliquez sur "Installer"
4. Ouvrez "BagBot Manager"

---

## ⚙️ CONFIGURATION DE L'APPLICATION

### Premier Lancement

L'application va vous demander de configurer l'URL du serveur.

1. **Trouvez votre IP Freebox**
   
   Sur votre VM Debian :
   ```bash
   hostname -I | awk '{print $1}'
   ```
   
   Exemple : `192.168.1.100`

2. **Entrez l'URL dans l'app**
   
   Format : `http://VOTRE_IP:3001`
   
   Exemple : `http://192.168.1.100:3001`

3. **Cliquez sur "Valider"**

### Connexion Discord

1. **Cliquez sur "Se connecter avec Discord"**

2. **Autorisez l'application** dans le navigateur

3. **Retournez à l'app** - Vous êtes connecté ! ✅

---

## 🔧 CONFIGURATION DU SERVEUR API

Sur votre Freebox (VM Debian), vous devez :

### 1. Compléter le fichier .env

```bash
cd /workspace
nano .env
```

Ajoutez (si manquant) :
```env
DISCORD_CLIENT_SECRET=votre_secret_ici
```

Obtenez le secret depuis :
- https://discord.com/developers/applications
- Votre application → OAuth2 → Client Secret

### 2. Ajouter l'URL de redirection OAuth2

Sur Discord Developer Portal :
- OAuth2 → Redirects
- Ajoutez : `bagbot://oauth`
- Sauvegardez

### 3. Démarrer le bot

```bash
pm2 restart bag-discord-bot
```

L'API démarre automatiquement avec le bot !

### 4. Vérifier que ça fonctionne

```bash
curl http://localhost:3001/health
```

Devrait retourner :
```json
{"status":"ok","bot":"connected"}
```

---

## 🎯 FONCTIONNALITÉS DE L'APPLICATION

### 📊 Dashboard
- Statistiques du bot en temps réel
- Nombre de serveurs, utilisateurs, commandes
- Uptime et statut

### 🏰 Gestion des Serveurs
- Liste de tous les serveurs du bot
- Nombre de membres par serveur
- Actions rapides

### ⚙️ Commandes
- Liste de toutes les commandes disponibles
- Activer/désactiver des commandes
- Voir les statistiques d'utilisation

### 🎵 Musique
- Contrôler la lecture (play, pause, skip)
- Voir la file d'attente
- Ajuster le volume
- Statut en temps réel

### 🛡️ Modération
- Ban/Unban utilisateurs
- Kick utilisateurs
- Timeout/Mute
- Voir les logs de modération

### 💰 Économie
- Voir les balances des utilisateurs
- Ajouter/retirer des crédits
- Leaderboard
- Statistiques économiques

### ⚙️ Paramètres
- Changer l'URL du serveur
- Se déconnecter
- À propos de l'app

---

## 🆘 DÉPANNAGE

### ❌ L'app ne se connecte pas au serveur

**Vérifications** :
1. L'API tourne-t-elle ?
   ```bash
   curl http://localhost:3001/health
   pm2 logs bag-discord-bot
   ```

2. Le port 3001 est-il ouvert ?
   ```bash
   sudo ufw allow 3001
   netstat -tulpn | grep 3001
   ```

3. L'URL dans l'app est-elle correcte ?
   - Format : `http://IP:3001`
   - Pas de `/` à la fin
   - Utilisez l'IP locale, pas `localhost`

### ❌ Erreur lors de la connexion Discord

**Vérifications** :
1. Le `DISCORD_CLIENT_SECRET` est-il dans `.env` ?
2. Le redirect URI `bagbot://oauth` est-il configuré sur Discord ?
3. Le bot est-il redémarré après modification de `.env` ?

### ❌ L'APK ne s'installe pas

**Solutions** :
1. Autorisez les sources inconnues dans les paramètres
2. Vérifiez que l'APK n'est pas corrompu (re-téléchargez)
3. Essayez de désinstaller une ancienne version si présente

### ❌ L'app crash au démarrage

**Solutions** :
1. Désinstallez et réinstallez
2. Vérifiez la compatibilité Android (minimum API 24 / Android 7.0)
3. Consultez les logs : `adb logcat | grep BagBot`

---

## 📊 INFORMATIONS TECHNIQUES

### Versions
- **Android Min SDK** : 24 (Android 7.0)
- **Android Target SDK** : 34 (Android 14)
- **Kotlin** : 1.9.20
- **Jetpack Compose** : 1.5.4
- **Material3** : Latest

### Permissions Requises
- `INTERNET` : Pour communiquer avec l'API

### Taille de l'APK
- Environ 20-30 MB (compressé)
- ~50 MB installé

---

## 🔄 MISES À JOUR FUTURES

Pour mettre à jour l'application :

1. Modifiez le code dans `/workspace/android-app`
2. Commitez et poussez :
   ```bash
   git add .
   git commit -m "Update: description"
   git push origin main
   ```
3. GitHub Actions recompile automatiquement
4. Téléchargez le nouvel APK depuis Actions

---

## 📞 LIENS UTILES

| Description | Lien |
|-------------|------|
| **Télécharger l'APK** | [Actions Run](https://github.com/mel805/Bagbot-apk-dashboard-/actions/runs/20236513567) |
| **Voir tous les builds** | [GitHub Actions](https://github.com/mel805/Bagbot-apk-dashboard-/actions) |
| **Code source** | [Repository](https://github.com/mel805/Bagbot-apk-dashboard-) |
| **Discord Developer** | [Portal](https://discord.com/developers/applications) |

---

## ✅ CHECKLIST DE MISE EN ROUTE

- [ ] APK téléchargé et décompressé
- [ ] APK installé sur Android
- [ ] `.env` complété avec `DISCORD_CLIENT_SECRET`
- [ ] Redirect URI `bagbot://oauth` ajouté sur Discord
- [ ] Bot redémarré : `pm2 restart bag-discord-bot`
- [ ] API testée : `curl http://localhost:3001/health`
- [ ] URL configurée dans l'app
- [ ] Connexion Discord effectuée
- [ ] Application fonctionnelle ! 🎉

---

## 🎊 FÉLICITATIONS !

Vous avez maintenant une **application Android professionnelle** pour gérer intégralement votre bot Discord à distance !

**Profitez bien !** 🚀

---

*Créé avec ❤️ pour BagBot*  
*Build réussi le 15 Décembre 2025*
