const { SlashCommandBuilder } = require("discord.js");
const { isStaffMember, buildModEmbed } = require("../utils/modHelpers");
const { getLogsConfig } = require("../storage/jsonStore");

module.exports = {
  name: "unmute",

  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Rendre la parole à un membre muet")
    .addUserOption(option =>
      option
        .setName("membre")
        .setDescription("Le membre à unmute")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("raison")
        .setDescription("Raison du unmute")
        .setRequired(false)
    )
    .setDMPermission(false),

  description: "Rendre la parole à un membre muet",
  
  async execute(interaction) {
    const member = interaction.member;
    const ok = await isStaffMember(interaction.guild, member);
    if (!ok) return interaction.reply({ content: "⛔ Réservé au staff.", ephemeral: true });
    
    const user = interaction.options.getUser("membre", true);
    const reason = interaction.options.getString("raison") || "—";
    const m = await interaction.guild.members.fetch(user.id).catch(()=>null);
    
    if (!m) return interaction.reply({ content:"Membre introuvable.", ephemeral:true });
    
    try { 
      await m.timeout(null, reason); 
    } catch (e) { 
      return interaction.reply({ content:"Échec du unmute.", ephemeral:true }); 
    }
    
    const embed = buildModEmbed("Unmute", `${user} a retrouvé la parole.`, [{ name:"Raison", value: reason }]);
    await interaction.reply({ embeds: [embed] });
    
    // Log moderation
    try {
      const cfg = await getLogsConfig(interaction.guild.id);
      const log = buildModEmbed(`${cfg.emoji} Modération • Unmute`, `${user} unmute par ${interaction.user}`, [{ name:"Raison", value: reason }]);
      if (global.sendLog) await global.sendLog(interaction.guild, "moderation", log);
    } catch (_) {}
  }
};
