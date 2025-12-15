#!/bin/bash
echo "⏰ Attente du reset Discord (06:58 UTC)..."
echo "Heure actuelle: $(date -u)"

# Attendre jusqu'à 07:00 UTC pour être sûr
sleep 540  # 9 minutes

echo ""
echo "🔄 Reset effectué, redémarrage du bot..."

# Redémarrer avec PM2
cd ~/Bag-bot
pm2 start ecosystem.config.js 2>/dev/null || pm2 restart bagbot

sleep 5

# Vérifier le statut
pm2 list
echo ""
echo "📊 Logs du bot:"
pm2 logs bagbot --lines 30 --nostream

