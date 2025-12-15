# 📋 Guide de Déploiement des Commandes Discord

## ⚠️ IMPORTANT - Comment ça fonctionne

Le bot utilise **2 types de déploiement** :

### 🌐 Commandes GLOBALES (47 commandes)
- Disponibles sur le **serveur ET en MP**
- Toutes les commandes avec `dmPermission: true`
- Exemples : 69, daily, crime, config, donner, etc.

### 🏰 Commandes GUILD (46 commandes)  
- Disponibles **UNIQUEMENT sur le serveur**
- Commandes admin, modération, musique, etc.
- Exemples : ban, kick, play, suite-definitive, etc.

## 🚀 Déployer TOUTES les commandes

### Une seule commande pour TOUT déployer :

```bash
cd ~/Bag-bot
node deploy-commands.js
```

✅ Cela déploie automatiquement :
- Les **47 commandes globales** (serveur + MP)
- Les **46 commandes guild** (serveur uniquement)
- **Total : 93 commandes sur le serveur**

## 🔍 Vérifier l'état actuel

```bash
cd ~/Bag-bot
node verify-commands.js
```

**Résultat attendu :**
- 🌐 Commandes GLOBALES: **47** (serveur + MP)
- 🏰 Commandes GUILD: **46** (serveur uniquement)
- ✅ **AUCUN DOUBLON**

## 📝 Liste des commandes disponibles en MP (47)

69, actionverite, agenouiller, attrape, batailleoreiller, branler, calin, caresser, 
chatouiller, collier, config, crime, cuisiner, daily, danser, deshabiller, doigter, 
donner, dormir, douche, embrasser, flirter, fuck, laisse, lecher, lit, masser, mordre, 
mouiller, ordonner, orgasme, orgie, oups, punir, reanimer, reconforter, reveiller, rose, 
seduire, sodo, sucer, tirercheveux, touche, travailler, tromper, vin, voler

## 📝 Liste des commandes serveur uniquement (46)

adminkarma, adminxp, ajout, ajoutargent, backup, ban, bot, boutique, confess, 
configbienvenue, couleur, dashboard, disconnect, dropargent, dropxp, inactif, kick, 
localisation, map, massban, masskick, mute, niveau, objet, pause, pecher, play, playlist, 
proche, purge, quarantaine, queue, restore, resume, retirer-quarantaine, serveurs, skip, 
solde, stop, suite-definitive, topeconomie, topniveaux, unban, unmute, uno, warn

## 🔧 En cas de problème

### Si des doublons apparaissent :

```bash
cd ~/Bag-bot
node clean-all-global.js
node deploy-commands.js
```

### Si les commandes MP ne s'affichent pas :

1. Attendre 5-10 minutes (synchronisation Discord)
2. Redémarrer Discord (Ctrl+R)
3. Vérifier que les commandes sont bien globales :

```bash
cd ~/Bag-bot
node verify-commands.js
```

## 🎯 Résumé

- **1 seul fichier** : `deploy-commands.js`
- **2 types de déploiement** : Global (47) + Guild (46)
- **Commandes MP** : Les 47 commandes globales sont automatiquement en MP
- **Total serveur** : 93 commandes (47 globales + 46 guild)
- **Aucun doublon** : Les commandes globales et guild ont des noms différents

---

*Dernière mise à jour : 2025-11-11 (Version finale)*
