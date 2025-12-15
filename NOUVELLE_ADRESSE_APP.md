# 📱 Nouvelle Adresse pour l'Application Android

## 🎯 Adresse à Rentrer dans l'App

```
http://88.174.155.230:33002
```

**(Port changé de 3001 vers 33002)**

---

## 📋 Configuration Rapide

### Sur votre Freebox (SSH)

```bash
# 1. Aller dans le dossier du bot
cd /workspace

# 2. Éditer le .env
nano .env

# 3. Ajouter cette ligne (ou modifier si elle existe)
API_PORT=33002

# 4. Sauvegarder (Ctrl+X, Y, Entrée)

# 5. Récupérer les dernières modifications du code
git pull origin main

# 6. Redémarrer le bot
pm2 restart bag-discord-bot

# 7. Vérifier que l'API démarre sur le port 33002
pm2 logs bag-discord-bot | grep "API"

# Vous devriez voir :
# [API] 🚀 Serveur API démarré sur le port 33002

# 8. Tester localement
curl http://localhost:33002/health

# Doit retourner :
# {"status":"ok","bot":"connected"}

# 9. Ouvrir le port dans le firewall
sudo ufw allow 33002
```

### Sur l'Interface Freebox (navigateur)

**Port Forwarding** :
- Port externe : **33002**
- Port interne : **33002**
- IP de destination : **IP de votre VM Debian**
- Protocole : **TCP**

(Comme vous l'avez fait pour le port 33000)

### Test depuis l'Extérieur

Ouvrez un navigateur (en données mobiles) et allez sur :

```
http://88.174.155.230:33002/health
```

Vous devriez voir :
```json
{"status":"ok","bot":"connected"}
```

✅ Si oui → Tout fonctionne !

### Dans l'Application Android

Entrez :
```
http://88.174.155.230:33002
```

---

## 📊 Récapitulatif des Ports

| Service | Port | URL | Usage |
|---------|------|-----|-------|
| **Dashboard Web** | 33000 | `http://88.174.155.230:33000/` | Navigateur |
| **API Mobile** | 33002 | `http://88.174.155.230:33002` | Application Android |

---

## ⚠️ Important

- Le port **3001** n'est plus utilisé
- Le nouveau port est **33002**
- N'oubliez pas de :
  1. ✅ Ajouter `API_PORT=33002` dans `.env`
  2. ✅ Faire `git pull` pour récupérer le nouveau code
  3. ✅ Redémarrer le bot avec `pm2 restart`
  4. ✅ Configurer le port forwarding 33002
  5. ✅ Ouvrir le port dans le firewall

---

## 🧪 Checklist de Vérification

- [ ] `.env` contient `API_PORT=33002`
- [ ] Code mis à jour avec `git pull`
- [ ] Bot redémarré avec `pm2 restart bag-discord-bot`
- [ ] Test local fonctionne : `curl http://localhost:33002/health`
- [ ] Firewall ouvert : `sudo ufw allow 33002`
- [ ] Port forwarding 33002 configuré sur Freebox
- [ ] Test externe fonctionne : `http://88.174.155.230:33002/health`
- [ ] URL entrée dans l'app : `http://88.174.155.230:33002`
- [ ] Connexion Discord effectuée
- [ ] Accès aux paramètres du bot ! 🎉

---

## 🚀 Une Fois Configuré

Vous aurez accès à :
- 📊 Dashboard avec stats en temps réel
- 🏰 Gestion de tous les serveurs
- ⚙️ Contrôle des commandes
- 🎵 Player musique complet
- 🛡️ Outils de modération
- 💰 Système d'économie
- ⚙️ Paramètres du bot

---

**Tout est prêt ! Le port a été changé vers 33002 ! 🎊**
