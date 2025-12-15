# 📱 Comment Obtenir et Installer l'APK

## 🎯 Deux Options pour Obtenir l'APK

### Option 1 : Compiler l'APK Vous-Même (Recommandé ⭐)

#### Pourquoi ?
- Vous avez le contrôle total
- Version la plus récente
- Personnalisable

#### Comment faire ?

**Étape 1 : Préparez l'environnement**
```bash
cd /workspace/android-app

# Donnez les permissions au script
chmod +x build-release.sh
```

**Étape 2 : Lancez la compilation**
```bash
./build-release.sh
```

Ce script va :
1. ✅ Créer un keystore de signature automatiquement
2. ✅ Compiler l'APK en mode release
3. ✅ Signer l'APK
4. ✅ Vous indiquer où se trouve l'APK

**Étape 3 : Récupérez l'APK**

L'APK sera créé à cet emplacement :
```
/workspace/android-app/app/build/outputs/apk/release/app-release.apk
```

**Taille approximative : 10-15 Mo**

---

### Option 2 : Avec Android Studio (Si disponible)

Si vous avez Android Studio installé :

```bash
# 1. Ouvrez Android Studio
# 2. File → Open → Sélectionnez /workspace/android-app
# 3. Attendez la synchronisation Gradle
# 4. Build → Generate Signed Bundle / APK
# 5. Sélectionnez APK
# 6. Créez ou sélectionnez un keystore
# 7. Build
```

L'APK sera dans le même répertoire qu'avec le script.

---

## 📲 Comment Transférer l'APK sur Votre Téléphone

### Méthode 1 : Via USB (Plus rapide)

**Sur votre ordinateur :**
```bash
cd /workspace/android-app/app/build/outputs/apk/release

# Si vous avez adb installé
adb install app-release.apk

# OU copiez simplement le fichier
# cp app-release.apk /chemin/vers/dossier/partage/
```

**Sur votre téléphone :**
1. Connectez votre téléphone en USB
2. Activez le transfert de fichiers (MTP)
3. Copiez l'APK dans le dossier `Download` de votre téléphone

### Méthode 2 : Via un Service Cloud

**1. Uploadez l'APK**
```bash
# Google Drive, Dropbox, WeTransfer, etc.
# Ou utilisez scp vers un serveur web
```

**2. Téléchargez sur votre téléphone**
- Ouvrez le lien depuis votre téléphone
- Téléchargez l'APK

### Méthode 3 : Via un Serveur Local

**Sur votre serveur (Freebox/VM) :**
```bash
cd /workspace/android-app/app/build/outputs/apk/release

# Démarrez un serveur HTTP simple
python3 -m http.server 8000

# Ou avec Node.js
npx http-server -p 8000
```

**Sur votre téléphone :**
- Ouvrez Chrome
- Allez sur : `http://VOTRE_IP:8000`
- Cliquez sur `app-release.apk`
- Téléchargez

### Méthode 4 : Via SCP (Si vous avez SSH)

**Si votre téléphone a un client SSH :**
```bash
# Depuis votre serveur vers un serveur accessible
scp app-release.apk user@serveur.com:/var/www/html/bagbot-app.apk

# Puis téléchargez depuis :
# http://serveur.com/bagbot-app.apk
```

---

## 🔓 Installation de l'APK sur Android

### Étape 1 : Autoriser les Installations de Sources Inconnues

**Android 8.0+ :**
1. Allez dans **Paramètres**
2. **Sécurité** (ou **Biométrie et sécurité**)
3. **Installer des applications inconnues**
4. Sélectionnez **Chrome** (ou votre gestionnaire de fichiers)
5. Activez **Autoriser depuis cette source**

**Android 7.0 et inférieur :**
1. Allez dans **Paramètres**
2. **Sécurité**
3. Activez **Sources inconnues**

### Étape 2 : Installer l'APK

**Méthode A : Depuis le Gestionnaire de Fichiers**
1. Ouvrez votre **Gestionnaire de fichiers**
2. Allez dans **Téléchargements** (Download)
3. Trouvez **app-release.apk**
4. Appuyez dessus
5. Appuyez sur **Installer**
6. Attendez l'installation
7. Appuyez sur **Ouvrir** ou **Terminer**

**Méthode B : Depuis la Notification**
1. Après le téléchargement, une notification apparaît
2. Appuyez sur la notification
3. Appuyez sur **Installer**

**Méthode C : Via ADB (Si téléphone connecté)**
```bash
adb install app-release.apk
```

### Étape 3 : Lancer l'Application

1. L'icône **BagBot Manager** apparaît dans votre tiroir d'applications
2. Appuyez dessus pour lancer
3. Suivez la configuration initiale

---

## 📋 Checklist d'Installation

