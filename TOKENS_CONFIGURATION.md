# 🔑 Configuration des Tokens et Clés Discord

## 📋 Liste des Tokens Nécessaires

Voici tous les tokens et clés dont vous avez besoin pour faire fonctionner l'application mobile :

### 1️⃣ DISCORD_TOKEN (Déjà configuré ✅)
**Qu'est-ce que c'est ?**
Le token de votre bot Discord pour qu'il puisse se connecter.

**Où le trouver ?**
Vous l'avez déjà dans votre `.env` actuel.

**Format :**
```env
DISCORD_TOKEN=VOTRE_TOKEN_DISCORD_ICI
```

---

### 2️⃣ CLIENT_ID (Déjà configuré ✅)
**Qu'est-ce que c'est ?**
L'ID de votre application Discord.

**Où le trouver ?**
Vous l'avez déjà dans votre `.env` actuel.

**Format :**
```env
CLIENT_ID=1234567890123456789
```

---

### 3️⃣ DISCORD_CLIENT_SECRET ⚠️ NOUVEAU - À CONFIGURER
**Qu'est-ce que c'est ?**
La clé secrète OAuth2 qui permet à l'application mobile de s'authentifier avec Discord.

**Comment l'obtenir ?**

#### Étape par Étape :

1. **Allez sur Discord Developer Portal**
   ```
   https://discord.com/developers/applications
   ```

2. **Sélectionnez votre application**
   - Cliquez sur votre application bot (celle qui utilise le CLIENT_ID actuel)

3. **Allez dans l'onglet OAuth2**
   - Dans le menu de gauche : **OAuth2** → **General**

