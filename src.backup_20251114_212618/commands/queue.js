const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'queue',
  
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('📜 Afficher la file d\'attente')
    .setDMPermission(false),
  
  dmPermission: false,
  description: 'File d\'attente',
  
  async execute(interaction) {
    if (!global.musicManager) {
      return interaction.reply({ 
        content: '❌ Système musique non initialisé', 
        ephemeral: true 
      });
    }
    
    await global.musicManager.queue(interaction);
  }
};
