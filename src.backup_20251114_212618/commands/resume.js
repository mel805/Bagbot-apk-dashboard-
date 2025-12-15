const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'resume',
  
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('▶️ Reprendre la musique')
    .setDMPermission(false),
  
  dmPermission: false,
  description: 'Reprendre la lecture',
  
  async execute(interaction) {
    if (!global.musicManager) {
      return interaction.reply({ 
        content: '❌ Système musique non initialisé', 
        ephemeral: true 
      });
    }
    
    await global.musicManager.resume(interaction);
  }
};
