const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'skip',
  
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('⏭️ Passer à la musique suivante')
    .setDMPermission(false),
  
  dmPermission: false,
  description: 'Passer à la suivante',
  
  async execute(interaction) {
    if (!global.musicManager) {
      return interaction.reply({ 
        content: '❌ Système musique non initialisé', 
        ephemeral: true 
      });
    }
    
    await global.musicManager.skip(interaction);
  }
};
