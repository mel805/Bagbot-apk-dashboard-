#!/bin/bash

# Script pour surveiller le build GitHub Actions en temps réel

clear

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║         📊 SURVEILLANCE DU BUILD GITHUB ACTIONS 📊              ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REPO="mel805/Bagbot-apk-dashboard-"

echo "📍 Dépôt : ${BLUE}https://github.com/${REPO}${NC}"
echo ""

# Vérifier que gh CLI est installé
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) n'est pas installé${NC}"
    echo ""
    echo "Installez-le avec :"
    echo "   ${BLUE}brew install gh${NC}  (macOS)"
    echo "   ${BLUE}sudo apt install gh${NC}  (Ubuntu/Debian)"
    echo ""
    echo "Ou consultez manuellement :"
    echo "   ${BLUE}https://github.com/${REPO}/actions${NC}"
    echo ""
    exit 1
fi

echo "════════════════════════════════════════════════════════════════════"
echo "         🔍 RECHERCHE DU DERNIER BUILD"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Lister les workflows récents
echo "📋 Workflows récents :"
echo ""
gh run list --repo "$REPO" --limit 5 2>/dev/null || {
    echo -e "${RED}❌ Impossible de récupérer les workflows${NC}"
    echo ""
    echo "Raisons possibles :"
    echo "  • Pas encore de workflow lancé (pushez le code d'abord)"
    echo "  • Problème d'authentification GitHub CLI"
    echo ""
    echo "Consultez manuellement :"
    echo "   ${BLUE}https://github.com/${REPO}/actions${NC}"
    echo ""
    exit 1
}

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "         ⏱️  SURVEILLANCE EN TEMPS RÉEL"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "🔔 Surveillance du dernier workflow..."
echo "   (Ctrl+C pour arrêter)"
echo ""

# Surveiller le dernier workflow
gh run watch --repo "$REPO" 2>&1

# Vérifier le résultat
LAST_RUN_STATUS=$(gh run list --repo "$REPO" --limit 1 --json status --jq '.[0].status' 2>/dev/null)

echo ""
echo "════════════════════════════════════════════════════════════════════"

if [ "$LAST_RUN_STATUS" = "completed" ]; then
    CONCLUSION=$(gh run list --repo "$REPO" --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null)
    
    if [ "$CONCLUSION" = "success" ]; then
        echo -e "${GREEN}✅✅✅ BUILD RÉUSSI ! ✅✅✅${NC}"
        echo ""
        echo "════════════════════════════════════════════════════════════════════"
        echo "         📥 TÉLÉCHARGER L'APK MAINTENANT"
        echo "════════════════════════════════════════════════════════════════════"
        echo ""
        echo "1. Allez sur :"
        echo "   ${BLUE}https://github.com/${REPO}/actions${NC}"
        echo ""
        echo "2. Cliquez sur le workflow en haut"
        echo ""
        echo "3. Scrollez vers le bas → Section ${GREEN}'Artifacts'${NC}"
        echo ""
        echo "4. Cliquez sur ${GREEN}'bagbot-manager-release'${NC}"
        echo ""
        echo "5. Un fichier ZIP se télécharge"
        echo ""
        echo "6. Décompressez → ${GREEN}app-release.apk${NC} 🎉"
        echo ""
        echo "════════════════════════════════════════════════════════════════════"
        echo ""
        echo -e "${GREEN}🎊 Votre APK est prêt ! 🎊${NC}"
        echo ""
        
        # Essayer de récupérer le lien direct vers les artifacts
        RUN_ID=$(gh run list --repo "$REPO" --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null)
        if [ -n "$RUN_ID" ]; then
            echo "Lien direct vers le workflow :"
            echo "   ${BLUE}https://github.com/${REPO}/actions/runs/${RUN_ID}${NC}"
            echo ""
        fi
        
    else
        echo -e "${RED}❌ BUILD ÉCHOUÉ${NC}"
        echo ""
        echo "Consultez les logs pour voir l'erreur :"
        echo "   ${BLUE}https://github.com/${REPO}/actions${NC}"
        echo ""
        echo "Ou utilisez :"
        echo "   ${BLUE}gh run view --repo ${REPO} --log${NC}"
        echo ""
    fi
else
    echo -e "${YELLOW}🟡 Build toujours en cours...${NC}"
    echo ""
    echo "Continuez la surveillance sur :"
    echo "   ${BLUE}https://github.com/${REPO}/actions${NC}"
    echo ""
fi

echo "════════════════════════════════════════════════════════════════════"
