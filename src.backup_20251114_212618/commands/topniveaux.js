const { SlashCommandBuilder } = require('discord.js');
const{ getLevelsConfig, getGuildCategoryBanners } = require('../storage/jsonStore');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'topniveaux',

  data: new SlashCommandBuilder()
    .setName('topniveaux')
    .setDescription('Commande topniveaux')
    .setDMPermission(false),

  description: 'Classement des membres par niveau',
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const levelsConfig = await getLevelsConfig(interaction.guild.id);
      const users = levelsConfig.users || {};
      
      // Trier par niveau puis XP
      const sorted = Object.entries(users)
        .map(([userId, data]) => ({
          userId,
          level: data.level || 0,
          xp: data.xp || 0,
          messages: data.messages || 0
        }))
        .sort((a, b) => {
          if (b.level !== a.level) return b.level - a.level;
          return b.xp - a.xp;
        })
        .slice(0, 10);
      
      if (sorted.length === 0) {
        return interaction.editReply('❌ Aucun utilisateur avec niveau trouvé.');
      }
      
      let description = '';
      for (let i = 0; i < sorted.length; i++) {
        const rank = i + 1;
        const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `**${rank}.**`;
        const user = sorted[i];
        
        description += `${emoji} <@${user.userId}>\n`;
        description += `   📊 Niveau **${user.level}** • ${user.xp.toLocaleString()} XP • ${user.messages} messages\n\n`;
      }
      
      const embed = new EmbedBuilder()
        .setTitle('🏆 Top Niveaux')
        .setDescription(description)
        .setColor(0x5865F2)
        .setFooter({ text: 'Top 10 des membres par niveau' })
        .setTimestamp();
      
      const banners = await getGuildCategoryBanners(interaction.guild.id);
      if (banners.top_leaderboards) embed.setImage(banners.top_leaderboards);
      return interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('[topniveaux] Error:', error);
      return interaction.editReply('❌ Erreur lors de la récupération du classement.');
    }
  }
};

