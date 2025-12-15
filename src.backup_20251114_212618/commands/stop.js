const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'stop',
  
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('⏹️ Arrêter la musique et vider la file')
    .setDMPermission(false),
  
  dmPermission: false,
  description: 'Arrêter la musique',
  
  async execute(interaction) {
    if (!global.musicManager) {
      return interaction.reply({ 
        content: '❌ Système musique non initialisé', 
        ephemeral: true 
      });
    }
    
    await global.musicManager.stop(interaction);
  }
};
