const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'voler',
  dmPermission: true,
  data: new SlashCommandBuilder()
    .setName('voler')
    .setDescription("Voler de l'argent à quelqu'un")
    .addUserOption(option =>
      option.setName('cible')
        .setDescription('Personne à voler')
        .setRequired(true))
    .setDMPermission(true)
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]),
  
  async execute(interaction) {
    if (global.handleEconomyAction) {
      return global.handleEconomyAction(interaction, 'steal');
    } else {
      return interaction.reply({ 
        content: '❌ Système non disponible', 
        ephemeral: true 
      });
    }
  }
};
