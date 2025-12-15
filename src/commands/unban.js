const { SlashCommandBuilder } = require('discord.js');
const { isStaffMember, buildModEmbed } = require('../utils/modHelpers');
const { getLogsConfig } = require('../storage/jsonStore');

module.exports = {
  name: 'unban',

  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Commande unban')
    .setDMPermission(false),

  description: 'Commande unban',
  
  async execute(interaction) {
    const member = interaction.member;
    const ok = await isStaffMember(interaction.guild, member);
    if (!ok) return interaction.reply({ content: '⛔ Réservé au staff.', ephemeral: true });
    
    const userId = interaction.options.getString('userid', true);
    const reason = interaction.options.getString('raison') || '—';
    
    try { 
      await interaction.guild.members.unban(userId, reason); 
    } catch (e) { 
      return interaction.reply({ content: 'Échec du déban.', ephemeral: true }); 
    }
    
    const embed = buildModEmbed('Unban', `Utilisateur <@${userId}> débanni.`, [{ name:'Raison', value: reason }]);
    await interaction.reply({ embeds: [embed] });
    
    // Log moderation
    try {
      const cfg = await getLogsConfig(interaction.guild.id);
      const log = buildModEmbed(`${cfg.emoji} Modération • Unban`, `<@${userId}> débanni par ${interaction.user}`, [{ name:'Raison', value: reason }]);
      if (global.sendLog) await global.sendLog(interaction.guild, 'moderation', log);
    } catch (_) {}
  }
};