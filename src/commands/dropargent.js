const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getEconomyUser, setEconomyUser } = require("../storage/jsonStore");

module.exports = {
  name: "dropargent",
  
  data: new SlashCommandBuilder()
    .setName("dropargent")
    .setDescription("Créer un drop d argent pour le premier membre qui réagit")
    .addIntegerOption(option =>
      option.setName("montant")
        .setDescription("Montant d argent à gagner")
        .setRequired(true)
        .setMinValue(1))
    .addStringOption(option =>
      option.setName("message")
        .setDescription("Message personnalisé (optionnel)")
        .setRequired(false))
    .setDMPermission(false),
  
  description: "Drop d argent pour le premier qui réagit",
  
  async execute(interaction) {
    const hasManageGuild = interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);
    if (!hasManageGuild) {
      return interaction.reply({ 
        content: "⛔ Vous devez avoir la permission de gérer le serveur pour utiliser cette commande.", 
        ephemeral: true 
      });
    }

    const montant = interaction.options.getInteger("montant", true);
    const customMessage = interaction.options.getString("message", false);

    const embed = new EmbedBuilder()
      .setFooter({ text: "Boys and Girls - Soyez rapide, soyez audacieux" })
      .setTitle("💰 Trésor Disponible")
      .setDescription(customMessage || "**" + montant + "** 🪙 attendent celui ou celle qui osera les saisir en premier...")
      .setColor("#FFD700")
      .addFields(
        { name: "💵 Récompense", value: montant + " 🪙", inline: true },
        { name: "⚡ Statut", value: "Disponible", inline: true }
      )
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId("claim_money")
      .setLabel("💰 Réclamer la récompense")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder()
      .addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row] });
    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({ 
      time: 60000
    });

    let claimed = false;

    collector.on("collect", async (btnInteraction) => {
      if (claimed) {
        return btnInteraction.reply({ 
          content: "❌ Trop tard... Quelqu un d autre a été plus rapide que vous.", 
          ephemeral: true 
        });
      }

      if (btnInteraction.user.id === interaction.user.id) {
        return btnInteraction.reply({ 
          content: "❌ Vous ne pouvez pas réclamer votre propre trésor.", 
          ephemeral: true 
        });
      }

      claimed = true;

      const winner = btnInteraction.user;
      const userData = await getEconomyUser(interaction.guild.id, winner.id);
      userData.money = (userData.money || 0) + montant;
      await setEconomyUser(interaction.guild.id, winner.id, userData);

      const updatedEmbed = EmbedBuilder.from(embed)
        .setColor("#00FF00")
        .spliceFields(1, 1, { name: "⚡ Statut", value: "Réclamé par " + winner.toString(), inline: true });

      const disabledButton = ButtonBuilder.from(button)
        .setDisabled(true)
        .setLabel("✅ Trésor réclamé");

      const disabledRow = new ActionRowBuilder()
        .addComponents(disabledButton);

      await btnInteraction.update({ embeds: [updatedEmbed], components: [disabledRow] });
      
      await btnInteraction.followUp({ 
        content: "🎉 " + winner.toString() + " a su saisir sa chance et remporte **" + montant + "** 🪙", 
        ephemeral: false 
      });

      collector.stop();
    });

    collector.on("end", async (collected, reason) => {
      if (!claimed && reason === "time") {
        const expiredEmbed = EmbedBuilder.from(embed)
          .setColor("#808080")
          .spliceFields(1, 1, { name: "⚡ Statut", value: "Expiré", inline: true });

        const disabledButton = ButtonBuilder.from(button)
          .setDisabled(true)
          .setLabel("⏰ Trop tard");

        const disabledRow = new ActionRowBuilder()
          .addComponents(disabledButton);

        await message.edit({ embeds: [expiredEmbed], components: [disabledRow] }).catch(() => {});
      }
    });
  }
};
