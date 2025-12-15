#!/bin/bash
# Protection automatique du config.json

CONFIG_PATH="/home/bagbot/Bag-bot/data/config.json"
BACKUP_DIR="/home/bagbot/Bag-bot/data/backups"

while true; do
    # Créer une sauvegarde toutes les 5 minutes
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    cp $CONFIG_PATH $BACKUP_DIR/config-auto-$TIMESTAMP.json 2>/dev/null
    
    # Garder seulement les 20 dernières sauvegardes auto
    ls -t $BACKUP_DIR/config-auto-*.json 2>/dev/null | tail -n +21 | xargs rm -f 2>/dev/null
    
    sleep 300  # 5 minutes
done
