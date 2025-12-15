#!/bin/bash
# Script de redémarrage sécurisé du bot après reset Discord

echo "⏰ Attente du reset Discord (06:58 UTC)..."
echo "Heure actuelle: $(date)"

# Attendre jusqu'à 07:00 pour être sûr que le reset est passé
TARGET_TIME="2025-10-26 07:00:00"
CURRENT_TIME=$(date +%s)
TARGET_TIMESTAMP=$(date -d "$TARGET_TIME" +%s)
WAIT_SECONDS=$(( TARGET_TIMESTAMP - CURRENT_TIME ))

if [ $WAIT_SECONDS -gt 0 ]; then
  echo "⏳ Attente de $WAIT_SECONDS secondes..."
  sleep $WAIT_SECONDS
fi

echo ""
echo "🔄 Reset Discord effectué, redémarrage du bot..."

# Arrêter proprement
pm2 stop bagbot 2>/dev/null
sleep 2

# Nettoyer les logs
pm2 flush bagbot

# Redémarrer avec max-restarts limité
pm2 delete bagbot 2>/dev/null
cd ~/Bag-bot
pm2 start src/bot.js --name bagbot --max-restarts 3 --min-uptime 30000

echo ""
echo "✅ Bot redémarré avec protection anti-loop"
pm2 logs bagbot --lines 30
