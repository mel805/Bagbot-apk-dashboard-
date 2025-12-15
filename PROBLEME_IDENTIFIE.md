# 🔍 PROBLÈME IDENTIFIÉ : PORT 33002 INACCESSIBLE

## 📊 Diagnostic effectué le 15/12/2025

### Résultats des tests

| Port | Service | État |
|------|---------|------|
| **33000** | Dashboard Web | ✅ **ACCESSIBLE** |
| **33002** | API Mobile | ❌ **INACCESSIBLE** |

**Erreur retournée :** `Connection refused`

---

## 🔍 Qu'est-ce que ça signifie ?

Le port **33000** fonctionne parfaitement, ce qui prouve que :
- ✅ Votre serveur est bien accessible depuis Internet
- ✅ Le port forwarding de la Freebox fonctionne (pour le port 33000)
- ✅ Votre IP publique (88.174.155.230) est correcte

**MAIS** le port **33002** n'est pas accessible. Cela signifie :

### 🚨 Cause #1 : L'API n'a PAS été démarrée

Vous avez redémarré le bot **AVANT** de récupérer le nouveau code depuis GitHub.

**Résultat :** Le bot tourne avec l'ancien code qui ne contient pas l'API REST.

### 🚨 Cause #2 : Le port forwarding n'est pas configuré pour 33002

Le port 33000 est bien configuré, mais le port 33002 n'a pas été ajouté dans les redirections de la Freebox.

### 🚨 Cause #3 : Le firewall bloque le port 33002

UFW (le firewall) autorise le port 33000 mais pas le port 33002.

---

## ✅ SOLUTION COMPLÈTE

### Étape 1 : Récupérer le nouveau code

Le code avec l'API est sur GitHub depuis tout à l'heure. Vous devez le récupérer :

```bash
cd /workspace
git pull origin main
```

**Résultat attendu :**
```
remote: Enumerating objects: ...
Updating e61e53a..7c38b7f
Fast-forward
 RESTART_BOT_SIMPLE.sh | 67 +++++++++++++++++++++
 src/api/server.js     | 15615 ++++++++++++++++++++++++++++++++++++++++++++
 ...
```

### Étape 2 : Vérifier que l'API existe

```bash
ls -la src/api/server.js
```

**Résultat attendu :**
```
-rw-r--r-- 1 root root 15615 Dec 15 16:28 src/api/server.js
```

### Étape 3 : Vérifier le fichier .env

```bash
cat .env | grep API_PORT
```

**Résultat attendu :**
```
API_PORT=33002
```

Si vous ne voyez pas `API_PORT=33002`, ajoutez-le :

```bash
echo "API_PORT=33002" >> .env
```

### Étape 4 : Installer les dépendances

```bash
npm install cors axios
```

### Étape 5 : Redémarrer le bot

```bash
pm2 restart bag-discord-bot
```

### Étape 6 : Attendre le démarrage (5 secondes)

```bash
sleep 5
```

### Étape 7 : Vérifier que l'API fonctionne EN LOCAL

```bash
curl http://localhost:33002/health
```

**Résultat attendu :**
```json
{"status":"ok","bot":"connected"}
```

✅ **Si vous voyez ce message, l'API fonctionne !**

❌ **Si vous voyez "Connection refused", l'API n'a pas démarré. Vérifiez les logs :**

```bash
pm2 logs bag-discord-bot --lines 50 | grep -i "API\|33002\|error"
```

### Étape 8 : Ouvrir le port dans le firewall

```bash
sudo ufw allow 33002
```

**Vérifier :**
```bash
sudo ufw status | grep 33002
```

**Résultat attendu :**
```
33002                      ALLOW       Anywhere
```

### Étape 9 : Configurer le port forwarding sur la Freebox

