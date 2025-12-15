const { SlashCommandBuilder } = require('discord.js');
/**
 * Commande: boutique
 * Description: Afficher la boutique
 * Note: Logique complexe avec menus
 * 
 * ⚠️ Cette commande est un wrapper - la logique reste dans bot.js pour l'instant
 * TODO: Extraire complètement la logique dans ce fichier
 */

module.exports = {
  name: 'boutique',

  data: new SlashCommandBuilder()
    .setName('boutique')
    .setDescription('Commande boutique')
    .setDMPermission(false),

  description: "Afficher la boutique",
  
  async execute(interaction) {
    // Cette commande est encore gérée par bot.js
    // Le handler la passera automatiquement à bot.js si non gérée ici
    console.log('[boutique] Commande reçue - renvoyée à bot.js pour traitement');
    return false; // Indique au handler de passer au fallback (bot.js)
  }
};
