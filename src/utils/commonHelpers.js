const { EmbedBuilder } = require('discord.js');

/**
 * Constantes de thème (copiées depuis bot.js)
 */
const THEME_COLOR_PRIMARY = 0x1e88e5; // blue
const THEME_COLOR_ACCENT = 0xec407a; // pink
const THEME_COLOR_NSFW = 0xd32f2f; // deep red for NSFW

// URLs par défaut (fallback si les variables globales ne sont pas définies)
const DEFAULT_THEME_IMAGE = 'https://cdn.discordapp.com/attachments/1408458115283812484/1408497858256179400/file_00000000d78861f4993dddd515f84845.png?ex=68b08cda&is=68af3b5a&hm=2e68cb9d7dfc7a60465aa74447b310348fc2d7236e74fa7c08f9434c110d7959&';
const DEFAULT_THEME_FOOTER_ICON = 'https://cdn.discordapp.com/attachments/1408458115283812484/1408458115770482778/20250305162902.png?ex=68b50516&is=68b3b396&hm=1d83bbaaa9451ed0034a52c48ede5ddc55db692b15e65b4fe5c659ed4c80b77d&';
const THEME_TICKET_FOOTER_ICON = 'https://cdn.discordapp.com/attachments/1408458115283812484/1411752143173714040/IMG_20250831_183646.png?ex=68b7c664&is=68b674e4&hm=5980bdf7a118bddd76bb4d5f57168df7b2986b23b56ff0c96d47c3827b283765&';

/**
 * Récupère l'URL du footer icon depuis les variables globales ou fallback
 */
function getFooterIcon() {
  return global.currentFooterIcon || DEFAULT_THEME_FOOTER_ICON;
}

/**
 * Récupère l'URL de l'image thumbnail depuis les variables globales ou fallback
 */
function getThumbnailImage() {
  return global.currentThumbnailImage || DEFAULT_THEME_IMAGE;
}

/**
 * Construit un embed pour l'économie
 */
function buildEcoEmbed(opts) {
  const { title, description, fields, color } = opts || {};
  const embed = new EmbedBuilder()
    .setColor(color || THEME_COLOR_PRIMARY)
    .setThumbnail(getThumbnailImage())
    .setTimestamp(new Date())
    .setFooter({ text: 'BAG • Économie', iconURL: getFooterIcon() });
  if (title) embed.setTitle(String(title));
  if (description) embed.setDescription(String(description));
  if (Array.isArray(fields) && fields.length) embed.addFields(fields);
  return embed;
}

/**
 * Construit un embed général
 */
function buildEmbed(opts) {
  const { title, description, fields, color, footer, thumbnail, image } = opts || {};
  const embed = new EmbedBuilder()
    .setColor(color || THEME_COLOR_PRIMARY)
    .setTimestamp(new Date());
  
  if (title) embed.setTitle(String(title));
  if (description) embed.setDescription(String(description));
  if (Array.isArray(fields) && fields.length) embed.addFields(fields);
  if (footer) embed.setFooter(typeof footer === 'string' ? { text: footer } : footer);
  else embed.setFooter({ text: 'BAG • Premium', iconURL: getFooterIcon() });
  if (thumbnail) embed.setThumbnail(thumbnail);
  else embed.setThumbnail(getThumbnailImage());
  if (image) embed.setImage(image);
  
  return embed;
}

/**
 * Réponse sécurisée pour éviter les timeouts
 */
const renderSafeReply = async (interaction, content, options = {}) => {
  try {
    if (!interaction.replied && !interaction.deferred) {
      return await interaction.reply({ content, ...options });
    } else if (interaction.deferred) {
      return await interaction.editReply({ content, ...options });
    } else {
      return await interaction.followUp({ content, ...options });
    }
  } catch (error) {
    console.error('[renderSafeReply] Error:', error);
    try {
      if (!interaction.replied) {
        return await interaction.reply({ content: content || '❌ Erreur', ephemeral: true });
      }
    } catch (finalError) {
      console.error('[renderSafeReply] Final fallback failed:', finalError);
    }
  }
};

/**
 * Vérifie si un membre est administrateur
 */
function isAdmin(interaction) {
  const { PermissionsBitField } = require('discord.js');
  return interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) 
    || interaction.member?.permissions?.has(PermissionsBitField.Flags.Administrator);
}

/**
 * Récupère le Guild ID de manière intelligente (multi-serveurs)
 * 
 * @param {Interaction} interaction - L'interaction Discord
 * @returns {string} Le Guild ID
 */
function getGuildId(interaction) {
  // 1. Essayer d'obtenir le guild ID depuis l'interaction
  if (interaction?.guildId) {
    return interaction.guildId;
  }
  
  if (interaction?.guild?.id) {
    return interaction.guild.id;
  }
  
  // 2. Utiliser le guildManager si disponible (pour les DM)
  if (global.guildManager) {
    return global.guildManager.getGuildId(interaction);
  }
  
  // 3. Fallback : variable d'environnement (ancienne méthode)
  return process.env.GUILD_ID || process.env.FORCE_GUILD_ID || null;
}

module.exports = {
  THEME_COLOR_PRIMARY,
  THEME_COLOR_ACCENT,
  THEME_COLOR_NSFW,
  THEME_IMAGE: DEFAULT_THEME_IMAGE,
  THEME_FOOTER_ICON: DEFAULT_THEME_FOOTER_ICON,
  THEME_TICKET_FOOTER_ICON,
  buildEcoEmbed,
  buildEmbed,
  renderSafeReply,
  isAdmin,
  getGuildId,
  getFooterIcon,
  getThumbnailImage
};
