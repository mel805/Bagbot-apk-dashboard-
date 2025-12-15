/**
 * Helper pour la gestion multi-serveurs
 * Récupère automatiquement le Guild ID depuis l'interaction
 */

/**
 * Récupère le Guild ID depuis une interaction
 * @param {Interaction} interaction - L'interaction Discord
 * @returns {string|null} Le Guild ID ou null si non disponible
 */
function getGuildId(interaction) {
  if (!interaction) return null;
  
  // Récupérer depuis l'interaction
  if (interaction.guildId) {
    return interaction.guildId;
  }
  
  // Récupérer depuis le guild
  if (interaction.guild && interaction.guild.id) {
    return interaction.guild.id;
  }
  
  return null;
}

/**
 * Récupère les informations du serveur
 * @param {Interaction} interaction - L'interaction Discord
 * @returns {Object} Les informations du serveur
 */
function getGuildInfo(interaction) {
  const guildId = getGuildId(interaction);
  
  if (!guildId || !interaction.guild) {
    return {
      id: null,
      name: 'DM',
      memberCount: 0,
      available: false
    };
  }
  
  return {
    id: guildId,
    name: interaction.guild.name || 'Serveur',
    memberCount: interaction.guild.memberCount || 0,
    available: interaction.guild.available !== false
  };
}

/**
 * Vérifie si la commande est exécutée dans un serveur (pas en DM)
 * @param {Interaction} interaction - L'interaction Discord
 * @returns {boolean} True si dans un serveur
 */
function isInGuild(interaction) {
  return getGuildId(interaction) !== null;
}

/**
 * Répond avec une erreur si la commande n'est pas dans un serveur
 * @param {Interaction} interaction - L'interaction Discord
 * @returns {Promise<boolean>} True si la réponse d'erreur a été envoyée
 */
async function requireGuild(interaction) {
  if (!isInGuild(interaction)) {
    await interaction.reply({
      content: '❌ Cette commande ne peut être utilisée que dans un serveur.',
      ephemeral: true
    });
    return true;
  }
  return false;
}

/**
 * Log les informations du serveur pour debug
 * @param {Interaction} interaction - L'interaction Discord
 * @param {string} commandName - Nom de la commande
 */
function logGuildCommand(interaction, commandName) {
  const guildInfo = getGuildInfo(interaction);
  console.log(`[${commandName}] Serveur: ${guildInfo.name} (${guildInfo.id}) - User: ${interaction.user.tag}`);
}

module.exports = {
  getGuildId,
  getGuildInfo,
  isInGuild,
  requireGuild,
  logGuildCommand
};