- [ ] APK compilé (via `./build-release.sh`)
- [ ] APK transféré sur le téléphone
- [ ] Sources inconnues autorisées
- [ ] APK installé
- [ ] Application lancée
- [ ] Configuration de l'URL serveur effectuée
- [ ] Connexion Discord réussie

---

## 🔄 Mise à Jour de l'Application

Pour mettre à jour l'application plus tard :

1. **Recompilez l'APK**
   ```bash
   cd /workspace/android-app
   ./build-release.sh
   ```

2. **Transférez le nouvel APK**

3. **Installez par-dessus l'ancienne version**
   - Android détectera automatiquement qu'il s'agit d'une mise à jour
   - Vos données seront conservées (tokens, configuration)

**⚠️ Important pour les mises à jour :**
- Utilisez TOUJOURS le même keystore
- Ne perdez JAMAIS le fichier `keystore/bagbot-release.jks`
- Conservez les mots de passe du keystore

---

## 📦 Informations sur l'APK

### Taille
- **Debug** : ~15-20 Mo
- **Release** : ~10-15 Mo (optimisé)

### Permissions Requises
L'application demande ces permissions :
- ✅ **INTERNET** - Pour communiquer avec l'API
- ✅ **ACCESS_NETWORK_STATE** - Pour vérifier la connexion

### Compatibilité
- ✅ Android 8.0 (API 26) et supérieur
- ✅ Architecture : ARM, ARM64, x86, x86_64

### Signature
L'APK est signé avec un keystore créé automatiquement :
- **Alias** : bagbot
- **Validité** : 10 000 jours (~27 ans)

---

## 🛡️ Sécurité

### L'APK est-il sûr ?

✅ **OUI**, car :
- Vous l'avez compilé vous-même
- Code source disponible et vérifiable
- Pas de code malveillant
- Pas de tracking
- Pas de pub

### Google Play Protect

Votre téléphone peut afficher un avertissement :
```
"Cette application n'a pas été analysée par Google Play Protect"
```

C'est NORMAL pour les APK hors Play Store.

**Que faire ?**
- Appuyez sur **"Installer quand même"**
- Ou **"Plus de détails"** puis **"Installer quand même"**

---

## 🆘 Problèmes d'Installation

### "Erreur d'analyse du package"
**Causes possibles :**
- APK corrompu lors du transfert
- Version Android trop ancienne (< 8.0)

**Solutions :**
```bash
# Recompilez l'APK
cd /workspace/android-app
rm -rf app/build
./build-release.sh

# Retransférez l'APK
```

### "L'application n'est pas installée"
**Causes possibles :**
- Sources inconnues non autorisées
- Problème de signature

**Solutions :**
1. Vérifiez les autorisations de sources inconnues
2. Désinstallez l'ancienne version si présente
3. Réinstallez

### "Espace insuffisant"
**Solution :**
- Libérez au moins 50 Mo sur votre téléphone
- L'app prend ~15 Mo + cache

---

## 📱 Alternative : APK Hébergé

Si vous voulez héberger l'APK sur votre Freebox :

**Étape 1 : Configurez un serveur web**
```bash
cd /workspace

# Créez un dossier public
mkdir -p /var/www/html/bagbot
cp android-app/app/build/outputs/apk/release/app-release.apk /var/www/html/bagbot/

# Renommez pour plus de clarté
mv /var/www/html/bagbot/app-release.apk /var/www/html/bagbot/bagbot-manager.apk
```

**Étape 2 : Créez une page de téléchargement**
```bash
cat > /var/www/html/bagbot/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>BagBot Manager - Téléchargement</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
        }
        .download-btn {
            background: #5865F2;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <h1>🤖 BagBot Manager</h1>
    <p>Application Android pour gérer votre bot Discord</p>
    <a href="bagbot-manager.apk" class="download-btn">
        📱 Télécharger l'APK
    </a>
    <p>Version 1.0.0 | Android 8.0+</p>
</body>
</html>
EOF
```

**Étape 3 : Accédez depuis votre téléphone**
```
http://VOTRE_IP/bagbot/
```

---

## ✅ Tout est Prêt !

Une fois l'APK installé :

1. **Lancez l'application**
2. **Configurez l'URL de votre serveur**
   ```
   http://VOTRE_IP:3001
   ```
3. **Connectez-vous avec Discord**
4. **Profitez ! 🎉**

---

## 📞 Support

Si vous avez des problèmes :

1. **Logs Android**
   ```bash
   adb logcat | grep BagBot
   ```

2. **Recompilez l'APK**
   ```bash
   cd /workspace/android-app
   ./build-release.sh
   ```

3. **Consultez la documentation**
   ```bash
   cat ANDROID_APP_GUIDE.md
   ```

---

**L'APK est prêt à être créé et installé ! 🚀**

Pour compiler : `cd android-app && ./build-release.sh`
