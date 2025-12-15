const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isStaffMember, buildModEmbed } = require('../utils/modHelpers');
const { getLogsConfig } = require('../storage/jsonStore');

module.exports = {
  name: 'massban',

  data: new SlashCommandBuilder()
    .setName('massban')
    .setDescription('Bannir plusieurs membres en masse')
    .addStringOption(option =>
      option.setName('ids')
        .setDescription('IDs des membres à bannir (séparés par des espaces)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('raison')
        .setDescription('Raison du bannissement')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  description: 'Bannir plusieurs membres',
  
  async execute(interaction) {
    const member = interaction.member;
    const ok = await isStaffMember(interaction.guild, member);
    if (!ok) return interaction.reply({ content: '⛔ Réservé au staff.', ephemeral: true });
    
    const idsString = interaction.options.getString('ids', true);
    const reason = interaction.options.getString('raison') || 'Mass ban';
    
    // Extraire les IDs (séparés par espaces, virgules ou retours à la ligne)
    const ids = idsString.split(/[\s,\n]+/).filter(id => id.length > 0);
    
    if (ids.length === 0) {
      return interaction.reply({ content: '❌ Aucun ID valide fourni.', ephemeral: true });
    }
    
    if (ids.length > 100) {
      return interaction.reply({ content: '❌ Maximum 100 membres à la fois.', ephemeral: true });
    }
    
    await interaction.deferReply();
    
    let banned = 0;
    let failed = 0;
    const errors = [];
    
    for (const id of ids) {
      try {
        await interaction.guild.members.ban(id, { reason });
        banned++;
      } catch (e) {
        failed++;
        errors.push(`${id}: ${e.message}`);
      }
    }
    
    const embed = buildModEmbed('Mass Ban', 
      `Bannissement en masse terminé`, 
      [
        { name: '✅ Bannis', value: `${banned}`, inline: true },
        { name: '❌ Échecs', value: `${failed}`, inline: true },
        { name: 'Raison', value: reason, inline: false }
      ]
    );
    
    await interaction.editReply({ embeds: [embed] });
    
    // Log moderation
    try {
      const cfg = await getLogsConfig(interaction.guild.id);
      const log = buildModEmbed(
        `${cfg.emoji} Modération • Mass Ban`, 
        `${banned} membres bannis par ${interaction.user}`, 
        [{ name: 'Raison', value: reason }]
      );
      if (global.sendLog) await global.sendLog(interaction.guild, 'moderation', log);
    } catch (_) {}
  }
};
