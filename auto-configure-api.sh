#!/bin/bash

# Script pour configurer automatiquement l'API mobile
# RÉCUPÈRE les tokens depuis votre configuration existante
# SANS TOUCHER au fonctionnement de votre bot

set -e

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║        🔧 AUTO-CONFIGURATION API MOBILE 🔧                        ║"
echo "║                                                                   ║"
echo "║         Récupération depuis votre bot existant                   ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }

echo "🔍 Analyse de votre configuration existante..."
echo ""

# === RÉCUPÉRATION DES TOKENS EXISTANTS ===

DISCORD_TOKEN=""
CLIENT_ID=""
GUILD_ID=""

# 1. Essayer de récupérer depuis les variables d'environnement
info "Recherche dans les variables d'environnement..."

if [ ! -z "$DISCORD_TOKEN" ]; then
    success "DISCORD_TOKEN trouvé dans l'environnement"
fi

# 2. Récupérer depuis ecosystem.config.js
if [ -f "ecosystem.config.js" ]; then
    info "Analyse de ecosystem.config.js..."
    
    # Extraire CLIENT_ID
    CLIENT_ID=$(grep -oP "CLIENT_ID:\s*['\"]?\K[0-9]+" ecosystem.config.js | head -1)
    if [ ! -z "$CLIENT_ID" ]; then
        success "CLIENT_ID trouvé : $CLIENT_ID"
    fi
    
    # Extraire GUILD_ID
    GUILD_ID=$(grep -oP "GUILD_ID:\s*['\"]?\K[0-9]+" ecosystem.config.js | head -1)
    if [ ! -z "$GUILD_ID" ]; then
        success "GUILD_ID trouvé : $GUILD_ID"
    fi
fi

# 3. Récupérer DISCORD_TOKEN depuis PM2 si le bot tourne
info "Recherche du bot actif avec PM2..."

if command -v pm2 &> /dev/null; then
    PM2_ENV=$(pm2 jlist 2>/dev/null | grep -A 50 '"name":"bagbot"' | grep -oP '"DISCORD_TOKEN":"[^"]+' | cut -d'"' -f4 | head -1)
    
    if [ ! -z "$PM2_ENV" ] && [ "$PM2_ENV" != "YOUR_DISCORD_BOT_TOKEN_HERE" ]; then
        DISCORD_TOKEN="$PM2_ENV"
        success "DISCORD_TOKEN récupéré depuis PM2"
    fi
fi

# 4. Si toujours pas de token, essayer depuis les logs récents
if [ -z "$DISCORD_TOKEN" ] && [ -f "/home/bagbot/.pm2/logs/bagbot-out.log" ]; then
    info "Recherche dans les logs PM2..."
    # Le token n'est généralement pas dans les logs, on ne peut pas le récupérer
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "                    📊 TOKENS RÉCUPÉRÉS"
echo "════════════════════════════════════════════════════════════════════"

if [ ! -z "$CLIENT_ID" ]; then
    success "CLIENT_ID : $CLIENT_ID"
else
    error "CLIENT_ID : Non trouvé"
fi

if [ ! -z "$GUILD_ID" ]; then
    success "GUILD_ID : $GUILD_ID"
else
    warning "GUILD_ID : Non trouvé (optionnel)"
fi

if [ ! -z "$DISCORD_TOKEN" ]; then
    TOKEN_PREVIEW="${DISCORD_TOKEN:0:20}...${DISCORD_TOKEN: -10}"
    success "DISCORD_TOKEN : $TOKEN_PREVIEW"
else
    warning "DISCORD_TOKEN : Non trouvé automatiquement"
    echo ""
    echo "Le DISCORD_TOKEN ne peut pas être récupéré automatiquement pour des"
    echo "raisons de sécurité. Vous devrez le fournir manuellement."
    echo ""
    echo -n "Voulez-vous entrer le DISCORD_TOKEN maintenant ? (o/N) : "
    read -r response
    
    if [[ "$response" =~ ^[Oo]$ ]]; then
        echo -n "DISCORD_TOKEN : "
        read -r DISCORD_TOKEN
        
        if [ ! -z "$DISCORD_TOKEN" ]; then
            success "Token saisi"
        fi
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "          🔐 CONFIGURATION DISCORD CLIENT SECRET"
echo "════════════════════════════════════════════════════════════════════"
echo ""

warning "DISCORD_CLIENT_SECRET est REQUIS pour l'application mobile"
echo ""
echo "Pour l'obtenir :"
echo "  1. Allez sur : https://discord.com/developers/applications"
echo "  2. Sélectionnez votre application (CLIENT_ID: $CLIENT_ID)"
echo "  3. OAuth2 → General"
echo "  4. Copiez le 'Client Secret'"
echo ""

