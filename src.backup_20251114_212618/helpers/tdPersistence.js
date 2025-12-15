/**
 * Système de persistance amélioré pour Truth/Dare
 * - Sauvegarde synchrone immédiate (pas de perte en cas de crash)
 * - Backup automatique avant chaque écriture
 * - Vérification d'intégrité
 * - Recovery en cas d'erreur
 */

const fs = require('fs');
const path = require('path');

class TruthDarePersistence {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.mainFile = path.join(dataDir, 'td-queues.json');
    this.backupDir = path.join(dataDir, 'backups');
    this.maxBackups = 10; // Garder les 10 dernières sauvegardes
    
    // Créer les dossiers si nécessaire
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Charger l'état avec vérification d'intégrité
   */
  load() {
    try {
      if (!fs.existsSync(this.mainFile)) {
        console.log('[TD Persist] Aucun fichier existant, initialisation vide');
        return { queues: {}, counters: {} };
      }

      const data = fs.readFileSync(this.mainFile, 'utf8');
      const state = JSON.parse(data);

      // Vérification d'intégrité
      if (!state || typeof state !== 'object') {
        throw new Error('Format invalide: pas un objet');
      }

      // Convertir ancien format si nécessaire
      let queues = state.queues || {};
      let counters = state.counters || {};

      // Si c'est l'ancien format (juste un objet de queues)
      if (!state.queues && !state.counters) {
        queues = state;
        counters = {};
      }

      console.log(`[TD Persist] ✅ État chargé: ${Object.keys(queues).length} queues, ${Object.keys(counters).length} compteurs`);
      
      return { queues, counters };

    } catch (error) {
      console.error('[TD Persist] ❌ Erreur chargement:', error.message);
      
      // Tentative de recovery depuis le dernier backup
      const recovered = this.recoverFromBackup();
      if (recovered) {
        console.log('[TD Persist] ✅ Recovery réussie depuis backup');
        return recovered;
      }

      console.log('[TD Persist] ⚠️  Initialisation vide après échec de recovery');
      return { queues: {}, counters: {} };
    }
  }

  /**
   * Sauvegarder l'état de manière SYNCHRONE et FIABLE
   */
  save(queues, counters) {
    try {
      const state = {
        queues: queues || {},
        counters: counters || {},
        timestamp: new Date().toISOString(),
        version: '2.0'
      };

      // 1. Créer un backup du fichier actuel AVANT d'écrire
      this.createBackup();

      // 2. Écrire de manière ATOMIQUE (écrire dans un fichier temporaire puis renommer)
      const tempFile = this.mainFile + '.tmp';
      fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf8');
      
      // 3. Renommer atomiquement (opération atomique sur la plupart des systèmes)
      fs.renameSync(tempFile, this.mainFile);

      // 4. Nettoyer les vieux backups
      this.cleanOldBackups();

      console.log(`[TD Persist] 💾 Sauvegarde OK: ${Object.keys(queues).length} queues, ${Object.keys(counters).length} compteurs`);
      
      return true;

    } catch (error) {
      console.error('[TD Persist] ❌ Erreur sauvegarde:', error.message);
      return false;
    }
  }

  /**
   * Créer un backup avec horodatage
   */
  createBackup() {
    try {
      if (!fs.existsSync(this.mainFile)) {
        return; // Rien à sauvegarder
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `td-queues-${timestamp}.json`);
      
      fs.copyFileSync(this.mainFile, backupFile);
      
    } catch (error) {
      console.error('[TD Persist] ⚠️  Erreur backup:', error.message);
    }
  }

  /**
   * Nettoyer les vieux backups (garder seulement les N derniers)
   */
  cleanOldBackups() {
    try {
      const backups = fs.readdirSync(this.backupDir)
        .filter(f => f.startsWith('td-queues-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Plus récent en premier

      // Supprimer les backups en trop
      if (backups.length > this.maxBackups) {
        backups.slice(this.maxBackups).forEach(backup => {
          try {
            fs.unlinkSync(backup.path);
            console.log(`[TD Persist] 🗑️  Backup supprimé: ${backup.name}`);
          } catch (e) {
            console.error(`[TD Persist] ⚠️  Erreur suppression ${backup.name}:`, e.message);
          }
        });
      }

    } catch (error) {
      console.error('[TD Persist] ⚠️  Erreur nettoyage backups:', error.message);
    }
  }

  /**
   * Récupérer depuis le dernier backup valide
   */
  recoverFromBackup() {
    try {
      const backups = fs.readdirSync(this.backupDir)
        .filter(f => f.startsWith('td-queues-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Plus récent en premier

      // Essayer chaque backup jusqu'à en trouver un valide
      for (const backup of backups) {
        try {
          const data = fs.readFileSync(backup.path, 'utf8');
          const state = JSON.parse(data);
          
          if (state && typeof state === 'object') {
            console.log(`[TD Persist] ✅ Recovery depuis: ${backup.name}`);
            
            // Restaurer le fichier principal
            fs.copyFileSync(backup.path, this.mainFile);
            
            return {
              queues: state.queues || state,
              counters: state.counters || {}
            };
          }
        } catch (e) {
          console.log(`[TD Persist] ⚠️  Backup ${backup.name} invalide, essai suivant...`);
          continue;
        }
      }

      return null;

    } catch (error) {
      console.error('[TD Persist] ❌ Erreur recovery:', error.message);
      return null;
    }
  }

  /**
   * Obtenir des statistiques sur la persistance
   */
  getStats() {
    try {
      const stats = {
        mainFile: {
          exists: fs.existsSync(this.mainFile),
          size: fs.existsSync(this.mainFile) ? fs.statSync(this.mainFile).size : 0,
          modified: fs.existsSync(this.mainFile) ? fs.statSync(this.mainFile).mtime : null
        },
        backups: {
          count: 0,
          totalSize: 0
        }
      };

      if (fs.existsSync(this.backupDir)) {
        const backups = fs.readdirSync(this.backupDir)
          .filter(f => f.startsWith('td-queues-') && f.endsWith('.json'));
        
        stats.backups.count = backups.length;
        stats.backups.totalSize = backups.reduce((sum, f) => {
          return sum + fs.statSync(path.join(this.backupDir, f)).size;
        }, 0);
      }

      return stats;

    } catch (error) {
      console.error('[TD Persist] ❌ Erreur stats:', error.message);
      return null;
    }
  }
}

// Export singleton
module.exports = new TruthDarePersistence();
