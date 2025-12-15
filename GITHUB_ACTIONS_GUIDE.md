# 🚀 Compiler l'APK avec GitHub Actions (Automatique)

## ✨ Avantages

- ✅ **100% automatique** - GitHub compile pour vous
- ✅ **Gratuit** - 2000 minutes/mois gratuites
- ✅ **Pas d'installation** - Aucun logiciel à installer
- ✅ **Rapide** - 5-10 minutes de compilation
- ✅ **Professionnel** - Build reproductible

---

## 📋 Guide Étape par Étape (10 minutes)

### Étape 1️⃣ : Créer un Compte GitHub (Si pas déjà fait)

1. Allez sur : https://github.com/signup
2. Créez un compte (gratuit)
3. Vérifiez votre email

---

### Étape 2️⃣ : Créer un Nouveau Repository

1. **Sur GitHub.com**, cliquez sur le **+** en haut à droite
2. Cliquez sur **"New repository"**
3. Remplissez :
   - **Repository name** : `bagbot-android-manager`
   - **Description** : `Application Android pour gérer BagBot`
   - **Public** ou **Private** (votre choix)
   - ❌ **Ne cochez rien d'autre** (pas de README, pas de .gitignore)
4. Cliquez sur **"Create repository"**

---

### Étape 3️⃣ : Pousser le Code sur GitHub

Sur votre serveur (Freebox/VM) :

```bash
cd /workspace

# Initialiser Git (si pas déjà fait)
git init
git branch -M main

# Ajouter tous les fichiers de l'app Android
git add android-app/
git add src/api/
git add *.md
git add .env.example

# Exclure les fichiers sensibles
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
echo "keystore/" >> .gitignore
git add .gitignore

# Premier commit
git commit -m "Initial commit: BagBot Android Manager

- Application Android complète (19 fichiers Kotlin)
- API REST intégrée au bot Discord
- 9 écrans fonctionnels
- Architecture MVVM + Material Design 3
- Documentation complète"

# Lier au repository GitHub
# ⚠️ REMPLACEZ 'VOTRE_USERNAME' par votre nom d'utilisateur GitHub !
git remote add origin https://github.com/VOTRE_USERNAME/bagbot-android-manager.git

# Pousser le code
git push -u origin main
```

**Si on vous demande vos identifiants :**
- Username : Votre nom d'utilisateur GitHub
- Password : Utilisez un **Personal Access Token** (pas votre mot de passe)

**Créer un Token :**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Cochez **"repo"**
3. Copiez le token généré
4. Utilisez-le comme mot de passe

---

### Étape 4️⃣ : Vérifier que le Workflow Existe

Sur GitHub, allez dans votre repo :
1. Cliquez sur l'onglet **"Actions"**
2. Vous devriez voir le workflow **"Build Android APK"**

Si vous ne le voyez pas, créez-le manuellement :

1. Dans votre repo GitHub, cliquez sur **"Add file"** → **"Create new file"**
2. Nom du fichier : `.github/workflows/build-apk.yml`
3. Copiez le contenu du fichier (voir ci-dessous)
4. Commit

**Contenu du workflow :**
```yaml
name: Build Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
      
    - name: Grant execute permission for gradlew
      working-directory: android-app
      run: chmod +x gradlew
      
    - name: Create keystore directory
      working-directory: android-app
      run: mkdir -p keystore
      
    - name: Create keystore
      working-directory: android-app
      run: |
        keytool -genkey -v -keystore keystore/bagbot-release.jks \
          -alias bagbot \
          -keyalg RSA \
          -keysize 2048 \
          -validity 10000 \
          -storepass bagbot123 \
          -keypass bagbot123 \
          -dname "CN=BagBot, OU=Mobile, O=BagBot, L=Paris, ST=IDF, C=FR"
    
    - name: Create keystore.properties
      working-directory: android-app
      run: |
        cat > keystore.properties << EOF
        storeFile=keystore/bagbot-release.jks
        storePassword=bagbot123
        keyAlias=bagbot
        keyPassword=bagbot123
        EOF
    
    - name: Build Release APK
      working-directory: android-app
      run: ./gradlew assembleRelease
      
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: bagbot-manager-release
        path: android-app/app/build/outputs/apk/release/app-release.apk
```

---

### Étape 5️⃣ : Lancer la Compilation

**Option A : Automatique (déjà fait)**

Si vous avez pushé le code, le workflow se lance automatiquement.

**Option B : Manuel**

1. GitHub → Votre repo → **Actions**
2. Cliquez sur **"Build Android APK"** (à gauche)
3. Cliquez sur **"Run workflow"** (à droite)
4. Cliquez sur le bouton vert **"Run workflow"**

---

### Étape 6️⃣ : Suivre la Compilation

1. **Actions** → Dernier workflow (en haut)
2. Vous verrez les étapes :
   - ✅ Set up JDK
   - ✅ Setup Android SDK
   - ✅ Build Release APK
   - ✅ Upload APK

