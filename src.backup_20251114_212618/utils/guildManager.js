/**
 * Gestionnaire de Guild ID - Support multi-serveurs
 * 
 * Ce module gère intelligemment les Guild ID pour permettre au bot
 * de fonctionner sur plusieurs serveurs simultanément
 */

class GuildManager {
  constructor() {
    this.guilds = new Map(); // Map<guildId, guildInfo>
    this.defaultGuildId = null;
  }

  /**
   * Initialise le gestionnaire avec les guilds du bot
   */
  async initialize(client) {
    console.log('[GuildManager] Initialisation...');
    
    try {
      // Récupérer tous les serveurs où le bot est présent
      const guilds = client.guilds.cache;
      
      for (const [guildId, guild] of guilds) {
        this.guilds.set(guildId, {
          id: guildId,
          name: guild.name,
          memberCount: guild.memberCount,
          joinedAt: guild.joinedAt
        });
      }
      
      // Définir le guild par défaut
      if (process.env.GUILD_ID) {
        // Si GUILD_ID est défini, l'utiliser comme défaut
        this.defaultGuildId = process.env.GUILD_ID;
      } else if (guilds.size === 1) {
        // Si un seul serveur, l'utiliser comme défaut
        this.defaultGuildId = guilds.first().id;
      } else if (guilds.size > 1) {
        // Si plusieurs serveurs, utiliser le plus ancien (premier rejoint)
        const oldest = Array.from(guilds.values())
          .sort((a, b) => a.joinedAt - b.joinedAt)[0];
        this.defaultGuildId = oldest.id;
      }
      
      console.log(`[GuildManager] ${this.guilds.size} serveur(s) détecté(s)`);
      console.log(`[GuildManager] Guild par défaut: ${this.defaultGuildId}`);
      
      // Logger tous les serveurs
      for (const [guildId, info] of this.guilds) {
        console.log(`[GuildManager] - ${info.name} (${guildId}) - ${info.memberCount} membres`);
      }
      
    } catch (error) {
      console.error('[GuildManager] Erreur lors de l\'initialisation:', error);
    }
  }

  /**
   * Récupère le Guild ID depuis une interaction
   * 
   * @param {Interaction} interaction - L'interaction Discord
   * @returns {string|null} Le Guild ID ou null
   */
  getGuildId(interaction) {
    // 1. Si l'interaction a un guildId, l'utiliser
    if (interaction?.guildId) {
      return interaction.guildId;
    }
    
    // 2. Si l'interaction a un guild, l'utiliser
    if (interaction?.guild?.id) {
      return interaction.guild.id;
    }
    
    // 3. Fallback : guild par défaut (pour les DM)
    return this.defaultGuildId;
  }

  /**
   * Récupère le Guild ID ou lance une erreur si non disponible
   * 
   * @param {Interaction} interaction - L'interaction Discord
   * @returns {string} Le Guild ID
   * @throws {Error} Si aucun guild n'est trouvé
   */
  requireGuildId(interaction) {
    const guildId = this.getGuildId(interaction);
    
    if (!guildId) {
      throw new Error('Guild ID non disponible');
    }
    
    return guildId;
  }

  /**
   * Vérifie si un guild est enregistré
   * 
   * @param {string} guildId - L'ID du guild
   * @returns {boolean}
   */
  hasGuild(guildId) {
    return this.guilds.has(guildId);
  }

  /**
   * Récupère les informations d'un guild
   * 
   * @param {string} guildId - L'ID du guild
   * @returns {Object|null}
   */
  getGuildInfo(guildId) {
    return this.guilds.get(guildId) || null;
  }

  /**
   * Ajoute un nouveau guild (appelé quand le bot rejoint un serveur)
   * 
   * @param {Guild} guild - Le guild Discord
   */
  addGuild(guild) {
    const guildInfo = {
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      joinedAt: guild.joinedAt || new Date()
    };
    
    this.guilds.set(guild.id, guildInfo);
    console.log(`[GuildManager] Nouveau serveur ajouté: ${guild.name} (${guild.id})`);
    
    // Si c'est le premier serveur, le définir comme défaut
    if (!this.defaultGuildId) {
      this.defaultGuildId = guild.id;
      console.log(`[GuildManager] Défini comme guild par défaut: ${guild.id}`);
    }
  }

  /**
   * Retire un guild (appelé quand le bot quitte un serveur)
   * 
   * @param {string} guildId - L'ID du guild
   */
  removeGuild(guildId) {
    const info = this.guilds.get(guildId);
    
    if (info) {
      this.guilds.delete(guildId);
      console.log(`[GuildManager] Serveur retiré: ${info.name} (${guildId})`);
      
      // Si c'était le guild par défaut, en choisir un nouveau
      if (this.defaultGuildId === guildId) {
        if (this.guilds.size > 0) {
          this.defaultGuildId = this.guilds.keys().next().value;
          console.log(`[GuildManager] Nouveau guild par défaut: ${this.defaultGuildId}`);
        } else {
          this.defaultGuildId = null;
          console.log(`[GuildManager] Aucun guild par défaut`);
        }
      }
    }
  }

  /**
   * Récupère tous les guilds
   * 
   * @returns {Array<Object>}
   */
  getAllGuilds() {
    return Array.from(this.guilds.values());
  }

  /**
   * Définit manuellement le guild par défaut
   * 
   * @param {string} guildId - L'ID du guild
   */
  setDefaultGuild(guildId) {
    if (this.guilds.has(guildId)) {
      this.defaultGuildId = guildId;
      console.log(`[GuildManager] Guild par défaut changé: ${guildId}`);
      return true;
    }
    return false;
  }

  /**
   * Récupère le guild par défaut
   * 
   * @returns {string|null}
   */
  getDefaultGuildId() {
    return this.defaultGuildId;
  }
}

// Export d'une instance unique (singleton)
const guildManager = new GuildManager();

module.exports = guildManager;