const { SlashCommandBuilder } = require('discord.js');
const { getEconomyConfig, getGuildCategoryBanners } = require('../storage/jsonStore');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'topeconomie',

  data: new SlashCommandBuilder()
    .setName('topeconomie')
    .setDescription('Commande topeconomie')
    .setDMPermission(false),

  description: 'Classement des membres par argent avec karma',
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const ecoConfig = await getEconomyConfig(interaction.guild.id);
      const balances = ecoConfig.balances || {};
      const currency = ecoConfig.currency?.name || 'BAG$';
      
      // Trier par montant
      const sorted = Object.entries(balances)
        .map(([userId, data]) => ({
          userId,
          amount: data.amount || data.money || 0,
          charm: data.charm || 0,
          perversion: data.perversion || 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);
      
      if (sorted.length === 0) {
        return interaction.editReply('❌ Aucun utilisateur avec argent trouvé.');
      }
      
      let description = '';
      for (let i = 0; i < sorted.length; i++) {
        const rank = i + 1;
        const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `**${rank}.**`;
        const user = sorted[i];
        
        description += `${emoji} <@${user.userId}>\n`;
        description += `   💰 **${user.amount.toLocaleString()} ${currency}**\n`;
        description += `   🫦 Charme: ${user.charm} • 😈 Perversion: ${user.perversion}\n\n`;
      }
      
      const embed = new EmbedBuilder()
        .setTitle('🏆 Top Économie')
        .setDescription(description)
        .setColor(0xFEE75C)
        .setFooter({ text: 'Top 10 des membres par argent' })
        .setTimestamp();
      
      const banners = await getGuildCategoryBanners(interaction.guild.id);
      if (banners.top_leaderboards) embed.setImage(banners.top_leaderboards);
      return interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('[topeconomie] Error:', error);
      return interaction.editReply('❌ Erreur lors de la récupération du classement.');
    }
  }
};