**Durée : 5-10 minutes**

Vous pouvez voir les logs en temps réel en cliquant sur chaque étape.

---

### Étape 7️⃣ : Télécharger l'APK 🎉

Une fois le build terminé (✅ vert) :

1. Scrollez vers le bas de la page
2. Section **"Artifacts"**
3. Cliquez sur **"bagbot-manager-release"**
4. Un fichier ZIP se télécharge

**Décompressez le ZIP :**
- Vous trouverez `app-release.apk`

**C'EST VOTRE APK ! 🎊**

---

## 📱 Installer l'APK sur Votre Téléphone

### Méthode 1 : Téléchargement Direct

1. **Transférez l'APK** sur votre téléphone
   - Via USB
   - Via Google Drive / Dropbox
   - Par email

2. **Sur votre téléphone :**
   - Ouvrez le gestionnaire de fichiers
   - Trouvez `app-release.apk`
   - Appuyez dessus
   - Autorisez l'installation depuis des sources inconnues
   - Installez

### Méthode 2 : Via ADB

Si votre téléphone est connecté en USB :

```bash
adb install app-release.apk
```

---

## 🔄 Mettre à Jour l'APK

Pour recompiler une nouvelle version :

1. Modifiez le code localement
2. Commitez et poussez :
   ```bash
   git add .
   git commit -m "Mise à jour: description des changements"
   git push
   ```
3. Le workflow se relance automatiquement
4. Téléchargez le nouvel APK

---

## 🎯 Personnalisation du Workflow

### Changer le Nom de l'APK

Dans le workflow, modifiez :
```yaml
- name: Rename APK
  run: mv android-app/app/build/outputs/apk/release/app-release.apk bagbot-manager-v1.0.apk

- name: Upload APK
  uses: actions/upload-artifact@v3
  with:
    name: bagbot-manager-v1.0
    path: bagbot-manager-v1.0.apk
```

### Ajouter un Numéro de Version

Dans `android-app/app/build.gradle.kts`, modifiez :
```kotlin
versionCode = 2  // Incrémentez à chaque version
versionName = "1.1"  // Version visible par l'utilisateur
```

---

## 🆘 Résolution de Problèmes

### ❌ "Error: Could not find JDK"

**Solution :** Le workflow est mal configuré.

Vérifiez que la section JDK est bien présente :
```yaml
- name: Set up JDK 17
  uses: actions/setup-java@v3
  with:
    java-version: '17'
    distribution: 'temurin'
```

### ❌ "Error: gradlew: Permission denied"

**Solution :** Ajoutez l'étape de permission :
```yaml
- name: Grant execute permission for gradlew
  working-directory: android-app
  run: chmod +x gradlew
```

### ❌ "Error: Android SDK not found"

**Solution :** Vérifiez la configuration du SDK :
```yaml
- name: Setup Android SDK
  uses: android-actions/setup-android@v2
```

### ❌ Pas d'artifact après le build

**Solution :** Vérifiez le chemin dans "Upload APK" :
```yaml
path: android-app/app/build/outputs/apk/release/app-release.apk
```

---

## 💡 Astuces

### Build Plus Rapide

Cachez les dépendances Gradle :
```yaml
- name: Cache Gradle
  uses: actions/cache@v3
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
```

### Build Automatique sur PR

Ajoutez dans `on:` :
```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
```

### Notification par Email

GitHub vous envoie automatiquement un email si le build échoue.

---

## ✅ Checklist

- [ ] Compte GitHub créé
- [ ] Repository créé
- [ ] Code poussé sur GitHub
- [ ] Workflow `.github/workflows/build-apk.yml` présent
- [ ] Build lancé (Actions)
- [ ] Build réussi (✅ vert)
- [ ] APK téléchargé depuis Artifacts
- [ ] APK extrait du ZIP
- [ ] APK installé sur le téléphone

---

## 🎉 Conclusion

**Félicitations !** Vous avez maintenant :

✅ Un workflow automatique qui compile votre APK
✅ Un APK signé prêt à installer
✅ Un processus de build professionnel

**À chaque modification du code**, GitHub recompile automatiquement l'APK !

---

## 📞 Besoin d'Aide ?

Si le build échoue :
1. Allez dans Actions → Cliquez sur le workflow en erreur
2. Cliquez sur l'étape en rouge
3. Lisez les logs d'erreur
4. Cherchez le message d'erreur sur Google ou demandez de l'aide

**La plupart des problèmes sont liés à :**
- Chemin du fichier `gradlew` incorrect
- Permissions manquantes
- SDK Android mal configuré

Tout est généralement résolu en vérifiant le workflow YAML.

---

**Votre APK est maintenant à portée de clic ! 🚀**

Temps total : ~10-15 minutes
Coût : Gratuit
Résultat : APK professionnel signé ! 🎊
