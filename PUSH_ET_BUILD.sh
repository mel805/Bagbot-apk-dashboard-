#!/bin/bash

# Script pour pousser le code et surveiller le build

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║        🚀 PUSH ET BUILD AUTOMATIQUE DE L'APK 🚀                  ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REPO_OWNER="mel805"
REPO_NAME="Bagbot-apk-dashboard-"
REPO_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}.git"

echo "📍 Dépôt : ${BLUE}${REPO_URL}${NC}"
echo ""

# Vérifier que tout est commité
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Modifications non commitées détectées${NC}"
    echo "Ajout et commit automatique..."
    git add .
    git commit -m "Update: Préparation du build Android"
fi

echo "════════════════════════════════════════════════════════════════════"
echo "         ÉTAPE 1 : PUSH DU CODE VERS GITHUB"
echo "════════════════════════════════════════════════════════════════════"
echo ""

echo "🚀 Tentative de push..."
echo ""

if git push -u origin main 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Code poussé avec succès !${NC}"
    echo ""
    
    # Attendre quelques secondes que GitHub Actions détecte le push
    echo "⏳ Attente du démarrage de GitHub Actions (10 secondes)..."
    sleep 10
    
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo "         ÉTAPE 2 : BUILD EN COURS SUR GITHUB ACTIONS"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo "GitHub Actions est en train de compiler votre APK !"
    echo ""
    echo "📊 Suivez la progression ici :"
    echo "   ${BLUE}https://github.com/${REPO_OWNER}/${REPO_NAME}/actions${NC}"
    echo ""
    echo "⏱️  Durée estimée : 5-10 minutes"
    echo ""
    
    echo "🔔 Les étapes du build :"
    echo "   1. ✅ Set up JDK 17"
    echo "   2. ✅ Setup Android SDK"
    echo "   3. ✅ Create keystore"
    echo "   4. ✅ Build Release APK (le plus long)"
    echo "   5. ✅ Upload APK"
    echo ""
    
    echo "════════════════════════════════════════════════════════════════════"
    echo "         ÉTAPE 3 : TÉLÉCHARGER L'APK"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo "Une fois le build terminé (✅ toutes les étapes en vert) :"
    echo ""
    echo "1. Allez sur :"
    echo "   ${BLUE}https://github.com/${REPO_OWNER}/${REPO_NAME}/actions${NC}"
    echo ""
    echo "2. Cliquez sur le workflow tout en haut (le plus récent)"
    echo ""
    echo "3. Scrollez vers le bas"
    echo ""
    echo "4. Section ${GREEN}'Artifacts'${NC}"
    echo ""
    echo "5. Cliquez sur ${GREEN}'bagbot-manager-release'${NC}"
    echo ""
    echo "6. Un fichier ZIP se télécharge automatiquement"
    echo ""
    echo "7. Décompressez le ZIP"
    echo ""
    echo "8. Vous avez ${GREEN}app-release.apk${NC} ! 🎉"
    echo ""
    
    echo "════════════════════════════════════════════════════════════════════"
    echo "         📱 INSTALLER L'APK"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo "Transférez l'APK sur votre téléphone Android et installez-le."
    echo ""
    echo "Au premier lancement :"
    echo "   1. Configurez l'URL du serveur : http://VOTRE_IP:3001"
    echo "   2. Connectez-vous avec Discord"
    echo "   3. Profitez ! 🎊"
    echo ""
    
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo -e "${GREEN}🎉 Tout est lancé ! Le build prendra 5-10 minutes.${NC}"
    echo ""
    echo "Liens utiles :"
    echo "  • Actions : ${BLUE}https://github.com/${REPO_OWNER}/${REPO_NAME}/actions${NC}"
    echo "  • Repo : ${BLUE}https://github.com/${REPO_OWNER}/${REPO_NAME}${NC}"
    echo ""
    
else
    echo ""
    echo -e "${RED}❌ Échec du push${NC}"
    echo ""
    echo "Cela peut être dû à :"
    echo "  • Authentification requise"
    echo "  • Token GitHub manquant ou expiré"
    echo "  • Pas d'accès en écriture au repo"
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo "         🔑 SOLUTION : CRÉER UN TOKEN GITHUB"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo "1. Allez sur : ${BLUE}https://github.com/settings/tokens/new${NC}"
    echo ""
    echo "2. Remplissez :"
    echo "   • Note : 'BagBot APK Build'"
    echo "   • Expiration : 30 days"
    echo "   • ✅ Cochez : 'repo'"
    echo ""
    echo "3. Générez le token et copiez-le"
    echo ""
    echo "4. Réessayez le push :"
    echo "   ${BLUE}git push -u origin main${NC}"
    echo ""
    echo "   Username : mel805"
    echo "   Password : [Votre token GitHub]"
    echo ""
fi
