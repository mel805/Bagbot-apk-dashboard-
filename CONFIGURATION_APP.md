# 🔧 Configuration de l'Application Android

## 📱 Adresse à Rentrer dans l'App

### Format de l'URL

```
http://VOTRE_IP:3001
```

**Important** :
- Remplacez `VOTRE_IP` par l'adresse IP de votre Freebox/VM Debian
- Le port est **3001** (port de l'API)
- Utilisez **http://** (pas https)
- **PAS de slash `/` à la fin**

---

## 🔍 Comment Trouver Votre IP ?

### Sur votre Freebox (VM Debian)

Connectez-vous en SSH et lancez :

```bash
hostname -I | awk '{print $1}'
```

**Exemple de résultat** : `192.168.1.100`

### Autres méthodes

**Méthode 1 - ip addr** :
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**Méthode 2 - ifconfig** :
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 📝 Exemples d'URLs Valides

```
✅ http://192.168.1.100:3001
✅ http://192.168.0.50:3001
✅ http://10.0.0.25:3001
```

## ❌ URLs Invalides

```
❌ http://localhost:3001        (Ne fonctionne pas depuis le téléphone)
❌ http://192.168.1.100:3001/   (Pas de slash à la fin)
❌ https://192.168.1.100:3001   (Pas de https)
❌ 192.168.1.100:3001           (Manque http://)
```

---

## 🚀 Configuration dans l'Application

### Première Ouverture

1. **Lancez l'application "BagBot Manager"**

2. **L'écran de configuration s'affiche**
   - Champ "URL du serveur"

3. **Entrez votre URL**
   ```
   http://192.168.1.100:3001
   ```
   (Remplacez par votre vraie IP)

4. **Cliquez sur "Valider"** ou "Sauvegarder"

5. **L'app teste la connexion**
   - ✅ Si ça marche : Passage à l'écran de connexion Discord
   - ❌ Si erreur : Vérifiez l'URL et que l'API fonctionne

### Modifier l'URL Plus Tard

1. **Ouvrez l'app**

2. **Allez dans Paramètres** (⚙️)

3. **Section "Configuration du serveur"**

4. **Modifiez l'URL**

5. **Sauvegardez**

---

## 🔧 Vérifier que l'API Fonctionne

Avant de configurer l'app, vérifiez que l'API est bien démarrée :

### Test depuis la Freebox

```bash
curl http://localhost:3001/health
```

**Réponse attendue** :
```json
{"status":"ok","bot":"connected"}
```

### Test depuis votre téléphone (même réseau WiFi)

Ouvrez un navigateur sur votre téléphone et allez sur :
```
http://VOTRE_IP:3001/health
```

Vous devriez voir la même réponse JSON.

---

## ⚠️ Problèmes Courants

### ❌ "Impossible de se connecter au serveur"

**Causes possibles** :

1. **L'API n'est pas démarrée**
   ```bash
   pm2 status bag-discord-bot
   pm2 restart bag-discord-bot
   ```

2. **Le port 3001 est bloqué par le firewall**
   ```bash
   sudo ufw allow 3001
   sudo ufw status
   ```

3. **Mauvaise IP**
   - Vérifiez avec `hostname -I`
   - Assurez-vous d'être sur le même réseau WiFi

4. **Le bot n'a pas démarré l'API**
   ```bash
   pm2 logs bag-discord-bot | grep API
   ```
   
   Vous devriez voir :
   ```
   [API] 🚀 Serveur API démarré sur le port 3001
   ```

### ❌ "Timeout" ou "Délai dépassé"

**Solutions** :

1. **Vérifiez que le port 3001 écoute**
   ```bash
   netstat -tulpn | grep 3001
   ```

2. **Testez depuis la Freebox**
   ```bash
   curl -v http://localhost:3001/health
   ```

3. **Désactivez temporairement le firewall pour tester**
   ```bash
   sudo ufw disable
   # Testez l'app
   sudo ufw enable
   ```

### ❌ "ERR_CONNECTION_REFUSED"

**Causes** :
- Le serveur API n'écoute pas sur 0.0.0.0 (toutes les interfaces)
- Il écoute uniquement sur localhost

**Vérification** dans `/workspace/src/api/server.js` :
```javascript
const PORT = process.env.API_PORT || 3001;
this.app.listen(PORT, '0.0.0.0', () => {  // ← Important: '0.0.0.0'
    console.log(`[API] 🚀 Serveur API démarré sur le port ${PORT}`);
});
```

---

## 🌐 Accès depuis l'Extérieur (Internet)

Si vous voulez accéder à votre bot depuis l'extérieur de votre réseau local :

### Option 1 : Port Forwarding (Redirection de port)

1. **Sur votre Freebox**, configurez une redirection de port :
   - Port externe : 3001
   - Port interne : 3001
   - IP de destination : IP de votre VM

2. **Utilisez votre IP publique** :
   ```
   http://VOTRE_IP_PUBLIQUE:3001
   ```

3. **Trouvez votre IP publique** :
   ```bash
   curl ifconfig.me
   ```

⚠️ **Sécurité** : Ce n'est pas recommandé sans HTTPS et authentification renforcée !

### Option 2 : VPN (Recommandé)

Connectez-vous au VPN de votre Freebox depuis votre téléphone, puis utilisez l'IP locale.

### Option 3 : Tunnel (Ngrok, Cloudflare Tunnel)

Créez un tunnel sécurisé vers votre API locale.

---

## 📋 Checklist de Configuration

- [ ] Trouver l'IP de la Freebox : `hostname -I`
- [ ] Vérifier que l'API fonctionne : `curl http://localhost:3001/health`
- [ ] Vérifier le firewall : `sudo ufw allow 3001`
- [ ] Tester depuis le téléphone (même WiFi) : navigateur → `http://IP:3001/health`
- [ ] Ouvrir l'application Android
- [ ] Entrer l'URL : `http://IP:3001`
- [ ] Valider
- [ ] Se connecter avec Discord
- [ ] ✅ Accès à tous les paramètres du bot !

---

## 🎯 Accès aux Fonctionnalités

Une fois connecté, vous aurez accès à :

### 📊 Dashboard
- Statistiques en temps réel
- Nombre de serveurs, utilisateurs, commandes

### 🏰 Serveurs
- Liste de tous les serveurs
- Statistiques par serveur

### ⚙️ Commandes
- Liste de toutes les commandes
- Activer/désactiver
- Statistiques d'utilisation

### 🎵 Musique
- Contrôler la lecture
- File d'attente
- Volume

### 🛡️ Modération
- Ban/Unban/Kick
- Logs de modération

### 💰 Économie
- Balances des utilisateurs
- Ajouter/retirer des crédits
- Leaderboard

### ⚙️ Paramètres
- Modifier l'URL du serveur
- Déconnexion
- À propos

---

## 💡 Astuce

**Utilisez une IP statique** pour votre VM Debian sur la Freebox pour éviter que l'IP change et que vous deviez reconfigurer l'app.

---

## 📞 Besoin d'Aide ?

Si vous avez des problèmes :

1. **Vérifiez les logs du bot** :
   ```bash
   pm2 logs bag-discord-bot
   ```

2. **Vérifiez que l'API démarre** :
   ```bash
   pm2 logs bag-discord-bot | grep -A5 "\[API\]"
   ```

3. **Testez la connexion réseau** :
   ```bash
   # Depuis votre téléphone, installez une app comme "Network Tools"
   # Et faites un ping vers l'IP de la Freebox
   ```

---

**Avec la bonne URL, vous aurez accès à TOUS les paramètres de votre bot ! 🎉**
