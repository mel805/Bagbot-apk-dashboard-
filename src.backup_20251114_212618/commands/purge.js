const { SlashCommandBuilder } = require('discord.js');
const { isStaffMember, buildModEmbed } = require('../utils/modHelpers');
const { setCountingState } = require('../storage/jsonStore');

module.exports = {
  name: 'purge',

  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Supprimer plusieurs messages d\'un salon')
    .addIntegerOption(option =>
      option.setName('nombre')
        .setDescription('Nombre de messages à supprimer (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .setDefaultMemberPermissions('0')
    .setDMPermission(false),

  description: 'Supprimer plusieurs messages',
  
  async execute(interaction) {
    const member = interaction.member;
    const ok = await isStaffMember(interaction.guild, member);
    if (!ok) return interaction.reply({ content: '⛔ Réservé au staff.', ephemeral: true });
    
    const count = interaction.options.getInteger('nombre', true);
    const ch = interaction.channel;
    
    try { 
      await ch.bulkDelete(count, true); 
    } catch (_) { 
      return interaction.reply({ content:'Échec de la purge (messages trop anciens ?).', ephemeral:true }); 
    }
    
    // Reset runtime states
    try { 
      await setCountingState(interaction.guild.id, { current: 0, lastUserId: '' }); 
    } catch (_) {}
    
    const embed = buildModEmbed('Purge', `Salon nettoyé (${count} messages supprimés).`, []);
    return interaction.reply({ embeds: [embed] });
  }
};
