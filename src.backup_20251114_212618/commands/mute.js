const { SlashCommandBuilder } = require('discord.js');
const { isStaffMember, buildModEmbed } = require('../utils/modHelpers');
const { getLogsConfig } = require('../storage/jsonStore');

module.exports = {
  name: 'mute',

  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Rendre muet un membre temporairement')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Membre à rendre muet')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('minutes')
        .setDescription('Durée en minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320))
    .addStringOption(option =>
      option.setName('raison')
        .setDescription('Raison du mute')
        .setRequired(false))
    .setDefaultMemberPermissions('0')
    .setDMPermission(false),

  description: 'Rendre muet un membre',
  
  async execute(interaction) {
    const member = interaction.member;
    const ok = await isStaffMember(interaction.guild, member);
    if (!ok) return interaction.reply({ content: '⛔ Réservé au staff.', ephemeral: true });
    
    const user = interaction.options.getUser('membre', true);
    const minutes = interaction.options.getInteger('minutes', true);
    const reason = interaction.options.getString('raison') || '—';
    const m = await interaction.guild.members.fetch(user.id).catch(()=>null);
    
    if (!m) return interaction.reply({ content:'Membre introuvable.', ephemeral:true });
    
    const ms = minutes * 60 * 1000;
    try { 
      await m.timeout(ms, reason); 
    } catch (e) { 
      return interaction.reply({ content:'Échec du mute.', ephemeral:true }); 
    }
    
    const embed = buildModEmbed('Mute', `${user} a été réduit au silence.`, [
      { name:'Durée', value: `${minutes} min`, inline:true }, 
      { name:'Raison', value: reason, inline:true }
    ]);
    await interaction.reply({ embeds: [embed] });
    
    // Log moderation
    try {
      const cfg = await getLogsConfig(interaction.guild.id);
      const log = buildModEmbed(`${cfg.emoji} Modération • Mute`, `${user} muet par ${interaction.user}`, [
        { name:'Durée', value: `${minutes} min` }, 
        { name:'Raison', value: reason }
      ]);
      if (global.sendLog) await global.sendLog(interaction.guild, 'moderation', log);
    } catch (_) {}
  }
};
