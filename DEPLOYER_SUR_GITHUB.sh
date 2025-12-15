#!/bin/bash

# Script pour déployer automatiquement sur GitHub
# et obtenir l'APK compilé automatiquement

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║        🚀 DÉPLOIEMENT SUR GITHUB ACTIONS 🚀                       ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}✅ Repo Git préparé${NC}"
echo -e "${GREEN}✅ Fichiers commités${NC}"
echo -e "${GREEN}✅ Workflow GitHub Actions configuré${NC}"
echo ""

echo "════════════════════════════════════════════════════════════════════"
echo "         ÉTAPE 1 : CRÉER UN REPO SUR GITHUB (2 minutes)"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "1. Allez sur : ${BLUE}https://github.com/new${NC}"
echo ""
echo "2. Remplissez :"
echo "   📝 Repository name : ${BLUE}bagbot-android-manager${NC}"
echo "   📝 Description : Application Android pour gérer BagBot Discord"
echo "   🔓 Public ou Private : Votre choix"
echo "   ❌ NE COCHEZ RIEN d'autre (pas de README, etc.)"
echo ""
echo "3. Cliquez sur ${GREEN}[Create repository]${NC}"
echo ""

echo "Appuyez sur ENTRÉE quand c'est fait..."
read

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "         ÉTAPE 2 : OBTENIR VOTRE NOM D'UTILISATEUR GITHUB"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo -n "Entrez votre nom d'utilisateur GitHub : "
read GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${YELLOW}⚠️  Nom d'utilisateur vide. Utilisation de 'votre-username' par défaut${NC}"
    GITHUB_USERNAME="votre-username"
fi

REPO_URL="https://github.com/${GITHUB_USERNAME}/bagbot-android-manager.git"

echo ""
echo "URL du repo : ${BLUE}${REPO_URL}${NC}"
echo ""

echo "════════════════════════════════════════════════════════════════════"
echo "         ÉTAPE 3 : POUSSER LE CODE SUR GITHUB"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Vérifier si la remote existe déjà
if git remote | grep -q "origin"; then
    echo "Remote 'origin' existe déjà, mise à jour..."
    git remote set-url origin "$REPO_URL"
else
    echo "Ajout de la remote 'origin'..."
    git remote add origin "$REPO_URL"
fi

echo ""
echo "🚀 Push du code vers GitHub..."
echo ""

# Définir la branche principale
git branch -M main

# Pousser le code
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    ✅ CODE POUSSÉ AVEC SUCCÈS !${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    echo "════════════════════════════════════════════════════════════════════"
    echo "         ÉTAPE 4 : GITHUB COMPILE L'APK AUTOMATIQUEMENT"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo "GitHub Actions va maintenant compiler votre APK automatiquement !"
    echo ""
    echo "📍 Suivez la compilation ici :"
    echo "   ${BLUE}https://github.com/${GITHUB_USERNAME}/bagbot-android-manager/actions${NC}"
    echo ""
    echo "⏱️  Durée estimée : 5-10 minutes"
    echo ""
    echo "🔔 Vous recevrez un email si le build échoue"
    echo ""
    
    echo "════════════════════════════════════════════════════════════════════"
    echo "         ÉTAPE 5 : TÉLÉCHARGER L'APK"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo "Une fois la compilation terminée (✅ vert) :"
    echo ""
    echo "1. Allez sur :"
    echo "   ${BLUE}https://github.com/${GITHUB_USERNAME}/bagbot-android-manager/actions${NC}"
    echo ""
    echo "2. Cliquez sur le workflow le plus récent (en haut)"
    echo ""
    echo "3. Scrollez vers le bas → Section 'Artifacts'"
    echo ""
    echo "4. Cliquez sur ${GREEN}'bagbot-manager-release'${NC}"
    echo ""
    echo "5. Un fichier ZIP se télécharge"
    echo ""
    echo "6. Décompressez-le → Vous avez ${GREEN}app-release.apk${NC} ! 🎉"
    echo ""
    
    echo "════════════════════════════════════════════════════════════════════"
    echo "         📱 INSTALLER L'APK SUR VOTRE TÉLÉPHONE"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo "Transférez l'APK sur votre téléphone :"
    echo "  • Via USB"
    echo "  • Via Google Drive / Dropbox"
    echo "  • Par email"
    echo ""
    echo "Sur votre téléphone :"
    echo "  1. Ouvrez le fichier app-release.apk"
    echo "  2. Autorisez l'installation depuis des sources inconnues"
    echo "  3. Installez"
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo -e "${GREEN}🎊 Félicitations ! Votre app Android sera prête dans 10 minutes ! 🎊${NC}"
    echo ""
    echo "Pour voir les logs de compilation en temps réel :"
    echo "  ${BLUE}https://github.com/${GITHUB_USERNAME}/bagbot-android-manager/actions${NC}"
    echo ""
    
else
    echo ""
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}                    ⚠️  AUTHENTIFICATION REQUISE${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "GitHub demande vos identifiants."
    echo ""
    echo "🔑 Pour le mot de passe, utilisez un Personal Access Token :"
    echo ""
    echo "1. Allez sur : ${BLUE}https://github.com/settings/tokens${NC}"
    echo ""
    echo "2. ${GREEN}'Generate new token'${NC} → ${GREEN}'Classic'${NC}"
    echo ""
    echo "3. Note : 'BagBot Android Build'"
    echo ""
    echo "4. Cochez : ${GREEN}✅ repo${NC} (accès complet au repository)"
    echo ""
    echo "5. Cliquez sur ${GREEN}'Generate token'${NC}"
    echo ""
    echo "6. ${YELLOW}⚠️  COPIEZ LE TOKEN IMMÉDIATEMENT${NC} (affiché une seule fois !)"
    echo ""
    echo "7. Réessayez le push :"
    echo "   ${BLUE}git push -u origin main${NC}"
    echo ""
    echo "8. Username : Votre nom d'utilisateur GitHub"
    echo "   Password : ${YELLOW}Le token généré${NC} (pas votre mot de passe !)"
    echo ""
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "📚 Besoin d'aide ? Consultez :"
echo "   ${BLUE}cat GITHUB_ACTIONS_GUIDE.md${NC}"
echo ""
