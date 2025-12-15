const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isStaffMember, buildModEmbed } = require('../utils/modHelpers');
const { getLogsConfig } = require('../storage/jsonStore');

module.exports = {
  name: 'masskick',

  data: new SlashCommandBuilder()
    .setName('masskick')
    .setDescription('Expulser plusieurs membres en masse')
    .addStringOption(option =>
      option.setName('ids')
        .setDescription('IDs des membres à expulser (séparés par des espaces)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('raison')
        .setDescription('Raison de l\'expulsion')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  description: 'Expulser plusieurs membres',
  
  async execute(interaction) {
    const member = interaction.member;
    const ok = await isStaffMember(interaction.guild, member);
    if (!ok) return interaction.reply({ content: '⛔ Réservé au staff.', ephemeral: true });
    
    const idsString = interaction.options.getString('ids', true);
    const reason = interaction.options.getString('raison') || 'Mass kick';
    
    // Extraire les IDs
    const ids = idsString.split(/[\s,\n]+/).filter(id => id.length > 0);
    
    if (ids.length === 0) {
      return interaction.reply({ content: '❌ Aucun ID valide fourni.', ephemeral: true });
    }
    
    if (ids.length > 100) {
      return interaction.reply({ content: '❌ Maximum 100 membres à la fois.', ephemeral: true });
    }
    
    await interaction.deferReply();
    
    let kicked = 0;
    let failed = 0;
    
    for (const id of ids) {
      try {
        const m = await interaction.guild.members.fetch(id).catch(() => null);
        if (m) {
          await m.kick(reason);
          kicked++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
    }
    
    const embed = buildModEmbed('Mass Kick', 
      `Expulsion en masse terminée`, 
      [
        { name: '✅ Expulsés', value: `${kicked}`, inline: true },
        { name: '❌ Échecs', value: `${failed}`, inline: true },
        { name: 'Raison', value: reason, inline: false }
      ]
    );
    
    await interaction.editReply({ embeds: [embed] });
    
    // Log moderation
    try {
      const cfg = await getLogsConfig(interaction.guild.id);
      const log = buildModEmbed(
        `${cfg.emoji} Modération • Mass Kick`, 
        `${kicked} membres expulsés par ${interaction.user}`, 
        [{ name: 'Raison', value: reason }]
      );
      if (global.sendLog) await global.sendLog(interaction.guild, 'moderation', log);
    } catch (_) {}
  }
};
