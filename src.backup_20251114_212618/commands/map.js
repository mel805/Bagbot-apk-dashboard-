const { SlashCommandBuilder } = require('discord.js');
/**
 * Commande: map
 * Description: Afficher la carte des membres
 * Note: Logique complexe avec geocoding
 * 
 * ⚠️ Cette commande est un wrapper - la logique reste dans bot.js pour l'instant
 * TODO: Extraire complètement la logique dans ce fichier
 */

module.exports = {
  name: 'map',

  data: new SlashCommandBuilder()
    .setName('map')
    .setDescription('Enregistrer votre localisation sur la carte')
    .addStringOption(option =>
      option.setName('ville')
        .setDescription('Votre ville (ex: Paris, France)')
        .setRequired(true))
    .setDMPermission(false),

  description: "Afficher la carte des membres",
  
  async execute(interaction) {
    // Cette commande est encore gérée par bot.js
    // Le handler la passera automatiquement à bot.js si non gérée ici
    console.log('[map] Commande reçue - renvoyée à bot.js pour traitement');
    return false; // Indique au handler de passer au fallback (bot.js)
  }
};
