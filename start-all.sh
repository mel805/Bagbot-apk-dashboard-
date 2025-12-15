#!/bin/bash
# Script de démarrage automatique au boot de la Freebox

LOG_FILE="/home/bagbot/Bag-bot/startup.log"

echo "[Mon Nov 10 07:07:40 PM UTC 2025] === DÉMARRAGE AUTOMATIQUE ===" >> $LOG_FILE

# Attendre que le réseau soit prêt
sleep 10

# Restaurer la meilleure sauvegarde si nécessaire
echo "[Mon Nov 10 07:07:40 PM UTC 2025] Vérification des sauvegardes..." >> $LOG_FILE
bash /home/bagbot/Bag-bot/auto-restore-best-backup.sh >> $LOG_FILE 2>&1

# Démarrer PM2 et les applications
echo "[Mon Nov 10 07:07:40 PM UTC 2025] Démarrage PM2..." >> $LOG_FILE
cd /home/bagbot/Bag-bot

# Vérifier si PM2 tourne déjà
pm2 ping > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "[Mon Nov 10 07:07:40 PM UTC 2025] PM2 n'est pas lancé, démarrage..." >> $LOG_FILE
fi

# Démarrer ou redémarrer les applications
pm2 resurrect >> $LOG_FILE 2>&1

# Si resurrect échoue, utiliser ecosystem.config.js
if [ $? -ne 0 ]; then
  echo "[Mon Nov 10 07:07:40 PM UTC 2025] Resurrect échoué, utilisation de ecosystem.config.js" >> $LOG_FILE
  pm2 start ecosystem.config.js >> $LOG_FILE 2>&1
fi

# Attendre 5 secondes
sleep 5

# Vérifier le statut
pm2 status >> $LOG_FILE 2>&1

echo "[Mon Nov 10 07:07:40 PM UTC 2025] ✅ Démarrage terminé" >> $LOG_FILE
exit 0
