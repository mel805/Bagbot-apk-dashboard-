#!/bin/bash
# Backup externe horaire avec protection
# Garde seulement 3 jours de backups (72 heures)

LOG_FILE="/home/bagbot/Bag-bot/logs/external-backup.log"
BACKUP_DIR="/var/data/backups/external-hourly"
CONFIG_FILE="/home/bagbot/Bag-bot/data/config.json"
MAX_BACKUPS=72  # 3 jours * 24 heures

# Créer le dossier de backup
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Fonction de log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔄 Démarrage backup externe horaire..."

# Vérifier que le config existe
if [ ! -f "$CONFIG_FILE" ]; then
    log "❌ ERREUR: config.json introuvable à $CONFIG_FILE"
    exit 1
fi

# Vérifier la taille du fichier (doit être > 100KB)
CONFIG_SIZE=$(stat -c%s "$CONFIG_FILE" 2>/dev/null || echo "0")
if [ "$CONFIG_SIZE" -lt 100000 ]; then
    log "⚠️  ALERTE: config.json trop petit (${CONFIG_SIZE} bytes)"
    log "⚠️  Backup annulé pour éviter de sauvegarder un fichier corrompu"
    exit 1
fi

# Créer le nom du backup avec timestamp
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')
BACKUP_FILE="$BACKUP_DIR/config-external-$TIMESTAMP.json"

# Copier le fichier
cp "$CONFIG_FILE" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null)
    log "✅ Backup créé: $BACKUP_FILE (${BACKUP_SIZE} bytes)"
    
    # Nettoyer les anciens backups (garder les $MAX_BACKUPS derniers)
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/config-external-*.json 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
        TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
        log "🗑️  Nettoyage: suppression de $TO_DELETE anciens backups"
        ls -1t "$BACKUP_DIR"/config-external-*.json | tail -n "$TO_DELETE" | xargs rm -f
    fi
    
    # Nettoyer les vieux .tar.gz du dossier principal (plus de 3 jours)
    find /home/bagbot/Bag-bot -maxdepth 1 -name "*.tar.gz" -mtime +3 -exec rm -f {} \; 2>/dev/null
    
    log "✅ Backup terminé avec succès ($BACKUP_COUNT backups conservés sur 3 jours)"
else
    log "❌ ERREUR: échec de la copie"
    exit 1
fi
