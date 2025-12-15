const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getEconomyConfig, getGuildCategoryBanners } = require("../storage/jsonStore");

const ITEMS_PER_PAGE = 10;

module.exports = {
  name: "topeconomie",
  data: new SlashCommandBuilder()
    .setName("topeconomie")
    .setDescription("Classement des membres par argent avec karma")
    .setDMPermission(false),
  description: "Classement des membres par argent avec karma",
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const ecoConfig = await getEconomyConfig(interaction.guild.id);
      const balances = ecoConfig.balances || {};
      const currency = ecoConfig.currency?.name || "BAG$";
      
      // Récupérer les membres actuels du serveur
      const currentMembers = await interaction.guild.members.fetch();
      const currentMemberIds = new Set(currentMembers.keys());
      
      // Trier par montant et filtrer les membres ayant quitté
      const sorted = Object.entries(balances)
        .filter(([userId]) => currentMemberIds.has(userId))
        .map(([userId, data]) => ({
          userId,
          amount: data.amount || data.money || 0,
          charm: data.charm || 0,
          perversion: data.perversion || 0
        }))
        .sort((a, b) => b.amount - a.amount);
      
      if (sorted.length === 0) {
        return interaction.editReply("❌ Aucun utilisateur avec argent trouvé.");
      }
      
      const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
      let currentPage = 0;
      
      const generateEmbed = async (page) => {
        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = sorted.slice(start, end);
        
        // Fetch les membres de cette page pour avoir les pseudos
        for (const item of pageItems) {
          try {
            await interaction.guild.members.fetch(item.userId);
          } catch (e) {}
        }
        
        let description = "";
        for (let i = 0; i < pageItems.length; i++) {
          const rank = start + i + 1;
          const emoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `**${rank}.**`;
          const user = pageItems[i];
          
          description += `${emoji} <@${user.userId}>\n`;
          description += `   💰 **${user.amount.toLocaleString()} ${currency}**\n`;
          description += `   🫦 Charme: ${user.charm} • 😈 Perversion: ${user.perversion}\n\n`;
        }
        
        const embed = new EmbedBuilder()
          .setTitle("🏆 Top Économie")
          .setDescription(description)
          .setColor(0xFEE75C)
          .setFooter({ text: `Page ${page + 1}/${totalPages} • ${sorted.length} membres total` })
          .setTimestamp();
        
        const banners = await getGuildCategoryBanners(interaction.guild.id);
        if (banners.top_leaderboards) embed.setImage(banners.top_leaderboards);
        
        return embed;
      };
      
      const generateButtons = (page) => {
        const row = new ActionRowBuilder();
        
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("top_eco_first")
            .setLabel("⏮️ Début")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("top_eco_prev")
            .setLabel("◀️ Précédent")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("top_eco_next")
            .setLabel("Suivant ▶️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages - 1),
          new ButtonBuilder()
            .setCustomId("top_eco_last")
            .setLabel("Fin ⏭️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1)
        );
        
        return row;
      };
      
      const embed = await generateEmbed(currentPage);
      const buttons = generateButtons(currentPage);
      
      const message = await interaction.editReply({
        embeds: [embed],
        components: totalPages > 1 ? [buttons] : []
      });
      
      if (totalPages <= 1) return;
      
      const collector = message.createMessageComponentCollector({
        time: 300000 // 5 minutes
      });
      
      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "❌ Ce n'est pas ton classement !", ephemeral: true });
        }
        
        if (i.customId === "top_eco_first") currentPage = 0;
        else if (i.customId === "top_eco_prev") currentPage = Math.max(0, currentPage - 1);
        else if (i.customId === "top_eco_next") currentPage = Math.min(totalPages - 1, currentPage + 1);
        else if (i.customId === "top_eco_last") currentPage = totalPages - 1;
        
        const newEmbed = await generateEmbed(currentPage);
        const newButtons = generateButtons(currentPage);
        
        await i.update({
          embeds: [newEmbed],
          components: [newButtons]
        });
      });
      
      collector.on("end", async () => {
        try {
          await message.edit({ components: [] });
        } catch (e) {}
      });
      
    } catch (error) {
      console.error("[topeconomie] Error:", error);
      return interaction.editReply("❌ Erreur lors de la récupération du classement.");
    }
  }
};
