const { SlashCommandBuilder } = require('discord.js');
/**
 * Commande: couleur
 * Description: Changer la couleur de votre pseudo
 * Note: Logique complexe avec gestion des rôles
 * 
 * ⚠️ Cette commande est un wrapper - la logique reste dans bot.js pour l'instant
 * TODO: Extraire complètement la logique dans ce fichier
 */

module.exports = {
  name: 'couleur',

  data: new SlashCommandBuilder()
    .setName('couleur')
    .setDescription('Commande couleur')
    .setDMPermission(false),

  description: "Changer la couleur de votre pseudo",
  
  async execute(interaction) {
    // Cette commande est encore gérée par bot.js
    // Le handler la passera automatiquement à bot.js si non gérée ici
    console.log('[couleur] Commande reçue - renvoyée à bot.js pour traitement');
    return false; // Indique au handler de passer au fallback (bot.js)
  }
};
