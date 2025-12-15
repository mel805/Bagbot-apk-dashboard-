#!/bin/bash

# Script pour démarrer l'API REST sur le port 33002

clear

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║         🚀 DÉMARRAGE DE L'API REST (PORT 33002) 🚀              ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier qu'on est dans le bon dossier
if [ ! -f "src/bot.js" ]; then
    echo -e "${RED}❌ Erreur : Vous n'êtes pas dans le dossier /workspace${NC}"
    echo "Lancez : cd /workspace && ./DEMARRER_API.sh"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "         ÉTAPE 1 : CONFIGURATION DU PORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si le port est déjà configuré
if grep -q "API_PORT=33002" .env 2>/dev/null; then
    echo -e "${GREEN}✅ Le port 33002 est déjà configuré dans .env${NC}"
else
    echo -e "${YELLOW}⚙️  Configuration du port 33002 dans .env...${NC}"
    
    # Vérifier si .env existe
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Le fichier .env n'existe pas, création...${NC}"
        cp .env.example .env 2>/dev/null || touch .env
    fi
    
    # Retirer l'ancien port si présent
    sed -i '/^API_PORT=/d' .env 2>/dev/null
    
    # Ajouter le nouveau port
    echo "API_PORT=33002" >> .env
    
    echo -e "${GREEN}✅ Port 33002 ajouté à .env${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "         ÉTAPE 2 : RÉCUPÉRATION DU DERNIER CODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📥 Récupération des dernières modifications..."
git fetch origin main 2>&1 | grep -v "Already up to date" || echo "Fetch effectué"

echo "🔄 Mise à jour du code..."
if git pull origin main; then
    echo -e "${GREEN}✅ Code mis à jour${NC}"
else
    echo -e "${YELLOW}⚠️  Mise à jour impossible, continuons...${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "         ÉTAPE 3 : INSTALLATION DES DÉPENDANCES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si cors est installé
if ! npm list cors >/dev/null 2>&1; then
    echo "📦 Installation de 'cors' (requis pour l'API)..."
    npm install cors
    echo -e "${GREEN}✅ Dépendance 'cors' installée${NC}"
else
    echo -e "${GREEN}✅ Dépendance 'cors' déjà installée${NC}"
fi

# Vérifier si axios est installé
if ! npm list axios >/dev/null 2>&1; then
    echo "📦 Installation de 'axios' (requis pour l'API)..."
    npm install axios
    echo -e "${GREEN}✅ Dépendance 'axios' installée${NC}"
else
    echo -e "${GREEN}✅ Dépendance 'axios' déjà installée${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "         ÉTAPE 4 : REDÉMARRAGE DU BOT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔄 Redémarrage du bot avec PM2..."
pm2 restart bag-discord-bot

echo ""
echo "⏳ Attente du démarrage (5 secondes)..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "         ÉTAPE 5 : VÉRIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier les logs
echo "📋 Vérification des logs..."
pm2 logs bag-discord-bot --lines 50 --nostream | grep -i "API\|33002" | tail -10

echo ""
echo "🧪 Test de l'API..."
sleep 2

if curl -s http://localhost:33002/health >/dev/null 2>&1; then
    RESPONSE=$(curl -s http://localhost:33002/health)
    echo -e "${GREEN}✅✅✅ L'API FONCTIONNE ! ✅✅✅${NC}"
    echo ""
    echo "Réponse : $RESPONSE"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "         🌐 CONFIGURATION RÉSEAU"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Maintenant, vous devez :"
    echo ""
    echo "1. ${YELLOW}Ouvrir le port 33002 dans le firewall${NC} :"
    echo "   sudo ufw allow 33002"
    echo ""
    echo "2. ${YELLOW}Configurer le port forwarding sur votre Freebox${NC} :"
    echo "   - Port externe : 33002"
    echo "   - Port interne : 33002"
    echo "   - IP : IP de cette machine"
    echo "   - Protocole : TCP"
    echo ""
    echo "3. ${YELLOW}Tester depuis l'extérieur${NC} (navigateur, données mobiles) :"
    echo "   http://88.174.155.230:33002/health"
    echo ""
    echo "4. ${YELLOW}Configurer l'application Android${NC} :"
    echo "   http://88.174.155.230:33002"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${GREEN}🎉 API démarrée avec succès ! 🎉${NC}"
    echo ""
else
    echo -e "${RED}❌ L'API ne répond pas sur le port 33002${NC}"
    echo ""
    echo "Vérifications :"
    echo ""
    echo "1. Vérifier que le bot est bien démarré :"
    echo "   pm2 status"
    echo ""
    echo "2. Consulter les logs complets :"
    echo "   pm2 logs bag-discord-bot"
    echo ""
    echo "3. Vérifier le fichier .env :"
    echo "   cat .env | grep API_PORT"
    echo ""
    echo "4. Vérifier que le fichier src/api/server.js existe :"
    echo "   ls -la src/api/server.js"
    echo ""
fi
