# 🔍 DIAGNOSTIC : API NON ACCESSIBLE

## 📊 Résultat du test

```
Connection refused sur 88.174.155.230:33002
```

**Cela signifie :**
- ✅ Votre IP publique (88.174.155.230) est accessible
- ❌ Le port 33002 n'est PAS ouvert/forwarded

## 🔍 Causes possibles

1. ❌ L'API n'est pas démarrée (le bot n'a pas récupéré le nouveau code)
2. ❌ Le port forwarding n'est pas configuré sur la Freebox
3. ❌ Le firewall bloque le port 33002
4. ❌ Le bot tourne sur l'ancien code sans l'API

---

## 🛠️ SOLUTION AUTOMATIQUE (RECOMMANDÉE)

**Connectez-vous en SSH à votre Freebox et lancez :**

```bash
cd /workspace
./DEMARRER_API.sh
```

Si le script n'existe pas :

```bash
cd /workspace
git pull origin main
chmod +x DEMARRER_API.sh
./DEMARRER_API.sh
```

Le script va **automatiquement** :
- ✅ Configurer le port 33002
- ✅ Récupérer le dernier code
- ✅ Installer les dépendances
- ✅ Redémarrer le bot
- ✅ Vérifier que l'API fonctionne
- ✅ Tester la connexion
- ✅ Vous guider pour le port forwarding

---

## 📋 SOLUTION MANUELLE (si le script ne marche pas)

### Étape 1 : Récupérer le nouveau code

```bash
cd /workspace
git pull origin main
```

### Étape 2 : Configurer le port dans .env

```bash
# Vérifier si le port est déjà configuré
cat .env | grep API_PORT

# Si rien ne s'affiche, ajoutez-le :
echo "API_PORT=33002" >> .env
```

### Étape 3 : Installer les dépendances

```bash
npm install cors axios
```

### Étape 4 : Redémarrer le bot

```bash
pm2 restart bag-discord-bot
```

### Étape 5 : Attendre le démarrage

```bash
sleep 5
```

### Étape 6 : Vérifier que l'API est démarrée

```bash
curl http://localhost:33002/health
```

**Résultat attendu :**
```json
{"status":"ok","bot":"connected"}
```

Si vous voyez ce message, l'API est bien démarrée ! ✅

### Étape 7 : Vérifier les logs

```bash
pm2 logs bag-discord-bot --lines 50 | grep -i "API\|33002"
```

**Vous devriez voir :**
```
[API] 🚀 API REST démarrée sur le port 33002
```

### Étape 8 : Ouvrir le port dans le firewall

```bash
sudo ufw allow 33002
sudo ufw status | grep 33002
```

**Résultat attendu :**
```
33002                      ALLOW       Anywhere
```

---

## 🌐 CONFIGURER LE PORT FORWARDING SUR LA FREEBOX

1. Allez sur **http://mafreebox.freebox.fr**
2. Connectez-vous avec votre mot de passe Freebox
3. Cliquez sur **"Paramètres de la Freebox"**
4. Activez le **"Mode avancé"** (en haut à droite)
5. Allez dans **"Redirections de ports"**
6. Cliquez sur **"Ajouter une redirection"**
7. Configurez :
   - **Port externe** : `33002`
   - **Port interne** : `33002`
   - **Protocole** : `TCP`
   - **IP de destination** : [IP locale de votre VM Debian, ex: 192.168.1.xxx]
   - **Commentaire** : `API Bot Discord Mobile`
8. Cliquez sur **"Enregistrer"**

---

## 🧪 TESTER LA CONNEXION

### Depuis votre VM (test local)

```bash
curl http://localhost:33002/health
```

### Depuis l'extérieur (navigateur ou données mobiles)

Ouvrez dans un navigateur (en utilisant les données mobiles, PAS le WiFi) :

```
http://88.174.155.230:33002/health
```

Vous devriez voir :
```json
{"status":"ok","bot":"connected"}
```

---

## 📱 CONFIGURER L'APPLICATION ANDROID

Dans l'écran de configuration de l'application, entrez :

```
http://88.174.155.230:33002
```

**(SANS le /health à la fin)**

---

## 🆘 EN CAS DE PROBLÈME

### L'API ne démarre pas

```bash
# Vérifier les logs complets
pm2 logs bag-discord-bot

# Vérifier que le fichier API existe
ls -la src/api/server.js

# Vérifier le .env
cat .env | grep API
```

### Le port forwarding ne fonctionne pas

1. Vérifiez que vous avez bien l'IP locale de votre VM :
   ```bash
   ip addr show
   ```

2. Vérifiez que le port forwarding est actif sur la Freebox

3. Testez depuis l'extérieur (données mobiles)

### L'application ne se connecte pas

1. Assurez-vous d'utiliser `http://` (et non `https://`)
2. Vérifiez qu'il n'y a pas de `/` à la fin de l'URL
3. Testez d'abord dans un navigateur avec les données mobiles

---

## 📞 BESOIN D'AIDE ?

Si après avoir suivi toutes ces étapes l'API ne fonctionne toujours pas, envoyez-moi :

```bash
# Les logs du bot
pm2 logs bag-discord-bot --lines 100 --nostream

# La configuration
cat .env | grep API

# Le statut du firewall
sudo ufw status | grep 33002

# Test local
curl http://localhost:33002/health
```

---

## ✅ CHECKLIST FINALE

Avant de tester l'application, vérifiez que :

- [ ] Le code a été récupéré (`git pull origin main`)
- [ ] Le port 33002 est dans `.env`
- [ ] Les dépendances sont installées (`npm install cors axios`)
- [ ] Le bot est redémarré (`pm2 restart bag-discord-bot`)
- [ ] L'API répond en local (`curl http://localhost:33002/health`)
- [ ] Le firewall autorise le port 33002 (`sudo ufw allow 33002`)
- [ ] Le port forwarding est configuré sur la Freebox
- [ ] L'API répond depuis l'extérieur (test avec données mobiles)

**Si tous ces points sont verts, l'application fonctionnera ! ✅**
