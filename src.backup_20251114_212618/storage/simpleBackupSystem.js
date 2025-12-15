/**
 * NOUVEAU SYSTÈME DE BACKUP - Simple et Fiable
 * Sauvegarde SANS structure metadata imbriquée
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

class SimpleBackupSystem {
  constructor() {
    this.backupDir = '/var/data/backups';
    this.configPath = '/home/bagbot/Bag-bot/data/config.json';
  }

  /**
   * Créer une sauvegarde locale simple
   */
  async createLocalBackup() {
    try {
      // Lire le config actuel
      const configData = JSON.parse(await fsp.readFile(this.configPath, 'utf8'));
      
      // Vérifier que c'est la bonne structure
      if (!configData.guilds) {
        console.error('[SimpleBackup] ERREUR: Structure invalide, pas de guilds');
        return { success: false, error: 'Structure invalide' };
      }
      
      // Créer le nom de fichier
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-local-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);
      
      // S'assurer que le dossier existe
      await fsp.mkdir(this.backupDir, { recursive: true });
      
      // Sauvegarder DIRECTEMENT sans metadata
      await fsp.writeFile(filepath, JSON.stringify(configData, null, 2), 'utf8');
      
      const stats = await fsp.stat(filepath);
      const guildCount = Object.keys(configData.guilds).length;
      
      console.log(`[SimpleBackup] ✅ Sauvegarde locale: ${filename}`);
      console.log(`[SimpleBackup]    Taille: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`[SimpleBackup]    Serveurs: ${guildCount}`);
      
      return {
        success: true,
        filename,
        filepath,
        size: stats.size,
        guildCount
      };
      
    } catch (error) {
      console.error('[SimpleBackup] Erreur sauvegarde locale:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer une sauvegarde persistante sur Freebox (avec metadata minimal)
   */
  async createFreeboxBackup() {
    try {
      const configData = JSON.parse(await fsp.readFile(this.configPath, 'utf8'));
      
      if (!configData.guilds) {
        return { success: false, error: 'Structure invalide' };
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-freebox-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);
      
      await fsp.mkdir(this.backupDir, { recursive: true });
      
      // Metadata minimal SEPARÉ
      const backup = {
        _backup_info: {
          created_at: new Date().toISOString(),
          type: 'freebox_persistent',
          guilds: Object.keys(configData.guilds).length,
          size: JSON.stringify(configData).length
        },
        guilds: configData.guilds
      };
      
      await fsp.writeFile(filepath, JSON.stringify(backup, null, 2), 'utf8');
      
      const stats = await fsp.stat(filepath);
      
      console.log(`[SimpleBackup] ✅ Sauvegarde Freebox: ${filename}`);
      console.log(`[SimpleBackup]    Taille: ${(stats.size / 1024).toFixed(2)} KB`);
      
      return {
        success: true,
        filename,
        filepath,
        size: stats.size
      };
      
    } catch (error) {
      console.error('[SimpleBackup] Erreur sauvegarde Freebox:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer les deux types de sauvegardes
   */
  async createBackups() {
    console.log('[SimpleBackup] === CRÉATION DES SAUVEGARDES ===');
    
    const results = {
      local: await this.createLocalBackup(),
      freebox: await this.createFreeboxBackup(),
      timestamp: new Date().toISOString()
    };
    
    // Nettoyer les vieilles sauvegardes (garder les 50 dernières)
    await this.cleanOldBackups(50);
    
    return results;
  }

  /**
   * Nettoyer les anciennes sauvegardes
   */
  async cleanOldBackups(keepCount = 50) {
    try {
      const files = await fsp.readdir(this.backupDir);
      const backupFiles = files
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.backupDir, f),
          stat: null
        }));
      
      // Récupérer les stats
      for (const file of backupFiles) {
        try {
          file.stat = await fsp.stat(file.path);
        } catch (_) {}
      }
      
      // Trier par date (plus récent d'abord)
      backupFiles.sort((a, b) => {
        if (!a.stat || !b.stat) return 0;
        return b.stat.mtime - a.stat.mtime;
      });
      
      // Supprimer les plus anciens
      if (backupFiles.length > keepCount) {
        const toDelete = backupFiles.slice(keepCount);
        console.log(`[SimpleBackup] Nettoyage: ${toDelete.length} anciennes sauvegardes`);
        
        for (const file of toDelete) {
          try {
            await fsp.unlink(file.path);
          } catch (_) {}
        }
      }
      
    } catch (error) {
      console.error('[SimpleBackup] Erreur nettoyage:', error.message);
    }
  }

  /**
   * Lister toutes les sauvegardes disponibles
   */
  async listBackups() {
    try {
      const files = await fsp.readdir(this.backupDir);
      const backups = [];
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filepath = path.join(this.backupDir, file);
        try {
          const stat = await fsp.stat(filepath);
          const type = file.startsWith('backup-local-') ? 'local'
            : file.startsWith('backup-freebox-') ? 'freebox'
            : file.startsWith('FULL-RESTORE-') ? 'restore'
            : 'other';
          
          backups.push({
            filename: file,
            filepath,
            type,
            size: stat.size,
            mtime: stat.mtime,
            date: new Date(stat.mtime).toLocaleString('fr-FR')
          });
        } catch (_) {}
      }
      
      return backups.sort((a, b) => b.mtime - a.mtime);
      
    } catch (error) {
      console.error('[SimpleBackup] Erreur listage:', error.message);
      return [];
    }
  }

  /**
   * Restaurer depuis une sauvegarde
   */
  async restoreFromBackup(filename) {
    try {
      const filepath = path.join(this.backupDir, filename);
      
      console.log(`[SimpleBackup] Restauration depuis: ${filename}`);
      
      const rawData = JSON.parse(await fsp.readFile(filepath, 'utf8'));
      
      // Extraction intelligente des données
      let cleanData = rawData;
      
      // Si structure avec _backup_info (notre nouveau format)
      if (rawData._backup_info && rawData.guilds) {
        console.log('[SimpleBackup] Format backup-freebox détecté');
        cleanData = { guilds: rawData.guilds };
      }
      // Si structure directe
      else if (rawData.guilds) {
        console.log('[SimpleBackup] Format direct détecté');
        cleanData = rawData;
      }
      // Si structure imbriquée (ancien format)
      else if (rawData.data) {
        console.log('[SimpleBackup] Format imbriqué détecté, extraction...');
        let current = rawData.data;
        let depth = 0;
        
        while (current.data && !current.guilds && depth < 10) {
          current = current.data;
          depth++;
        }
        
        if (current.guilds) {
          cleanData = current;
          console.log(`[SimpleBackup] Données extraites à profondeur ${depth}`);
        } else {
          throw new Error('Structure invalide: guilds non trouvé');
        }
      }
      
      if (!cleanData.guilds) {
        throw new Error('Pas de données guilds trouvées');
      }
      
      // Sauvegarde de sécurité
      const safetyFile = `pre-restore-${Date.now()}.json`;
      const safetyPath = path.join(this.backupDir, safetyFile);
      
      if (fs.existsSync(this.configPath)) {
        const current = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        const currentClean = current.guilds ? current : { guilds: {} };
        await fsp.writeFile(safetyPath, JSON.stringify(currentClean, null, 2), 'utf8');
        console.log(`[SimpleBackup] Sauvegarde de sécurité: ${safetyFile}`);
      }
      
      // Restaurer avec structure PROPRE
      await fsp.writeFile(this.configPath, JSON.stringify(cleanData, null, 2), 'utf8');
      
      const guildCount = Object.keys(cleanData.guilds).length;
      let userCount = 0;
      
      for (const guildId in cleanData.guilds) {
        const guild = cleanData.guilds[guildId];
        if (guild.economy?.balances) {
          userCount += Object.keys(guild.economy.balances).length;
        }
      }
      
      console.log(`[SimpleBackup] ✅ Restauration réussie`);
      console.log(`[SimpleBackup]    Serveurs: ${guildCount}`);
      console.log(`[SimpleBackup]    Utilisateurs: ${userCount}`);
      
      return {
        success: true,
        guildCount,
        userCount,
        safetyFile
      };
      
    } catch (error) {
      console.error('[SimpleBackup] Erreur restauration:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SimpleBackupSystem;
