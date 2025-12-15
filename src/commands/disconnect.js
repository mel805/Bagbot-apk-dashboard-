const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'disconnect',
  
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('🚪 Déconnecter le bot du salon vocal')
    .setDMPermission(false),
  
  dmPermission: false,
  description: 'Déconnecter le bot',
  
  async execute(interaction) {
    if (!global.musicManager) {
      return interaction.reply({ 
        content: '❌ Système musique non initialisé', 
        ephemeral: true 
      });
    }
    
    const queue = global.musicManager.getQueue(interaction.guild.id);
    
    if (!queue.connection) {
      return interaction.reply({ 
        content: '❌ Le bot n\'est pas connecté à un salon vocal', 
        ephemeral: true 
      });
    }
    
    // Arrêter la musique et déconnecter
    queue.tracks = [];
    queue.originalQueue = [];
    queue.current = null;
    queue.repeatMode = 'off';
    
    if (queue.player) {
      queue.player.stop();
    }
    
    if (queue.connection) {
      queue.connection.destroy();
      queue.connection = null;
    }
    
    if (queue.playerMessage) {
      try {
        await queue.playerMessage.delete();
      } catch (e) {}
      queue.playerMessage = null;
    }
    
    await interaction.reply({ 
      content: '🚪 **Bot déconnecté !**', 
      ephemeral: true 
    });
  }
};
