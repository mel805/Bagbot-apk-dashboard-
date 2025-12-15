const { SlashCommandBuilder } = require('discord.js');
const { isStaffMember, buildModEmbed } = require('../utils/modHelpers');
const { getLogsConfig } = require('../storage/jsonStore');

module.exports = {
  name: 'kick',

  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulser un membre du serveur')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Membre à expulser')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('raison')
        .setDescription('Raison de l\'expulsion')
        .setRequired(false))
    .setDefaultMemberPermissions('0')
    .setDMPermission(false),

  description: 'Expulser un membre',
  
  async execute(interaction) {
    const member = interaction.member;
    const ok = await isStaffMember(interaction.guild, member);
    if (!ok) return interaction.reply({ content: '⛔ Réservé au staff.', ephemeral: true });
    
    const user = interaction.options.getUser('membre', true);
    const reason = interaction.options.getString('raison') || '—';
    const m = await interaction.guild.members.fetch(user.id).catch(()=>null);
    
    if (!m) return interaction.reply({ content:'Membre introuvable.', ephemeral:true });
    
    try { 
      await m.kick(reason); 
    } catch (e) { 
      return interaction.reply({ content:'Échec du kick.', ephemeral:true }); 
    }
    
    const embed = buildModEmbed('Kick', `${user} a été expulsé.`, [{ name:'Raison', value: reason }]);
    await interaction.reply({ embeds: [embed] });
    
    // Log moderation
    try {
      const cfg = await getLogsConfig(interaction.guild.id);
      const log = buildModEmbed(`${cfg.emoji} Modération • Kick`, `${user} expulsé par ${interaction.user}`, [{ name:'Raison', value: reason }]);
      if (global.sendLog) await global.sendLog(interaction.guild, 'moderation', log);
    } catch (_) {}
  }
};
