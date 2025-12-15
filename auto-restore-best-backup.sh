#!/bin/bash
# Script de restauration automatique de la meilleure sauvegarde au démarrage

BACKUP_DIR="/home/bagbot/Bag-bot/data/backups/guild-1360897918504271882"
CONFIG_FILE="/home/bagbot/Bag-bot/data/config.json"
LOG_FILE="/home/bagbot/Bag-bot/restore.log"

echo "[Mon Nov 10 07:06:50 PM UTC 2025] === RESTAURATION AUTOMATIQUE DÉMARRÉE ===" >> $LOG_FILE

# Vérifier si config.json est valide et non vide
CONFIG_SIZE=$(wc -c < "$CONFIG_FILE" 2>/dev/null || echo "0")
echo "[Mon Nov 10 07:06:50 PM UTC 2025] Taille config.json actuel: $CONFIG_SIZE octets" >> $LOG_FILE

# Si config.json est < 1000 octets (probablement corrompu), restaurer
if [ $CONFIG_SIZE -lt 1000 ]; then
  echo "[Mon Nov 10 07:06:50 PM UTC 2025] ⚠️ Config.json trop petit ($CONFIG_SIZE octets), restauration nécessaire" >> $LOG_FILE
  
  # Trouver la sauvegarde la plus récente avec le plus de données
  BEST_BACKUP=$(find "$BACKUP_DIR" -name "config-*.json" -type f -exec stat -c '%s %n' {} \; | sort -rn | head -1 | awk '{print $2}')
  
  if [ -z "$BEST_BACKUP" ]; then
    echo "[Mon Nov 10 07:06:50 PM UTC 2025] ❌ Aucune sauvegarde trouvée !" >> $LOG_FILE
    exit 1
  fi
  
  BACKUP_SIZE=$(wc -c < "$BEST_BACKUP")
  echo "[Mon Nov 10 07:06:50 PM UTC 2025] Meilleure sauvegarde trouvée: $BEST_BACKUP ($BACKUP_SIZE octets)" >> $LOG_FILE
  
  # Créer une sauvegarde de sécurité du fichier actuel
  cp "$CONFIG_FILE" "$CONFIG_FILE.before-auto-restore-$(date +%Y%m%d_%H%M%S)" 2>/dev/null
  
  # Restaurer la meilleure sauvegarde
  cp "$BEST_BACKUP" "$CONFIG_FILE"
  
  if [ $? -eq 0 ]; then
    echo "[Mon Nov 10 07:06:50 PM UTC 2025] ✅ Restauration réussie depuis: $BEST_BACKUP" >> $LOG_FILE
    echo "[Mon Nov 10 07:06:50 PM UTC 2025] Nouvelle taille: $(wc -c < $CONFIG_FILE) octets" >> $LOG_FILE
  else
    echo "[Mon Nov 10 07:06:50 PM UTC 2025] ❌ Échec de la restauration" >> $LOG_FILE
    exit 1
  fi
else
  echo "[Mon Nov 10 07:06:50 PM UTC 2025] ✅ Config.json valide ($CONFIG_SIZE octets), pas de restauration nécessaire" >> $LOG_FILE
fi

echo "[Mon Nov 10 07:06:50 PM UTC 2025] === RESTAURATION TERMINÉE ===" >> $LOG_FILE
exit 0
