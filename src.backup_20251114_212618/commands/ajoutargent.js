const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getEconomyUser, setEconomyUser, getEconomyConfig } = require('../storage/jsonStore');

module.exports = {
  name: 'ajoutargent',
  data: new SlashCommandBuilder()
    .setName('ajoutargent')
    .setDescription('Ajouter de l\'argent à un membre')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Membre concerné')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('montant')
        .setDescription('Montant à ajouter')
        .setRequired(true))
    .setDMPermission(false),
  
  async execute(interaction) {
    const hasManageGuild = interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);
    if (!hasManageGuild) {
      return interaction.reply({ content: '⛔ Permission requise.', ephemeral: true });
    }
    
    const member = interaction.options.getUser('membre', true);
    const amount = interaction.options.getInteger('montant', true);
    
    const u = await getEconomyUser(interaction.guild.id, member.id);
    const eco = await getEconomyConfig(interaction.guild.id);
    const currency = eco.currency?.name || 'BAG$';
    
    const before = u.amount || 0;
    u.amount = Math.max(0, before + amount);
    await setEconomyUser(interaction.guild.id, member.id, u);
    
    return interaction.reply({ 
      content: `✅ Argent de ${member} modifié : ${before} → ${u.amount} ${currency}`, 
      ephemeral: true 
    });
  }
};
