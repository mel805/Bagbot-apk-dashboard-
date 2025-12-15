# 🚀 GUIDE ULTRA-DÉBUTANT : SE CONNECTER EN SSH À SA FREEBOX

## 🎯 Vous n'avez JAMAIS fait ça ? Pas de panique !

Voici le guide le plus simple possible, étape par étape.

---

## 🪟 Si vous êtes sur WINDOWS

### Étape 1 : Ouvrir PowerShell

1. Cliquez sur le **menu Démarrer** (en bas à gauche)
2. Tapez **"PowerShell"**
3. Cliquez sur **"Windows PowerShell"** (l'icône bleue)

### Étape 2 : Se connecter à votre Freebox

Dans la fenêtre qui s'ouvre, tapez (remplacez `VOTRE_IP` par l'IP de votre VM) :

```powershell
ssh root@VOTRE_IP
```

**Exemple :**
```powershell
ssh root@192.168.1.100
```

### Étape 3 : Entrer le mot de passe

- Tapez votre mot de passe SSH (rien ne s'affiche, c'est normal !)
- Appuyez sur **Entrée**

### Étape 4 : Vous êtes connecté ! 🎉

Maintenant, copiez-collez ces 3 lignes :

```bash
cd /workspace
git pull origin main
./RESTART_BOT_SIMPLE.sh
```

**Fait ! ✅**

---

## 🍎 Si vous êtes sur MAC

### Étape 1 : Ouvrir Terminal

1. Appuyez sur **Cmd + Espace**
2. Tapez **"Terminal"**
3. Appuyez sur **Entrée**

### Étape 2 : Se connecter

Tapez (remplacez `VOTRE_IP` par l'IP de votre VM) :

```bash
ssh root@VOTRE_IP
```

### Étape 3 : Entrer le mot de passe

- Tapez votre mot de passe (rien ne s'affiche)
- Appuyez sur **Entrée**

### Étape 4 : Lancer les commandes

```bash
cd /workspace
git pull origin main
./RESTART_BOT_SIMPLE.sh
```

**C'est bon ! ✅**

---

## 🐧 Si vous êtes sur LINUX

Vous savez probablement déjà comment faire, mais au cas où :

```bash
ssh root@VOTRE_IP
cd /workspace
git pull origin main
./RESTART_BOT_SIMPLE.sh
```

---

## ❓ Je ne connais pas l'IP de ma VM

### Méthode 1 : Depuis l'interface Freebox

1. Allez sur **http://mafreebox.freebox.fr**
2. Cliquez sur **"Périphériques réseau"**
3. Cherchez votre VM Debian
4. Notez son adresse IP (ex: `192.168.1.xxx`)

### Méthode 2 : Si vous avez déjà accès à la VM

Si vous pouvez vous connecter à votre VM d'une manière ou d'une autre, tapez :

```bash
hostname -I
```

L'adresse IP s'affiche.

---

## ❓ SSH n'est pas activé sur ma Freebox

### Activer SSH sur la Freebox

1. Allez sur **http://mafreebox.freebox.fr**
2. Connectez-vous
3. Cliquez sur **"Paramètres de la Freebox"**
4. Activez le **"Mode avancé"** (en haut à droite)
5. Allez dans **"Mode avancé"** > **"SSH"**
6. **Activez SSH**
7. Notez le mot de passe affiché

### Activer SSH sur votre VM Debian

Si SSH n'est pas installé sur votre VM :

```bash
sudo apt update
sudo apt install openssh-server -y
sudo systemctl enable ssh
sudo systemctl start ssh
```

---

## ❓ J'ai oublié mon mot de passe SSH

### Pour la Freebox

1. Allez sur **http://mafreebox.freebox.fr**
2. Mode avancé > SSH
3. Réinitialisez le mot de passe

### Pour votre VM Debian

Si vous avez un accès physique ou via l'interface web de la Freebox :

1. Connectez-vous à la VM
2. Changez le mot de passe :
   ```bash
   sudo passwd root
   ```

---

## 📱 Utiliser SSH depuis un SMARTPHONE

### Android

1. Installez **Termux** depuis Google Play Store
2. Ouvrez Termux
3. Installez OpenSSH :
   ```bash
   pkg install openssh
   ```
4. Connectez-vous :
   ```bash
   ssh root@VOTRE_IP
   ```
5. Lancez les commandes :
   ```bash
   cd /workspace
   git pull origin main
   ./RESTART_BOT_SIMPLE.sh
   ```

### iPhone

1. Installez **Terminus** depuis l'App Store
2. Créez une nouvelle connexion SSH
3. Entrez l'IP de votre VM et le mot de passe
4. Lancez les commandes

---

## 🆘 TOUJOURS BLOQUÉ ?

Si après tout ça vous ne pouvez toujours pas vous connecter, dites-moi :

1. **Quel système d'exploitation utilisez-vous ?** (Windows, Mac, Linux, Android, iPhone)
2. **Quel message d'erreur voyez-vous ?** (copiez-collez le message exact)
3. **Avez-vous déjà réussi à vous connecter en SSH avant ?**

Je vous guiderai avec des instructions encore plus précises ! 🎯

---

## ✅ RÉCAPITULATIF : LES 3 LIGNES MAGIQUES

Une fois connecté en SSH, tapez juste :

```bash
cd /workspace
git pull origin main
./RESTART_BOT_SIMPLE.sh
```

**C'est tout ! Votre API sera démarrée ! 🚀**

Ensuite :
1. Configurez le port forwarding 33002 sur http://mafreebox.freebox.fr
2. Entrez `http://88.174.155.230:33002` dans l'app Android
3. Profitez ! 🎉
