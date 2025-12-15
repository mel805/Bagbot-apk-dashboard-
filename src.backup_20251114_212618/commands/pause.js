const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'pause',
  
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('⏸️ Mettre en pause la musique')
    .setDMPermission(false),
  
  dmPermission: false,
  description: 'Mettre en pause',
  
  async execute(interaction) {
    if (!global.musicManager) {
      return interaction.reply({ 
        content: '❌ Système musique non initialisé', 
        ephemeral: true 
      });
    }
    
    await global.musicManager.pause(interaction);
  }
};
