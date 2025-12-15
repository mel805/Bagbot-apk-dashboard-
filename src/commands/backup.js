const { SlashCommandBuilder } = require('discord.js');
/**
 * Commande: backup
 * Description: Créer une sauvegarde (admin)
 * Note: Logique complexe à garder dans bot.js
 * 
 * ⚠️ Cette commande est un wrapper - la logique reste dans bot.js pour l'instant
 * TODO: Extraire complètement la logique dans ce fichier
 */

module.exports = {
  name: 'backup',

  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('Commande backup')
    .setDMPermission(false),

  description: "Créer une sauvegarde (admin)",
  
  async execute(interaction) {
    // Cette commande est encore gérée par bot.js
    // Le handler la passera automatiquement à bot.js si non gérée ici
    console.log('[backup] Commande reçue - renvoyée à bot.js pour traitement');
    return false; // Indique au handler de passer au fallback (bot.js)
  }
};
