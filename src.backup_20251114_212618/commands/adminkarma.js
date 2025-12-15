const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getEconomyUser, setEconomyUser } = require('../storage/jsonStore');

module.exports = {
  name: 'adminkarma',
  data: new SlashCommandBuilder()
    .setName('adminkarma')
    .setDescription('Modifier le karma d\'un membre')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Membre concerné')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type de karma')
        .setRequired(true)
        .addChoices(
          { name: 'Charme', value: 'charm' },
          { name: 'Perversion', value: 'perversion' }
        ))
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action à effectuer')
        .setRequired(true)
        .addChoices(
          { name: 'Ajouter', value: 'add' },
          { name: 'Retirer', value: 'remove' },
          { name: 'Définir', value: 'set' }
        ))
    .addIntegerOption(option =>
      option.setName('quantite')
        .setDescription('Quantité')
        .setRequired(true))
    .setDMPermission(false),
  
  async execute(interaction) {
    const hasManageGuild = interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);
    if (!hasManageGuild) {
      return interaction.reply({ content: '⛔ Permission requise.', ephemeral: true });
    }
    
    const member = interaction.options.getUser('membre', true);
    const type = interaction.options.getString('type', true);
    const action = interaction.options.getString('action', true);
    const amount = interaction.options.getInteger('quantite', true);
    
    const u = await getEconomyUser(interaction.guild.id, member.id);
    const field = type === 'charm' ? 'charm' : 'perversion';
    const current = u[field] || 0;
    
    if (action === 'add') u[field] = current + amount;
    else if (action === 'remove') u[field] = Math.max(0, current - amount);
    else u[field] = Math.max(0, amount);
    
    await setEconomyUser(interaction.guild.id, member.id, u);
    
    return interaction.reply({ 
      content: `✅ ${type === 'charm' ? 'Charme' : 'Perversion'} de ${member} modifié : ${current} → ${u[field]}`, 
      ephemeral: true 
    });
  }
};
