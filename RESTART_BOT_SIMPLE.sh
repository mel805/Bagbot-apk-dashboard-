#!/bin/bash
# Script ultra-simple pour redémarrer le bot avec l'API

clear
echo "🔄 Redémarrage du bot avec l'API sur le port 33002..."
echo ""

# Installer les dépendances si nécessaire
if ! npm list cors >/dev/null 2>&1; then
    echo "📦 Installation de cors..."
    npm install cors --save
fi

if ! npm list axios >/dev/null 2>&1; then
    echo "📦 Installation d'axios..."
    npm install axios --save
fi

# Redémarrer avec PM2
if command -v pm2 >/dev/null 2>&1; then
    echo "🔄 Redémarrage avec PM2..."
    pm2 restart bag-discord-bot || pm2 start src/bot.js --name bag-discord-bot
    
    echo ""
    echo "⏳ Attente du démarrage (5 secondes)..."
    sleep 5
    
    echo ""
    echo "📋 Logs du bot :"
    pm2 logs bag-discord-bot --lines 20 --nostream | grep -i "API\|33002\|login" | tail -10
    
    echo ""
    echo "🧪 Test de l'API..."
    if curl -s http://localhost:33002/health >/dev/null 2>&1; then
        echo "✅✅✅ L'API FONCTIONNE ! ✅✅✅"
        echo ""
        curl -s http://localhost:33002/health
        echo ""
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🌐 MAINTENANT : OUVRIR LE PORT SUR LA FREEBOX"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "1. Ouvrir le firewall :"
        echo "   sudo ufw allow 33002"
        echo ""
        echo "2. Port forwarding Freebox :"
        echo "   http://mafreebox.freebox.fr"
        echo "   Port externe : 33002"
        echo "   Port interne : 33002"
        echo "   IP : IP de cette VM"
        echo ""
        echo "3. URL dans l'app :"
        echo "   http://88.174.155.230:33002"
        echo ""
    else
        echo "❌ L'API ne répond pas"
        echo ""
        echo "Vérifiez les logs :"
        echo "pm2 logs bag-discord-bot"
    fi
else
    echo "❌ PM2 n'est pas installé"
    echo ""
    echo "Démarrage direct avec Node.js..."
    node src/bot.js
fi
