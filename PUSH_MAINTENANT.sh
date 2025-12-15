#!/bin/bash

# Script pour pousser le code avec votre token GitHub

clear

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║           🚀 PUSH DU CODE ET BUILD DE L'APK 🚀                   ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "📍 Dépôt : ${BLUE}https://github.com/mel805/Bagbot-apk-dashboard-${NC}"
echo ""

# Vérifier qu'on est sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Passage sur la branche main...${NC}"
    git checkout main 2>/dev/null || git checkout -b main
fi

echo "════════════════════════════════════════════════════════════════════"
echo "         🔑 AUTHENTIFICATION GITHUB REQUISE"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "Pour pousser le code, vous devez vous authentifier avec GitHub."
echo ""
echo "Deux options :"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  OPTION 1 : GitHub CLI (gh) - RECOMMANDÉ ✅"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Si 'gh' est installé, lancez simplement :"
echo ""
echo "  ${BLUE}gh auth login${NC}"
echo ""
echo "Puis :"
echo ""
echo "  ${BLUE}git push -u origin main${NC}"
echo ""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  OPTION 2 : Token Personnel (Classic)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Créez un token ici :"
echo "   ${BLUE}https://github.com/settings/tokens/new${NC}"
echo ""
echo "2. Configuration du token :"
echo "   • Note : ${GREEN}BagBot APK Build${NC}"
echo "   • Expiration : ${GREEN}30 days${NC} (ou plus)"
echo "   • Permissions : ✅ ${GREEN}repo${NC} (cochez toute la section)"
echo ""
echo "3. Cliquez sur ${GREEN}Generate token${NC}"
echo ""
echo "4. ${YELLOW}COPIEZ LE TOKEN${NC} (affiché une seule fois !)"
echo ""
echo "5. Lancez la commande de push :"
echo ""
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "6. Quand demandé :"
echo "   • Username: ${GREEN}mel805${NC}"
echo "   • Password: ${YELLOW}[Collez votre token GitHub]${NC}"
echo ""
echo "════════════════════════════════════════════════════════════════════"
echo ""
read -p "Voulez-vous essayer de pousser maintenant ? (o/n) : " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo ""
    echo "🚀 Tentative de push..."
    echo ""
    
    if git push -u origin main 2>&1; then
        echo ""
        echo -e "${GREEN}✅✅✅ CODE POUSSÉ AVEC SUCCÈS ! ✅✅✅${NC}"
        echo ""
        echo "════════════════════════════════════════════════════════════════════"
        echo "         🎉 GITHUB ACTIONS EST EN TRAIN DE COMPILER ! 🎉"
        echo "════════════════════════════════════════════════════════════════════"
        echo ""
        echo "⏳ Attente du démarrage (15 secondes)..."
        sleep 15
        
        echo ""
        echo "📊 ${GREEN}BUILD EN COURS !${NC}"
        echo ""
        echo "Suivez la progression en direct :"
        echo "   ${BLUE}https://github.com/mel805/Bagbot-apk-dashboard-/actions${NC}"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  ⏱️  TIMELINE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "  Maintenant      : ✅ Code poussé"
        echo "  +30 secondes    : 🟡 Build démarre"
        echo "  +2 minutes      : 🟡 Setup Android SDK"
        echo "  +5 minutes      : 🟡 Compilation APK en cours"
        echo "  +8 minutes      : ✅ Upload APK"
        echo "  +10 minutes MAX : 🎉 APK PRÊT !"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # Vérifier le status du workflow avec gh si disponible
        if command -v gh &> /dev/null; then
            echo "🔍 Vérification du status du workflow..."
            echo ""
            sleep 5
            gh run list --limit 1 --repo mel805/Bagbot-apk-dashboard- 2>/dev/null || echo "Consultez la page Actions pour voir le status."
            echo ""
        fi
        
        echo "════════════════════════════════════════════════════════════════════"
        echo "         📥 TÉLÉCHARGER L'APK (dans ~10 minutes)"
        echo "════════════════════════════════════════════════════════════════════"
        echo ""
        echo "1. Allez sur : ${BLUE}https://github.com/mel805/Bagbot-apk-dashboard-/actions${NC}"
        echo ""
        echo "2. Cliquez sur le workflow tout en haut (le plus récent)"
        echo ""
        echo "3. ${YELLOW}Attendez que toutes les étapes soient ✅ vertes${NC}"
        echo ""
        echo "4. Scrollez vers le bas → Section ${GREEN}'Artifacts'${NC}"
        echo ""
        echo "5. Cliquez sur ${GREEN}'bagbot-manager-release'${NC}"
        echo ""
        echo "6. Un fichier ZIP se télécharge"
        echo ""
        echo "7. Décompressez → ${GREEN}app-release.apk${NC} 🎊"
        echo ""
        echo "════════════════════════════════════════════════════════════════════"
        echo ""
        echo -e "${GREEN}🎉 Tout est lancé !${NC} L'APK sera prêt dans ~10 minutes."
        echo ""
        echo "Surveillez : ${BLUE}https://github.com/mel805/Bagbot-apk-dashboard-/actions${NC}"
        echo ""
        
        # Proposer de surveiller automatiquement
        if command -v gh &> /dev/null; then
            echo ""
            read -p "Voulez-vous surveiller automatiquement le build ? (o/n) : " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Oo]$ ]]; then
                echo ""
                echo "🔔 Surveillance du build en cours..."
                echo "   (Ctrl+C pour arrêter)"
                echo ""
                
                gh run watch --repo mel805/Bagbot-apk-dashboard- 2>/dev/null || {
                    echo "Surveillance automatique non disponible."
                    echo "Consultez manuellement : https://github.com/mel805/Bagbot-apk-dashboard-/actions"
                }
            fi
        fi
        
    else
        echo ""
        echo -e "${RED}❌ Échec du push${NC}"
        echo ""
        echo "Vérifiez :"
        echo "  • Votre token GitHub est valide"
        echo "  • Le token a les permissions 'repo'"
        echo "  • Vous avez accès en écriture au dépôt"
        echo ""
        echo "Puis réessayez : ${BLUE}./PUSH_MAINTENANT.sh${NC}"
        echo ""
    fi
else
    echo ""
    echo "OK ! Quand vous êtes prêt, lancez :"
    echo ""
    echo "  ${BLUE}./PUSH_MAINTENANT.sh${NC}"
    echo ""
    echo "Ou directement :"
    echo ""
    echo "  ${BLUE}git push -u origin main${NC}"
    echo ""
fi
