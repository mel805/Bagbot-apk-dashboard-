const { SlashCommandBuilder } = require("discord.js");
const { isStaffMember, buildModEmbed } = require("../utils/modHelpers");
const { addWarn, getWarns, getLogsConfig } = require("../storage/jsonStore");

module.exports = {
  name: "warn",

  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Donner un avertissement à un membre")
    .addUserOption(option =>
      option
        .setName("membre")
        .setDescription("Le membre à avertir")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("raison")
        .setDescription("Raison de l'avertissement")
        .setRequired(true)
    )
    .setDMPermission(false),

  description: "Donner un avertissement à un membre",
  
  async execute(interaction) {
    const member = interaction.member;
    const ok = await isStaffMember(interaction.guild, member);
    if (!ok) return interaction.reply({ content: "⛔ Réservé au staff.", ephemeral: true });
    
    const user = interaction.options.getUser("membre", true);
    const reason = interaction.options.getString("raison", true);
    
    try {
      await addWarn(interaction.guild.id, user.id, { by: interaction.user.id, reason });
      const list = await getWarns(interaction.guild.id, user.id);
      
      const embed = buildModEmbed("Warn", `${user} a reçu un avertissement.`, [
        { name:"Raison", value: reason }, 
        { name:"Total avertissements", value: String(list.length) }
      ]);
      await interaction.reply({ embeds: [embed] });
      
      // Log moderation
      try {
        const cfg = await getLogsConfig(interaction.guild.id);
        const log = buildModEmbed(`${cfg.emoji} Modération • Warn`, `${user} averti par ${interaction.user}`, [
          { name:"Raison", value: reason }, 
          { name:"Total", value: String(list.length) }
        ]);
        if (global.sendLog) await global.sendLog(interaction.guild, "moderation", log);
      } catch (_) {}
    } catch (_) {
      return interaction.reply({ content:"Échec du warn.", ephemeral:true });
    }
  }
};