1. Allez sur **http://mafreebox.freebox.fr**
2. Connectez-vous
3. **Paramètres de la Freebox** > **Mode avancé**
4. **Redirections de ports**
5. **Ajouter une redirection** :
   - **Port externe** : `33002`
   - **Port interne** : `33002`
   - **Protocole** : `TCP`
   - **IP de destination** : L'IP locale de votre VM (ex: 192.168.1.xxx)
   - **Commentaire** : `API Bot Discord Mobile`
6. **Enregistrer**

### Étape 10 : Tester depuis l'extérieur

**Avec un navigateur (en utilisant les données mobiles, PAS le WiFi) :**

Ouvrez : `http://88.174.155.230:33002/health`

**Résultat attendu :**
```json
{"status":"ok","bot":"connected"}
```

✅ **Si vous voyez ce message, l'API est accessible depuis Internet !**

---

## 🚀 COMMANDE UNIQUE POUR TOUT FAIRE

Copiez-collez cette ligne complète sur votre Freebox (via SSH) :

```bash
cd /workspace && git pull origin main && echo "API_PORT=33002" >> .env && npm install cors axios && pm2 restart bag-discord-bot && sleep 5 && curl http://localhost:33002/health && sudo ufw allow 33002 && echo "" && echo "✅ API démarrée ! Maintenant configurez le port forwarding 33002 sur http://mafreebox.freebox.fr"
```

---

## 📱 DANS L'APPLICATION ANDROID

Une fois que le test `http://88.174.155.230:33002/health` fonctionne, entrez dans l'app :

```
http://88.174.155.230:33002
```

**(SANS le /health à la fin)**

---

## 🆘 ÇA NE FONCTIONNE TOUJOURS PAS ?

### Scénario 1 : L'API ne démarre pas en local

**Symptôme :** `curl http://localhost:33002/health` retourne "Connection refused"

**Solution :**
```bash
pm2 logs bag-discord-bot --lines 100 --nostream
```

Cherchez les erreurs liées à l'API. Envoyez-moi les logs si vous voyez des erreurs.

### Scénario 2 : L'API fonctionne en local mais pas depuis Internet

**Symptôme :** `curl http://localhost:33002/health` fonctionne MAIS `http://88.174.155.230:33002/health` ne fonctionne pas

**Solution :**
1. Vérifiez le firewall : `sudo ufw status | grep 33002`
2. Vérifiez le port forwarding sur la Freebox
3. Testez avec les données mobiles (pas le WiFi)

### Scénario 3 : Vous voyez une erreur dans les logs

**Envoyez-moi le résultat de :**
```bash
pm2 logs bag-discord-bot --lines 100 --nostream | grep -i "API\|33002\|error"
```

---

## ✅ CHECKLIST FINALE

Avant de tester l'application, cochez :

- [ ] J'ai fait `git pull origin main`
- [ ] Le fichier `src/api/server.js` existe
- [ ] Le `.env` contient `API_PORT=33002`
- [ ] J'ai fait `npm install cors axios`
- [ ] J'ai redémarré le bot : `pm2 restart bag-discord-bot`
- [ ] L'API répond en local : `curl http://localhost:33002/health` retourne `{"status":"ok","bot":"connected"}`
- [ ] Le firewall autorise 33002 : `sudo ufw status | grep 33002`
- [ ] Le port forwarding 33002 est configuré sur la Freebox
- [ ] L'API répond depuis Internet (test avec données mobiles) : `http://88.174.155.230:33002/health`

**Si tous ces points sont verts, l'application fonctionnera ! ✅**

---

## 🎯 RÉSUMÉ EN UNE IMAGE

```
Vous êtes ici ─────────────────┐
                                │
                                ▼
[ Bot redémarré avec ANCIEN code ]
                │
                │
                ▼
    [ git pull origin main ]
                │
                │
                ▼
    [ Bot redémarré avec NOUVEAU code ]
                │
                │ (L'API démarre sur le port 33002)
                │
                ▼
    [ Port forwarding 33002 configuré ]
                │
                │
                ▼
    [ Application fonctionne ! 🎉 ]
```

---

**Vous devez récupérer le nouveau code AVANT de redémarrer !** 🚀
