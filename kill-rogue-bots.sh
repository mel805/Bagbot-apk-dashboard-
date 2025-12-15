#!/bin/bash
# Script qui tue les bots orphelins (pas gérés par PM2)

# Récupérer le PID du bot géré par PM2
PM2_PID=$(pm2 jlist 2>/dev/null | grep -o '"pid":[0-9]*' | head -1 | cut -d: -f2)

if [ -z "$PM2_PID" ]; then
  echo "Aucun bot PM2"
  exit 0
fi

# Trouver tous les processus bot.js
ps aux | grep "[b]ot.js" | awk '{print $2}' | while read pid; do
  if [ "$pid" != "$PM2_PID" ]; then
    echo "Tué processus orphelin: $pid"
    kill -9 $pid 2>/dev/null
  fi
done

echo "✅ Nettoyage terminé"
