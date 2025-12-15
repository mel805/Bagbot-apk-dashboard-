const { SlashCommandBuilder } = require('discord.js');
/**
 * Commande /restore - Restaurer une sauvegarde (admin uniquement)
 */

const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const showRestoreMenu = require('../helpers/showRestoreMenu');

module.exports = {
  name: 'restore',

  data: new SlashCommandBuilder()
    .setName('restore')
    .setDescription('Commande restore')
    .setDMPermission(false),

  description: 'Commande restore',
  
  async execute(interaction) {
    // Vérifier les permissions admin
    const isAdmin = interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)
      || interaction.member?.permissions?.has?.(PermissionsBitField.Flags.Administrator);
    
    if (!isAdmin) {
      return interaction.reply({ content: '⛔ Réservé aux administrateurs.', ephemeral: true });
    }
    
    try {
      await showRestoreMenu(interaction);
    } catch (e) {
      console.error('[Restore] Error showing menu:', e);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: '❌ Erreur restauration.' });
        } else {
          await interaction.reply({ content: '❌ Erreur restauration.', ephemeral: true });
        }
      } catch (_) {}
    }
  },
  
  /**
   * Handler pour les interactions du menu de restauration
   */
  async handleInteraction(interaction) {
    // Gestion de la pagination
    if (interaction.isButton() && interaction.customId.startsWith('restore_page_')) {
      try {
        const pageMatch = interaction.customId.match(/restore_page_(\d+)/);
        if (pageMatch) {
          const page = parseInt(pageMatch[1], 10);
          await interaction.deferUpdate();
          await showRestoreMenu(interaction, page);
          return true; // Interaction gérée
        }
      } catch (e) {
        console.error('[Restore] Pagination error:', e);
        try {
          await interaction.reply({ content: '❌ Erreur de pagination.', ephemeral: true });
        } catch (_) {}
        return true; // On a essayé de gérer l'interaction
      }
    }
    
    // Menu de sélection de fichier
    if (interaction.isStringSelectMenu() && interaction.customId === 'restore_file_select') {
      try {
        await interaction.deferUpdate();
        const selectedValue = interaction.values[0];
        const guildId = interaction.guild?.id;
        
        // Récupérer le backup depuis le mapping global
        const backupMapping = global.__restoreBackupMapping || {};
        let backup = backupMapping[selectedValue];
        
        // Si pas de mapping, essayer de trouver par filename (fallback)
        if (!backup) {
          const listLocalBackups = require('../helpers/listLocalBackups');
          const backups = await listLocalBackups(guildId);
          backup = backups.find(b => b.filename === selectedValue || `bkp_${backups.indexOf(b)}_` === selectedValue.split('_').slice(0, 2).join('_'));
        }
        
        if (!backup) {
          await interaction.followUp({ content: '❌ Sauvegarde introuvable.', ephemeral: true });
          return true;
        }
        
        // Utiliser la nouvelle fonction de restauration par serveur
        const { restoreFromBackupFile } = require('../storage/jsonStore');
        const result = await restoreFromBackupFile(backup.filename, guildId);
        
        if (!result || !result.ok) {
          await interaction.followUp({ 
            content: `❌ Erreur lors de la restauration: ${result?.error || 'Échec inconnu'}`, 
            ephemeral: true 
          });
          return true;
        }
        
        // Log de restauration
        if (global.sendDetailedRestoreLog) {
          try {
            await global.sendDetailedRestoreLog(
              interaction.guild,
              {
                filename: backup.filename,
                type: backup.type,
                size: backup.size,
                guildId: guildId,
                partial: result.partial
              },
              'manual',
              interaction.user
            );
          } catch (_) {}
        }
        
        // Réponse
        const typeLabels = {
          'manual': '👤 Manuel',
          'auto': '🤖 Automatique',
          'safety': '🛡️ Sécurité'
        };
        const typeLabel = typeLabels[backup.type] || backup.type;
        const guildName = interaction.guild?.name || 'ce serveur';
        
        const successMsg = result.partial 
          ? `✅ Restauration partielle terminée !\n\n**Serveur**: ${guildName}\n**Fichier**: ${backup.filename}\n**Type**: ${typeLabel}\n\n🔒 Seules les données de votre serveur ont été restaurées.`
          : `✅ Restauration globale terminée !\n\n**Fichier**: ${backup.filename}\n**Type**: ${typeLabel}\n\n⚠️ Tous les serveurs ont été restaurés.`;
        
        await interaction.editReply({ 
          content: successMsg,
          embeds: [], 
          components: [] 
        });
        
        return true; // Interaction gérée avec succès
        
      } catch (e) {
        console.error('[Restore] Error during restore:', e);
        try {
          await interaction.followUp({ 
            content: `❌ Erreur lors de la restauration: ${e.message}`, 
            ephemeral: true 
          });
        } catch (_) {}
        return true; // On a essayé de gérer l'interaction
      }
    }
    
    return false; // Cette interaction ne nous concerne pas
  }
};
