const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: "donner",

  data: new SlashCommandBuilder()
    .setName('donner')
    .setDescription('Donner de l\'argent à quelqu\'un')
    .addUserOption(option =>
      option.setName('cible')
        .setDescription('Membre à qui donner de l\'argent')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('montant')
        .setDescription('Montant à donner')
        .setRequired(true))
    .setDMPermission(true),

  description: "Donner de l'argent à quelqu'un",
  
  async execute(interaction) {
    if (global.handleEconomyAction) {
      return global.handleEconomyAction(interaction, 'give');
    } else {
      console.error('[donner] handleEconomyAction not available');
      return interaction.reply({ 
        content: '❌ Erreur: système d\'économie non initialisé', 
        ephemeral: true 
      });
    }
  }
};
