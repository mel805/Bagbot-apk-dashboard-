# ✅ Configuration Automatique Effectuée !

## 🎯 Ce Qui A Été Fait Automatiquement

### ✅ Tokens Récupérés Automatiquement

| Token | Valeur | Source | Statut |
|-------|--------|--------|--------|
| **CLIENT_ID** | `1414216173809307780` | ecosystem.config.js | ✅ OK |
| **GUILD_ID** | `1360897918504271882` | ecosystem.config.js | ✅ OK |
| **API_REDIRECT_URI** | `http://172.30.0.2:3001/auth/callback` | Détecté automatiquement | ✅ OK |
| **API_PORT** | `3001` | Configuré par défaut | ✅ OK |

### ⚠️ Tokens à Compléter (2 minutes)

| Token | Comment l'obtenir | Temps |
|-------|-------------------|-------|
| **DISCORD_TOKEN** | Commande ci-dessous | 30 sec |
| **DISCORD_CLIENT_SECRET** | Discord Developer Portal | 1 min |

---

## 🔑 ÉTAPE 1 : Récupérer le DISCORD_TOKEN (30 secondes)

### Option A : Si votre bot tourne avec PM2

```bash
# Sur votre Freebox/VM, exécutez :
pm2 env bagbot | grep DISCORD_TOKEN
```

Copiez la valeur qui apparaît après `DISCORD_TOKEN=`

### Option B : Depuis les variables d'environnement

```bash
printenv | grep DISCORD_TOKEN
```

### Option C : Si vous ne trouvez pas

Le token Discord commence généralement par `MTI`, `MTU`, ou `MTA`.

Cherchez-le dans vos fichiers :
```bash
grep -r "MTI" ~/Bag-bot/ 2>/dev/null | grep -v node_modules | head -5
```

---

## 🔐 ÉTAPE 2 : Récupérer le DISCORD_CLIENT_SECRET (1 minute)

C'est un **nouveau token** pour l'application mobile.

### Instructions Détaillées :

1. **Allez sur** : https://discord.com/developers/applications

2. **Connectez-vous** avec votre compte Discord

3. **Cliquez sur votre application**
   - Celle avec le CLIENT_ID : `1414216173809307780`

4. **Menu de gauche** : OAuth2 → General

5. **Section "CLIENT SECRET"**
   - Si c'est la première fois : Cliquez sur **"Reset Secret"**
   - Sinon : Cliquez sur **"Copy"**

6. **Copiez le secret**
   - Format : `AbCdEfGhIjKlMnOpQrStUvWxYz123456`

7. **Important** : Configurez aussi les redirects OAuth2 :
   - Toujours dans OAuth2 → General
   - Section "Redirects"
   - Cliquez sur "Add Redirect"
   - Ajoutez ces 2 URLs :
     ```
     http://172.30.0.2:3001/auth/callback
     bagbot://oauth
     ```
   - Cliquez sur **"Save Changes"**

---

## 📝 ÉTAPE 3 : Compléter le Fichier .env (30 secondes)

J'ai créé un fichier `.env.auto` avec tout ce qui a été récupéré automatiquement.

### Complétez-le maintenant :

```bash
# Copiez le template
cp .env.auto .env

# Éditez-le
nano .env
```

### Remplacez ces 2 lignes :

```env
# Ligne 7 - Remplacez VOTRE_TOKEN_ICI par votre token
DISCORD_TOKEN=VOTRE_TOKEN_DISCORD_ICI

# Ligne 21 - Remplacez VOTRE_CLIENT_SECRET_ICI par le secret
DISCORD_CLIENT_SECRET=VOTRE_CLIENT_SECRET_ICI
```

Sauvegardez : `Ctrl+O` puis `Entrée`, puis quittez : `Ctrl+X`

---

## ✅ ÉTAPE 4 : Vérification (10 secondes)

Vérifiez que tout est configuré :

```bash
cat .env | grep -E "DISCORD_TOKEN|CLIENT_ID|DISCORD_CLIENT_SECRET"
```

Vous devriez voir :
```
DISCORD_TOKEN=MTI...  (votre token complet)
CLIENT_ID=1414216173809307780
DISCORD_CLIENT_SECRET=AbC...  (votre secret)
```

---

## 🚀 ÉTAPE 5 : Compiler l'APK (5 minutes)

Maintenant que tout est configuré, compilez l'APK :

```bash
cd /workspace/android-app
./build-release.sh
```

Le script va :
1. ✅ Créer automatiquement un keystore de signature
2. ✅ Compiler l'APK en mode release
3. ✅ Signer l'APK
4. ✅ Vous indiquer où se trouve l'APK

**Résultat** :
```
📦 APK : app/build/outputs/apk/release/app-release.apk
📊 Taille : ~10-15 Mo
```

---

## 🎬 ÉTAPE 6 : Démarrer l'API (10 secondes)

```bash
cd /workspace
node src/bot.js
```

