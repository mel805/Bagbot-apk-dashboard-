const { SlashCommandBuilder } = require('discord.js');
/**
 * Commande /bot - Informations sur le bot
 */

module.exports = {
  name: 'bot',

  data: new SlashCommandBuilder()
    .setName('bot')
    .setDescription('Commande bot')
    .setDMPermission(false),

  description: 'Commande bot',
  
  async execute(interaction) {
    const { EmbedBuilder } = require('discord.js');
    
    const embed = new EmbedBuilder()
      .setColor(0x1e88e5)
      .setTitle('🤖 Bagbot - Informations')
      .setDescription('Bot Discord multi-fonctions pour Boy and Girls (BAG)')
      .addFields(
        { name: 'Version', value: '2.0.0', inline: true },
        { name: 'Serveurs', value: String(interaction.client.guilds.cache.size), inline: true },
        { name: 'Uptime', value: formatUptime(process.uptime()), inline: true },
        { name: 'Fonctionnalités', value: '• Économie & Karma\n• Niveaux & XP\n• Actions interactives\n• Modération\n• Sauvegardes', inline: false }
      )
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed] });
  }
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(days + 'd');
  if (hours > 0) parts.push(hours + 'h');
  if (minutes > 0) parts.push(minutes + 'm');
  
  return parts.join(' ') || '< 1m';
}
