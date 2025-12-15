# 🔑 Récupération Automatique des Tokens

## ✨ Bonne Nouvelle !

J'ai créé un script qui **récupère automatiquement** vos tokens depuis votre configuration existante, **SANS toucher au fonctionnement de votre bot** !

---

## 🚀 Utilisation Ultra-Simple

```bash
cd /workspace

# Lancez le script
./auto-configure-api.sh
```

**C'est tout !** Le script fait le reste automatiquement. 🎉

---

## 🔍 Ce Que Le Script Fait

### 1. Récupération Automatique

Le script cherche vos tokens dans :

✅ **ecosystem.config.js** (votre fichier PM2)
   - CLIENT_ID : `1414216173809307780`
   - GUILD_ID : `1360897918504271882`

✅ **Variables d'environnement système**
   - DISCORD_TOKEN (si disponible)

✅ **PM2** (si votre bot tourne actuellement)
   - Récupère les variables d'environnement du processus

### 2. Configuration Minimale Requise

Le script vous demandera **SEULEMENT** :

1. **DISCORD_TOKEN** (si pas trouvé automatiquement)
   - C'est le token de votre bot Discord
   - Vous l'avez déjà quelque part

2. **DISCORD_CLIENT_SECRET** (requis pour l'app mobile)
   - C'est le SEUL token nouveau
   - Récupérable sur Discord Developer Portal

### 3. Création du .env

Le script crée automatiquement le fichier `.env` avec :
```env
DISCORD_TOKEN=votre_token
CLIENT_ID=1414216173809307780
GUILD_ID=1360897918504271882
API_PORT=3001
DISCORD_CLIENT_SECRET=à_configurer
API_REDIRECT_URI=http://votre_ip:3001/auth/callback
```

---

## 📝 Tokens Déjà Identifiés

Depuis votre `ecosystem.config.js`, j'ai déjà trouvé :

| Token | Valeur | Statut |
|-------|--------|--------|
| CLIENT_ID | 1414216173809307780 | ✅ Trouvé |
| GUILD_ID | 1360897918504271882 | ✅ Trouvé |
| DISCORD_TOKEN | `process.env.DISCORD_TOKEN` | ⚠️ À récupérer |

---

## 🔐 DISCORD_TOKEN - Comment le Récupérer

Votre `DISCORD_TOKEN` est quelque part sur votre Freebox. Voici où le chercher :

### Option 1 : Variable d'Environnement Système

Si votre bot a été démarré avec PM2 et que le token est dans l'environnement :

```bash
# Voir toutes les variables d'environnement
printenv | grep DISCORD

# Ou directement
echo $DISCORD_TOKEN
```

### Option 2 : Depuis PM2

Si votre bot tourne avec PM2 :

```bash
# Voir les variables d'environnement du bot
pm2 show bagbot | grep DISCORD_TOKEN

# Ou voir toute la config
pm2 env bagbot
```

### Option 3 : Fichier de Configuration

Le token peut être dans un de ces fichiers :

```bash
# Chercher dans tous les fichiers
grep -r "DISCORD_TOKEN" ~/Bag-bot/ 2>/dev/null | grep -v node_modules

# Fichiers courants
cat ~/.bashrc | grep DISCORD
cat ~/.bash_profile | grep DISCORD
cat /etc/environment | grep DISCORD
```

### Option 4 : Depuis Discord Developer Portal (Si perdu)

1. Allez sur : https://discord.com/developers/applications
2. Sélectionnez votre application
3. **Bot** → **Token**
4. Cliquez sur **"Reset Token"**
5. Copiez le nouveau token

⚠️ **Attention** : Si vous régénérez le token, vous devrez redémarrer votre bot avec le nouveau token.

---

## 🆕 DISCORD_CLIENT_SECRET - Le Seul Token Nouveau

C'est le SEUL token que vous n'avez probablement pas encore.

### Comment l'Obtenir (30 secondes) :

1. **Allez sur Discord Developer Portal**
   ```
   https://discord.com/developers/applications
   ```

2. **Sélectionnez votre application**
   - Celle avec le CLIENT_ID : `1414216173809307780`

3. **Allez dans OAuth2 → General**

4. **Section "CLIENT SECRET"**
   - Si premier accès : Cliquez sur **"Reset Secret"**
   - Sinon : Cliquez sur **"Copy"**

5. **Copiez le secret**
   ```
   Format : AbCdEfGhIjKlMnOpQrStUvWxYz123456
   ```

6. **Collez-le quand le script vous le demande**

C'est tout ! ✨

---

## 🛡️ Sécurité - Votre Bot N'Est PAS Affecté

### Ce Que Le Script NE FAIT PAS :

❌ Ne modifie PAS ecosystem.config.js  
❌ Ne touche PAS à votre bot actuel  
❌ Ne redémarre PAS PM2  
❌ Ne change PAS les tokens existants  
❌ Ne modifie PAS les fichiers système  

### Ce Que Le Script FAIT :

✅ Lit seulement les configurations  
✅ Crée un NOUVEAU fichier .env  
✅ Configure l'API mobile (port 3001)  
✅ Laisse votre bot tranquille (port par défaut)  

**Votre bot continue de tourner normalement ! 🚀**

---

## 📋 Guide Pas à Pas Complet

### Étape 1 : Récupérer DISCORD_TOKEN (Si nécessaire)

```bash
# Méthode simple : Depuis PM2
pm2 env bagbot | grep DISCORD_TOKEN

# Ou depuis l'environnement
echo $DISCORD_TOKEN
```

Si rien ne s'affiche, cherchez dans vos fichiers :

```bash
# Dans votre répertoire home
cd ~
grep -r "MTI" . 2>/dev/null | grep -i discord | head -5

# Le token Discord commence généralement par MTI, MTU, ou MTA
```

### Étape 2 : Lancer le Script

```bash
cd /workspace
./auto-configure-api.sh
```

### Étape 3 : Suivre les Instructions

Le script va :
1. ✅ Trouver automatiquement CLIENT_ID et GUILD_ID
2. ❓ Demander DISCORD_TOKEN (si non trouvé)
3. ❓ Demander DISCORD_CLIENT_SECRET (nouveau)
4. ✅ Détecter votre IP automatiquement
5. ✅ Créer le fichier .env

### Étape 4 : Configurer Discord OAuth2

Allez sur Discord Developer Portal et ajoutez les redirects :
```
http://VOTRE_IP:3001/auth/callback
bagbot://oauth
```

### Étape 5 : Démarrer l'API

```bash
node src/bot.js
```

L'API démarre sur le port 3001 (différent de votre bot actuel).

---

## 🎯 Scénarios Courants

### Scénario 1 : Tout Est Automatique

```bash
$ ./auto-configure-api.sh

✓ CLIENT_ID trouvé : 1414216173809307780
✓ GUILD_ID trouvé : 1360897918504271882
✓ DISCORD_TOKEN récupéré depuis PM2

Entrez votre DISCORD_CLIENT_SECRET : [vous le tapez]
✓ Client Secret saisi

✓ Toutes les configurations sont prêtes !
```

### Scénario 2 : Token à Fournir

```bash
$ ./auto-configure-api.sh

✓ CLIENT_ID trouvé : 1414216173809307780
✓ GUILD_ID trouvé : 1360897918504271882
⚠ DISCORD_TOKEN : Non trouvé automatiquement

Voulez-vous entrer le DISCORD_TOKEN maintenant ? (o/N) : o
DISCORD_TOKEN : [vous le tapez]
✓ Token saisi

Entrez votre DISCORD_CLIENT_SECRET : [vous le tapez]
✓ Client Secret saisi

✓ Toutes les configurations sont prêtes !
```

### Scénario 3 : Configuration Plus Tard

```bash
$ ./auto-configure-api.sh

[...]
Entrez votre DISCORD_CLIENT_SECRET : [vous appuyez sur Entrée]
⚠ Client Secret non fourni. Vous devrez le configurer plus tard.

⚠ 1 configuration(s) manquante(s)

Éditez le fichier .env pour compléter :
  nano .env
```

---

## 🔄 Et Mon Bot Actuel ?

### Votre Bot Continue de Fonctionner

Votre bot actuel utilise :
- **PM2** pour le démarrage
- **ecosystem.config.js** pour la configuration
- **Port par défaut** Discord

L'API mobile utilise :
- **Fichier .env** (nouveau)
- **Port 3001** (différent)
- **Mêmes tokens** mais pour l'app mobile

**Les deux coexistent sans conflit ! ✅**

### Pour Vérifier

```bash
# Votre bot actuel
pm2 list
# Devrait afficher "bagbot" en "online"

# L'API mobile (après démarrage)
curl http://localhost:3001/health
# Devrait répondre {"status":"ok",...}
```

---

## 🆘 Problèmes et Solutions

### "DISCORD_TOKEN non trouvé"

**Cause** : Le token n'est pas dans les variables d'environnement accessibles.

**Solutions** :
1. Cherchez dans vos fichiers de config
2. Regardez les logs de démarrage de votre bot
3. Si vraiment perdu, régénérez sur Discord Developer Portal

### "pm2 command not found"

**Cause** : PM2 pas accessible dans le PATH actuel.

**Solution** :
```bash
# Trouver PM2
which pm2

# Ou utiliser le chemin complet
/usr/local/bin/pm2 env bagbot
```

### "Permission denied"

**Solution** :
```bash
chmod +x auto-configure-api.sh
./auto-configure-api.sh
```

---

## ✅ Checklist Finale

Avant de lancer le script, assurez-vous d'avoir :

- [ ] Accès à votre Freebox/VM
- [ ] Accès à Discord Developer Portal
- [ ] CLIENT_ID de votre bot (trouvé automatiquement ✅)
- [ ] DISCORD_TOKEN accessible quelque part
- [ ] Quelques minutes pour obtenir DISCORD_CLIENT_SECRET

Après le script :

- [ ] Fichier .env créé
- [ ] Tous les tokens configurés
- [ ] Redirects OAuth2 ajoutés sur Discord
- [ ] API testée : `curl http://localhost:3001/health`
- [ ] Bot actuel toujours fonctionnel

---

## 🎉 C'est Tout !

Le script automatise 90% du travail. Vous n'avez qu'à :

1. Lancer le script
2. Fournir le DISCORD_CLIENT_SECRET (nouveau token)
3. Configurer les redirects OAuth2

**Votre bot n'est PAS touché, tout est séparé ! ✅**

---

**Pour démarrer maintenant :**

```bash
cd /workspace
./auto-configure-api.sh
```

Bonne configuration ! 🚀
