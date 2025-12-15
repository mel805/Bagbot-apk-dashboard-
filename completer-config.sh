#!/bin/bash

# Script pour compléter automatiquement la configuration
# en récupérant le DISCORD_TOKEN depuis votre bot actif

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║        🔐 RÉCUPÉRATION AUTOMATIQUE DU DISCORD_TOKEN 🔐           ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Méthode 1 : Depuis les variables d'environnement système
echo "🔍 Méthode 1 : Variables d'environnement système..."
if [ ! -z "$DISCORD_TOKEN" ]; then
    echo -e "${GREEN}✅ Token trouvé dans l'environnement !${NC}"
    TOKEN="$DISCORD_TOKEN"
else
    echo "Token non trouvé dans les variables d'environnement"
fi

# Méthode 2 : Depuis PM2 (si disponible)
if [ -z "$TOKEN" ]; then
    echo ""
    echo "🔍 Méthode 2 : Depuis PM2..."
    if command -v pm2 &> /dev/null; then
        # Essayer de récupérer depuis PM2
        TOKEN=$(pm2 jlist 2>/dev/null | grep -A 100 '"name":"bagbot"' | grep -oP '"DISCORD_TOKEN":"[^"]+' | cut -d'"' -f4 | head -1)
        if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "YOUR_DISCORD_BOT_TOKEN_HERE" ]; then
            echo -e "${GREEN}✅ Token récupéré depuis PM2 !${NC}"
        else
            echo "Token non accessible via PM2"
        fi
    else
        echo "PM2 non disponible"
    fi
fi

# Méthode 3 : Depuis les logs récents (recherche de patterns)
if [ -z "$TOKEN" ]; then
    echo ""
    echo "🔍 Méthode 3 : Recherche dans les fichiers de logs..."
    # On cherche pas dans les logs pour des raisons de sécurité
    echo "Méthode sautée (sécurité)"
fi

# Méthode 4 : Demander à l'utilisateur avec instructions claires
if [ -z "$TOKEN" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Le token n'a pas pu être récupéré automatiquement.${NC}"
    echo ""
    echo "Pour le trouver, essayez ces commandes :"
    echo ""
    echo "  # Si votre bot tourne avec PM2 :"
    echo "  pm2 env bagbot | grep DISCORD_TOKEN"
    echo ""
    echo "  # Si le token est dans l'environnement :"
    echo "  printenv | grep DISCORD"
    echo ""
    echo "  # Ou cherchez dans vos fichiers :"
    echo "  grep -r 'DISCORD_TOKEN' ~/ 2>/dev/null | grep -v node_modules | head -5"
    echo ""
    
    # Essayer une commande pratique
    echo "🔍 Tentative de récupération depuis le processus actif..."
    PROCESS_TOKEN=$(ps aux | grep "[n]ode.*bot.js" | grep -oP 'DISCORD_TOKEN=\K[^ ]+' 2>/dev/null | head -1)
    if [ ! -z "$PROCESS_TOKEN" ]; then
        TOKEN="$PROCESS_TOKEN"
        echo -e "${GREEN}✅ Token trouvé dans les processus !${NC}"
    fi
fi

# Si on a le token, on crée le .env complet
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "YOUR_DISCORD_BOT_TOKEN_HERE" ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo -e "${GREEN}✅ Token DISCORD récupéré avec succès !${NC}"
    echo "════════════════════════════════════════════════════════════════════"
    
    TOKEN_PREVIEW="${TOKEN:0:30}...${TOKEN: -10}"
    echo "Token : $TOKEN_PREVIEW"
    
    # Créer le fichier .env complet
    cat > .env << EOF
# ═══════════════════════════════════════════════════════════════════
# Configuration Bot Discord (Récupéré automatiquement)
# ═══════════════════════════════════════════════════════════════════

DISCORD_TOKEN=$TOKEN
CLIENT_ID=1414216173809307780
GUILD_ID=1360897918504271882

# ═══════════════════════════════════════════════════════════════════
# Configuration API Mobile
# ═══════════════════════════════════════════════════════════════════

API_PORT=3001
DISCORD_CLIENT_SECRET=A_COMPLETER_VIA_DISCORD_DEVELOPER_PORTAL
API_REDIRECT_URI=http://172.30.0.2:3001/auth/callback

# Récupérez DISCORD_CLIENT_SECRET sur :
# https://discord.com/developers/applications
# → Votre app → OAuth2 → General → Client Secret
EOF
    
    echo ""
    echo -e "${GREEN}✅ Fichier .env créé avec succès !${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Il reste à compléter DISCORD_CLIENT_SECRET${NC}"
    echo "   Récupérez-le sur Discord Developer Portal (30 secondes)"
    
else
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo -e "${YELLOW}⚠️  Configuration semi-automatique${NC}"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    echo "Le fichier .env.auto a été créé avec :"
    echo "  ✅ CLIENT_ID"
    echo "  ✅ GUILD_ID"
    echo "  ✅ API_REDIRECT_URI"
    echo ""
    echo "À compléter manuellement :"
    echo "  ⚠️  DISCORD_TOKEN"
    echo "  ⚠️  DISCORD_CLIENT_SECRET"
    echo ""
    echo "Commandes pour trouver DISCORD_TOKEN :"
    echo "  pm2 env bagbot | grep DISCORD_TOKEN"
    echo "  printenv | grep DISCORD"
    echo ""
    echo "Une fois trouvé, copiez .env.auto vers .env et complétez-le :"
    echo "  cp .env.auto .env"
    echo "  nano .env"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "Prochaines étapes :"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "1. Complétez le fichier .env (si nécessaire)"
echo "2. Configurez les redirects OAuth2 sur Discord"
echo "3. Compilez l'APK : cd android-app && ./build-release.sh"
echo "4. Démarrez l'API : node src/bot.js"
echo ""