4. **Trouvez le Client Secret**
   - Vous verrez une section "CLIENT SECRET"
   - Cliquez sur **"Reset Secret"** (si c'est la première fois)
   - OU cliquez sur **"Copy"** si le secret existe déjà

5. **Copiez le secret**
   ```
   Exemple : AbCdEfGhIjKlMnOpQrStUvWxYz123456
   ```

6. **Ajoutez-le dans votre .env**
   ```bash
   cd /workspace
   nano .env
   ```
   
   Ajoutez cette ligne :
   ```env
   DISCORD_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz123456
   ```

**⚠️ ATTENTION :**
- Ne partagez JAMAIS ce secret
- Ne le commitez JAMAIS dans Git
- Conservez-le en lieu sûr

---

### 4️⃣ Configuration des Redirects OAuth2 ⚠️ IMPORTANT

**Pourquoi ?**
Pour que l'authentification Discord fonctionne dans l'app mobile.

**Comment configurer ?**

#### Étape par Étape :

1. **Restez dans Discord Developer Portal**
   - Même page que pour le CLIENT_SECRET
   - Onglet **OAuth2** → **General**

2. **Scrollez jusqu'à "Redirects"**

3. **Ajoutez ces 2 URLs :**

   **URL 1 - Pour l'API :**
   ```
   http://VOTRE_IP:3001/auth/callback
   ```
   
   **Remplacez VOTRE_IP** par :
   - L'IP de votre Freebox/VM (ex: `192.168.1.100`)
   - OU `localhost` si vous testez en local
   
   **Exemple :**
   ```
   http://192.168.1.100:3001/auth/callback
   ```

   **URL 2 - Pour l'app mobile :**
   ```
   bagbot://oauth
   ```

4. **Cliquez sur "Save Changes"**

5. **Ajoutez l'URL dans votre .env**
   ```env
   API_REDIRECT_URI=http://192.168.1.100:3001/auth/callback
   ```

---

## 📝 Fichier .env Complet

Voici à quoi doit ressembler votre fichier `.env` :

```env
# Configuration Discord Bot (déjà présent)
DISCORD_TOKEN=VOTRE_TOKEN_DISCORD_ICI
CLIENT_ID=VOTRE_CLIENT_ID_ICI
GUILD_ID=VOTRE_GUILD_ID_ICI

# Configuration API Mobile (NOUVEAU - à ajouter)
API_PORT=3001
DISCORD_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz123456
API_REDIRECT_URI=http://192.168.1.100:3001/auth/callback

# Autres configurations existantes
# DATABASE_URL=...
# etc...
```

---

## 🎯 Guide Visuel Discord Developer Portal

### 1. Page d'accueil
```
https://discord.com/developers/applications
┌─────────────────────────────────────────┐
│  Discord Developer Portal               │
├─────────────────────────────────────────┤
│  My Applications                        │
│                                         │
│  [🤖 Votre Bot]  ← Cliquez ici         │
│  Client ID: 1234567890123456789         │
└─────────────────────────────────────────┘
```

### 2. Menu OAuth2
```
┌─────────────────────────────────────────┐
│  Votre Bot                              │
├─────────────────────────────────────────┤
│  ☰ Menu                                 │
│    • General Information                │
│    • Bot                                │
│    • OAuth2  ← Cliquez ici             │
│      • General                          │
│      • URL Generator                    │
│    • Rich Presence                      │
└─────────────────────────────────────────┘
```

### 3. OAuth2 → General
```
┌─────────────────────────────────────────┐
│  OAuth2 → General                       │
├─────────────────────────────────────────┤
│                                         │
│  CLIENT ID                              │
│  1234567890123456789        [Copy]     │
│                                         │
│  CLIENT SECRET                          │
│  ••••••••••••••••••        [Copy]      │
│                            [Reset]      │
│                                         │
│  REDIRECTS                              │
│  [http://192.168.1.100:3001/auth/...] │
│  [bagbot://oauth]                      │
│  [+ Add Another]                       │
│                                         │
│  [Save Changes]                         │
└─────────────────────────────────────────┘
```

---

## ✅ Vérification de la Configuration

Après avoir tout configuré, vérifiez que tout est bon :

```bash
# 1. Vérifier que les variables sont dans .env
cd /workspace
cat .env | grep -E "DISCORD_TOKEN|CLIENT_ID|DISCORD_CLIENT_SECRET|API_REDIRECT_URI"

# 2. Démarrer le bot + API
node src/bot.js

# Vous devriez voir :
# ✅ Login succeeded
# ✅ [API] Serveur API démarré sur le port 3001

# 3. Tester l'API
curl http://localhost:3001/health

# Réponse attendue :
# {"status":"ok","uptime":123.45,"bot":{"ready":true,"guilds":5}}

# 4. Tester l'URL d'authentification
curl http://localhost:3001/auth/discord/url

# Réponse attendue :
# {"url":"https://discord.com/api/oauth2/authorize?...","state":"..."}
```

---

## 🔒 Sécurité des Tokens

### ⚠️ NE JAMAIS :
- ❌ Partager vos tokens publiquement
- ❌ Les commiter dans Git
- ❌ Les envoyer par Discord/email
- ❌ Les mettre dans du code en dur

### ✅ TOUJOURS :
- ✅ Les garder dans `.env`
- ✅ Vérifier que `.env` est dans `.gitignore`
- ✅ Les régénérer si compromis
- ✅ Utiliser des variables d'environnement

---

## 🆘 Problèmes Courants

### "Invalid client secret"
**Solution :**
1. Retournez sur Discord Developer Portal
2. OAuth2 → General
3. Cliquez sur "Reset Secret"
4. Copiez le nouveau secret
5. Mettez-le à jour dans `.env`
6. Redémarrez le bot

### "Redirect URI mismatch"
**Solution :**
1. Vérifiez que l'URL dans Discord Developer Portal est EXACTEMENT la même que dans `.env`
2. Pas d'espace avant/après
3. Même protocole (http:// ou https://)
4. Même IP et port
5. Cliquez sur "Save Changes" sur Discord
6. Redémarrez le bot

### "API ne démarre pas"
**Solution :**
```bash
# Vérifier que cors est installé
npm list cors

# Si non installé
npm install --save cors

# Redémarrer
node src/bot.js
```

---

## 📞 Besoin d'Aide ?

Si vous avez des problèmes avec la configuration :

1. **Vérifiez votre .env**
   ```bash
   cat .env
   ```

2. **Consultez les logs**
   ```bash
   tail -f restart-log.txt
   ```

3. **Testez l'API manuellement**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3001/auth/discord/url
   ```

4. **Consultez le guide complet**
   ```bash
   cat ANDROID_APP_GUIDE.md
   ```

---

## 🎯 Récapitulatif Rapide

Pour l'application mobile, vous avez besoin de :

| Variable | Où la trouver | Statut |
|----------|---------------|--------|
| `DISCORD_TOKEN` | Déjà dans .env | ✅ OK |
| `CLIENT_ID` | Déjà dans .env | ✅ OK |
| `DISCORD_CLIENT_SECRET` | Discord Developer Portal → OAuth2 | ⚠️ À ajouter |
| `API_REDIRECT_URI` | Votre IP + port 3001 | ⚠️ À ajouter |

**Redirects à configurer sur Discord :**
1. `http://VOTRE_IP:3001/auth/callback`
2. `bagbot://oauth`

---

## ✅ Checklist Finale

- [ ] `DISCORD_CLIENT_SECRET` récupéré sur Discord Developer Portal
- [ ] `DISCORD_CLIENT_SECRET` ajouté dans `.env`
- [ ] `API_REDIRECT_URI` configuré dans `.env`
- [ ] Redirects ajoutés sur Discord Developer Portal
- [ ] Changes sauvegardés sur Discord
- [ ] Bot redémarré : `node src/bot.js`
- [ ] API teste OK : `curl http://localhost:3001/health`

**Une fois tout coché, vous êtes prêt ! 🚀**

---

*Conservez ce document comme référence pour la configuration des tokens.*