DISCORD_CLIENT_SECRET=""

echo -n "Entrez votre DISCORD_CLIENT_SECRET : "
read -r DISCORD_CLIENT_SECRET

if [ -z "$DISCORD_CLIENT_SECRET" ]; then
    warning "Client Secret non fourni. Vous devrez le configurer plus tard."
else
    success "Client Secret saisi"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "              🌐 CONFIGURATION RÉSEAU"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Détecter l'IP locale
LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K[\d.]+' || hostname -I | awk '{print $1}')

if [ ! -z "$LOCAL_IP" ]; then
    info "IP locale détectée : $LOCAL_IP"
    DEFAULT_REDIRECT="http://${LOCAL_IP}:3001/auth/callback"
else
    DEFAULT_REDIRECT="http://192.168.1.100:3001/auth/callback"
fi

echo ""
echo "URL de redirection OAuth2 suggérée :"
echo "  $DEFAULT_REDIRECT"
echo ""
echo -n "Utiliser cette URL ? (O/n) : "
read -r use_default

if [[ "$use_default" =~ ^[Nn]$ ]]; then
    echo -n "Entrez l'URL de redirection : "
    read -r API_REDIRECT_URI
else
    API_REDIRECT_URI="$DEFAULT_REDIRECT"
fi

success "URL configurée : $API_REDIRECT_URI"

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "              💾 CRÉATION DU FICHIER .env"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Créer le fichier .env
cat > .env << EOF
# ═══════════════════════════════════════════════════════════════════
# Configuration Bot Discord (Récupéré automatiquement)
# ═══════════════════════════════════════════════════════════════════

DISCORD_TOKEN=${DISCORD_TOKEN}
CLIENT_ID=${CLIENT_ID}
GUILD_ID=${GUILD_ID}

# ═══════════════════════════════════════════════════════════════════
# Configuration API Mobile (Pour l'application Android)
# ═══════════════════════════════════════════════════════════════════

API_PORT=3001
DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
API_REDIRECT_URI=${API_REDIRECT_URI}

# ═══════════════════════════════════════════════════════════════════
# Notes :
# - Ce fichier a été généré automatiquement
# - Les tokens ont été récupérés depuis votre configuration existante
# - Votre bot actuel n'a PAS été modifié
# ═══════════════════════════════════════════════════════════════════
EOF

success "Fichier .env créé avec succès"

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "          ✅ CONFIGURATION TERMINÉE"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Vérifier que tout est configuré
MISSING=0

if [ -z "$DISCORD_TOKEN" ]; then
    error "DISCORD_TOKEN manquant"
    ((MISSING++))
else
    success "DISCORD_TOKEN configuré"
fi

if [ -z "$CLIENT_ID" ]; then
    error "CLIENT_ID manquant"
    ((MISSING++))
else
    success "CLIENT_ID configuré"
fi

if [ -z "$DISCORD_CLIENT_SECRET" ]; then
    warning "DISCORD_CLIENT_SECRET manquant (requis pour l'app mobile)"
    ((MISSING++))
else
    success "DISCORD_CLIENT_SECRET configuré"
fi

if [ -z "$API_REDIRECT_URI" ]; then
    error "API_REDIRECT_URI manquant"
    ((MISSING++))
else
    success "API_REDIRECT_URI configuré"
fi

echo ""

if [ $MISSING -gt 0 ]; then
    warning "$MISSING configuration(s) manquante(s)"
    echo ""
    echo "Éditez le fichier .env pour compléter :"
    echo "  nano .env"
else
    success "Toutes les configurations sont prêtes !"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "          📋 PROCHAINES ÉTAPES"
echo "════════════════════════════════════════════════════════════════════"
echo ""

echo "1. Configurez les redirects OAuth2 sur Discord :"
echo "   https://discord.com/developers/applications"
echo "   → Votre application → OAuth2 → Redirects"
echo "   → Ajoutez : $API_REDIRECT_URI"
echo "   → Ajoutez : bagbot://oauth"
echo ""

echo "2. Démarrez le bot avec l'API :"
echo "   node src/bot.js"
echo ""

echo "3. Testez l'API :"
echo "   curl http://localhost:3001/health"
echo ""

echo "4. Compilez l'application Android :"
echo "   cd android-app && ./build-release.sh"
echo ""

echo "════════════════════════════════════════════════════════════════════"
echo ""

info "Votre bot actuel n'a PAS été modifié"
info "Le fichier .env est uniquement pour l'API mobile"

echo ""
success "Configuration terminée ! 🎉"
echo ""