Vous verrez :
```
✅ Login succeeded
✅ [API] Serveur API démarré sur le port 3001
📱 [API] L'application Android peut maintenant se connecter
```

**Votre bot fonctionne + l'API mobile est active ! 🎉**

---

## 📱 ÉTAPE 7 : Installer l'APK (2 minutes)

### Option Simple : Via Serveur Web

**Sur votre serveur :**
```bash
cd /workspace/android-app/app/build/outputs/apk/release
python3 -m http.server 8000
```

**Sur votre téléphone :**
1. Ouvrez Chrome
2. Allez sur : `http://172.30.0.2:8000`
3. Téléchargez `app-release.apk`
4. Installez (autorisez les sources inconnues si demandé)

---

## 🎯 ÉTAPE 8 : Configurer l'Application

### Premier Lancement :

1. **URL du serveur**
   - Entrez : `http://172.30.0.2:3001`
   - (ou l'IP de votre Freebox si différente)
   - Appuyez sur "Continuer"

2. **Connexion Discord**
   - Cliquez sur "Se connecter avec Discord"
   - Autorisez l'application

3. **C'est Prêt ! 🎉**
   - Dashboard avec stats en temps réel
   - Contrôle de la musique
   - Actions de modération

---

## 📋 Récapitulatif Complet

### Ce Qui Est Fait Automatiquement ✅

- [x] CLIENT_ID récupéré
- [x] GUILD_ID récupéré
- [x] API_REDIRECT_URI configuré
- [x] Fichier `.env.auto` créé
- [x] Scripts de compilation prêts
- [x] API REST intégrée au bot

### Ce Qui Reste à Faire (5 minutes) ⚠️

1. [ ] Récupérer DISCORD_TOKEN (30 sec)
2. [ ] Récupérer DISCORD_CLIENT_SECRET (1 min)
3. [ ] Compléter le fichier .env (30 sec)
4. [ ] Configurer redirects OAuth2 (1 min)
5. [ ] Compiler l'APK (5 min)
6. [ ] Installer sur téléphone (2 min)

**Total : ~10 minutes de votre temps**

---

## 🛡️ Sécurité

### Votre Bot N'Est PAS Affecté

- ❌ `ecosystem.config.js` **non modifié**
- ❌ PM2 **non touché**
- ❌ Bot actuel **continue normalement**
- ✅ Nouveau fichier `.env` **créé**
- ✅ API sur **port différent** (3001)

**Les deux coexistent parfaitement ! ✨**

---

## 🆘 Besoin d'Aide ?

### Si vous ne trouvez pas DISCORD_TOKEN

1. Connectez-vous à votre Freebox/VM
2. Lancez : `pm2 env bagbot`
3. Cherchez la ligne DISCORD_TOKEN
4. Copiez la valeur complète

### Si l'APK ne compile pas

```bash
# Vérifiez Java
java -version

# Si absent, installez :
sudo apt update
sudo apt install default-jdk
```

### Si l'app ne se connecte pas

1. Vérifiez que le bot est démarré : `curl http://localhost:3001/health`
2. Vérifiez l'IP dans l'app (doit être celle de votre serveur)
3. Vérifiez que téléphone et serveur sont sur le même réseau

---

## 📞 Commandes Utiles

```bash
# Voir le fichier .env créé
cat .env.auto

# Compléter le fichier .env
cp .env.auto .env && nano .env

# Tester l'API
curl http://localhost:3001/health

# Compiler l'APK
cd android-app && ./build-release.sh

# Démarrer le bot + API
node src/bot.js

# Logs du bot (si PM2)
pm2 logs bagbot
```

---

## ✅ Checklist Finale

Avant de démarrer, vérifiez :

- [ ] Vous avez le DISCORD_TOKEN (trouvé avec `pm2 env bagbot`)
- [ ] Vous avez le DISCORD_CLIENT_SECRET (Discord Developer Portal)
- [ ] Fichier .env complété
- [ ] Redirects OAuth2 configurés sur Discord
- [ ] APK compilé
- [ ] Bot + API démarrés

**Une fois tout coché, vous êtes prêt ! 🚀**

---

## 🎉 Conclusion

J'ai automatisé **90% du travail** ! Il ne vous reste que :

1. Récupérer 2 tokens (3 minutes)
2. Les coller dans `.env` (30 secondes)
3. Compiler l'APK (automatique - 5 minutes)
4. Installer sur votre téléphone (2 minutes)

**Total : ~10 minutes de votre temps pour une app complète ! 🎊**

---

**Pour commencer :**

```bash
# 1. Récupérez le DISCORD_TOKEN
pm2 env bagbot | grep DISCORD_TOKEN

# 2. Obtenez le DISCORD_CLIENT_SECRET
# https://discord.com/developers/applications

# 3. Complétez le .env
cp .env.auto .env
nano .env

# 4. Compilez l'APK
cd android-app && ./build-release.sh

# 5. Démarrez tout
cd .. && node src/bot.js
```

**C'est parti ! 🚀**
