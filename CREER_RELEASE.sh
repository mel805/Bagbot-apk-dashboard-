#!/bin/bash

# Script pour créer le GitHub Release avec l'APK

clear

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║         🚀 CRÉATION DU GITHUB RELEASE 🚀                         ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "         ÉTAPE 1 : TÉLÉCHARGEMENT DE L'APK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📥 Téléchargement de l'APK depuis GitHub Actions..."
mkdir -p /tmp/apk-release
cd /tmp/apk-release

gh run download 20294898425 --repo mel805/Bagbot-apk-dashboard- --name bagbot-manager-release

if [ -f "app-release.apk" ]; then
    echo -e "${GREEN}✅ APK téléchargé avec succès !${NC}"
    mv app-release.apk bagbot-manager-v1.0.0.apk
else
    echo -e "${RED}❌ Erreur : APK non trouvé${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "         ÉTAPE 2 : CRÉATION DU TAG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /workspace

# Vérifier si le tag existe déjà
if git rev-parse v1.0.0 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Le tag v1.0.0 existe déjà${NC}"
else
    echo "🏷️  Création du tag v1.0.0..."
    git tag -a v1.0.0 -m "Release v1.0.0 - Bagbot Manager Android App"
    git push origin v1.0.0
    echo -e "${GREEN}✅ Tag créé et poussé !${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "         ÉTAPE 3 : CRÉATION DU RELEASE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 Création du GitHub Release avec l'APK..."

gh release create v1.0.0 \
  --repo mel805/Bagbot-apk-dashboard- \
  --title "Bagbot Manager v1.0.0" \
  --notes "# 🎉 Bagbot Manager - Release v1.0.0

## 📱 Application Android de gestion Discord Bot

Application complète pour gérer votre bot Discord Bagbot depuis votre smartphone Android.

### ✨ Fonctionnalités

- 📊 **Dashboard** : Statistiques en temps réel
- 🖥️ **Serveurs** : Gestion de tous vos serveurs Discord
- 🎮 **Commandes** : Exécution de commandes à distance
- 💰 **Économie** : Gestion des points et niveaux
- 🛡️ **Modération** : Ban, kick, timeout
- 🎵 **Musique** : Contrôle de la lecture
- ⚙️ **Configuration** : Personnalisation du bot

### 📋 Installation

1. Téléchargez **bagbot-manager-v1.0.0.apk**
2. Installez sur votre Android
3. Configurez l'URL : \`http://88.174.155.230:33002\`
4. Connectez-vous avec Discord

### 🔧 Prérequis

- Android 7.0+ (API 24+)
- Connexion Internet
- API REST du bot configurée (port 33002)

### ⚙️ Configuration serveur

\`\`\`bash
# URL de l'API à entrer dans l'app
http://88.174.155.230:33002
\`\`\`

### 📖 Documentation

- [Guide complet](https://github.com/mel805/Bagbot-apk-dashboard-/blob/main/RELEASE_FINAL.md)
- [Configuration API](https://github.com/mel805/Bagbot-apk-dashboard-/blob/main/SUCCES_API_FONCTIONNELLE.md)
- [Dépannage](https://github.com/mel805/Bagbot-apk-dashboard-/blob/main/PROBLEME_IDENTIFIE.md)

**Profitez de votre application ! 🚀**" \
  /tmp/apk-release/bagbot-manager-v1.0.0.apk

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅✅✅ RELEASE CRÉÉ AVEC SUCCÈS ! ✅✅✅${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "         📱 LIENS DE TÉLÉCHARGEMENT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔗 Page du Release :"
    echo "   https://github.com/mel805/Bagbot-apk-dashboard-/releases/tag/v1.0.0"
    echo ""
    echo "🔗 Téléchargement direct de l'APK :"
    echo "   https://github.com/mel805/Bagbot-apk-dashboard-/releases/download/v1.0.0/bagbot-manager-v1.0.0.apk"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${GREEN}🎉 L'APK est maintenant disponible au téléchargement ! 🎉${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erreur lors de la création du release${NC}"
    echo ""
    echo "Vous devez créer le release manuellement :"
    echo ""
    echo "1. Allez sur https://github.com/mel805/Bagbot-apk-dashboard-/releases/new"
    echo "2. Tag : v1.0.0"
    echo "3. Titre : Bagbot Manager v1.0.0"
    echo "4. Attachez le fichier : /tmp/apk-release/bagbot-manager-v1.0.0.apk"
    echo "5. Publiez le release"
    echo ""
fi
