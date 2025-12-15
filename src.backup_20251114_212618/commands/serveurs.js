const { SlashCommandBuilder } = require('discord.js');
/**
 * Commande /serveurs - Liste les serveurs où le bot est présent (admin)
 */

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { THEME_COLOR_PRIMARY, THEME_FOOTER_ICON } = require('../utils/commonHelpers');

module.exports = {
  name: 'serveurs',

  data: new SlashCommandBuilder()
    .setName('serveurs')
    .setDescription('Commande serveurs')
    .setDMPermission(false),

  description: 'Commande serveurs',
  
  async execute(interaction) {
    // Vérifier les permissions admin
    const isAdmin = interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) 
      || interaction.member?.permissions?.has(PermissionsBitField.Flags.Administrator);
    
    if (!isAdmin) {
      return interaction.reply({ content: '⛔ Réservé aux administrateurs.', ephemeral: true });
    }
    
    const guildManager = global.guildManager;
    
    if (!guildManager) {
      return interaction.reply({ 
        content: '❌ Gestionnaire de serveurs non disponible.', 
        ephemeral: true 
      });
    }
    
    const guilds = guildManager.getAllGuilds();
    const defaultGuildId = guildManager.getDefaultGuildId();
    
    if (guilds.length === 0) {
      return interaction.reply({ 
        content: 'Aucun serveur détecté.', 
        ephemeral: true 
      });
    }
    
    // Construire la liste des serveurs
    const fields = guilds.map((guild, index) => {
      const isDefault = guild.id === defaultGuildId;
      const name = `${index + 1}. ${guild.name}${isDefault ? ' ⭐ (Défaut)' : ''}`;
      const value = `**ID**: \`${guild.id}\`\n**Membres**: ${guild.memberCount}\n**Rejoint**: ${new Date(guild.joinedAt).toLocaleDateString('fr-FR')}`;
      
      return { name, value, inline: false };
    });
    
    const embed = new EmbedBuilder()
      .setColor(THEME_COLOR_PRIMARY)
      .setTitle('🌐 Serveurs du bot')
      .setDescription(`Le bot est présent sur **${guilds.length}** serveur${guilds.length > 1 ? 's' : ''}.`)
      .addFields(fields)
      .setFooter({ 
        text: `BAG • Multi-serveurs${defaultGuildId ? ` • Défaut: ${defaultGuildId}` : ''}`, 
        iconURL: THEME_FOOTER_ICON 
      })
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};