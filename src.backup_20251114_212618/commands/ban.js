const { SlashCommandBuilder } = require('discord.js');
const { isStaffMember, buildModEmbed } = require('../utils/modHelpers');
const { getLogsConfig } = require('../storage/jsonStore');

module.exports = {
  name: 'ban',

  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre du serveur')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Membre à bannir')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('raison')
        .setDescription('Raison du bannissement')
        .setRequired(false))
    .setDefaultMemberPermissions('0')
    .setDMPermission(false),

  description: 'Bannir un membre',
  
  async execute(interaction) {
    const member = interaction.member;
    const ok = await isStaffMember(interaction.guild, member);
    if (!ok) return interaction.reply({ content: '⛔ Réservé au staff.', ephemeral: true });
    
    const user = interaction.options.getUser('membre', true);
    const reason = interaction.options.getString('raison') || '—';
    
    try { 
      await interaction.guild.members.ban(user.id, { reason }); 
    } catch (e) { 
      return interaction.reply({ content: 'Échec du ban.', ephemeral: true }); 
    }
    
    const embed = buildModEmbed('Ban', `${user} a été banni.`, [{ name:'Raison', value: reason }]);
    await interaction.reply({ embeds: [embed] });
    
    // Log moderation
    try {
      const cfg = await getLogsConfig(interaction.guild.id);
      const log = buildModEmbed(`${cfg.emoji} Modération • Ban`, `${user} banni par ${interaction.user}`, [{ name:'Raison', value: reason }]);
      if (global.sendLog) await global.sendLog(interaction.guild, 'moderation', log);
    } catch (_) {}
  }
};
