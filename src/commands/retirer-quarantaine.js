const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "retirer-quarantaine",
  
  data: new SlashCommandBuilder()
    .setName("retirer-quarantaine")
    .setDescription("Retirer un membre de la quarantaine")
    .addUserOption(option =>
      option.setName("membre")
        .setDescription("Le membre à retirer de la quarantaine")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("raison")
        .setDescription("Raison du retrait de quarantaine")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const { readConfig } = require("../storage/jsonStore");
      const config = await readConfig();
      
      const quarantineRoleId = config.guilds?.[interaction.guild.id]?.quarantineRoleId;
      
      if (!quarantineRoleId) {
        return interaction.editReply({
          content: "❌ **Aucun rôle de quarantaine configuré !**\n\nUtilisez `/config` puis Staff puis Rôle Quarantaine."
        });
      }

      const quarantineRole = interaction.guild.roles.cache.get(quarantineRoleId) ||
                            await interaction.guild.roles.fetch(quarantineRoleId).catch(() => null);
      
      if (!quarantineRole) {
        return interaction.editReply({
          content: `❌ **Le rôle de quarantaine est introuvable !**\n\nID: ${quarantineRoleId}`
        });
      }

      const targetMember = interaction.options.getMember("membre");
      const reason = interaction.options.getString("raison") || "Aucune raison spécifiée";

      if (!targetMember) {
        return interaction.editReply({ content: "❌ Membre introuvable !" });
      }

      if (!targetMember.roles.cache.has(quarantineRoleId)) {
        return interaction.editReply({ content: `⚠️ **${targetMember.user.tag}** n'est pas en quarantaine !` });
      }

      const botMember = await interaction.guild.members.fetchMe();

      // ÉTAPE 1: Trouver la catégorie de quarantaine
      let quarantineCategory = interaction.guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && c.name.includes("QUARANTAINE")
      );

      if (!quarantineCategory) {
        console.log("[Retirer Quarantaine] Catégorie de quarantaine introuvable");
      }

      // ÉTAPE 2: Trouver et supprimer le channel texte individuel du membre
      let textChannelDeleted = false;
      if (quarantineCategory) {
        const usernameNormalized = targetMember.user.username.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const possibleNames = [
          `⚠️🚨・QUARANTAINE-${usernameNormalized}`,  // Nouveau format
          `🔴・${usernameNormalized}`,                 // Ancien format
          usernameNormalized
        ];

        const textChannel = quarantineCategory.children.cache.find(
          c => c.type === ChannelType.GuildText && 
               possibleNames.some(name => c.name.includes(name) || name.includes(c.name.replace(/[⚠️🚨🔴・]/g, "")))
        );

        if (textChannel) {
          try {
            await textChannel.delete(`Retrait de quarantaine de ${targetMember.user.tag} par ${interaction.user.tag}`);
            textChannelDeleted = true;
            console.log(`[Retirer Quarantaine] Channel ${textChannel.name} supprimé`);
          } catch (err) {
            console.error(`[Retirer Quarantaine] Erreur suppression channel:`, err.message);
          }
        }
      }

      // ÉTAPE 3: Retirer toutes les permissions spécifiques du membre sur tous les channels
      const channels = interaction.guild.channels.cache.filter(ch => 
        ch.isTextBased() || ch.type === ChannelType.GuildVoice || ch.type === ChannelType.GuildStageVoice
      );

      let channelsUnblocked = 0;
      for (const [, channel] of channels) {
        try {
          // Vérifier si le membre a des permissions spécifiques sur ce channel
          const overwrites = channel.permissionOverwrites.cache.get(targetMember.id);
          if (overwrites) {
            await channel.permissionOverwrites.delete(targetMember.id, {
              reason: `Retrait de quarantaine par ${interaction.user.tag}`
            });
            channelsUnblocked++;
          }
        } catch (err) {
          console.error(`[Retirer Quarantaine] Erreur channel ${channel.name}:`, err.message);
        }
      }

      // ÉTAPE 4: Déplacer le membre du vocal de quarantaine s'il y est
      if (targetMember.voice?.channel) {
        const voiceChannel = targetMember.voice.channel;
        if (quarantineCategory && voiceChannel.parentId === quarantineCategory.id) {
          try {
            await targetMember.voice.disconnect(`Retrait de quarantaine par ${interaction.user.tag}`);
            console.log(`[Retirer Quarantaine] Membre déconnecté du vocal de quarantaine`);
          } catch (err) {
            console.error(`[Retirer Quarantaine] Erreur déconnexion vocal:`, err.message);
          }
        }
      }

      // ÉTAPE 5: Retirer le rôle de quarantaine
      await targetMember.roles.remove(quarantineRole, `Retrait de quarantaine par ${interaction.user.tag}: ${reason}`);

      // ÉTAPE 6: Confirmer au modérateur
      const confirmEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("🔓 Membre retiré de la quarantaine")
        .setDescription(`**${targetMember.user.tag}** a été retiré de la quarantaine et a récupéré toutes ses permissions.`)
        .addFields(
          { name: "👤 Membre", value: `${targetMember}`, inline: true },
          { name: "🛡️ Modérateur", value: `${interaction.user}`, inline: true },
          { name: "📝 Raison", value: reason },
          { name: "✅ Rôle retiré", value: `${quarantineRole}`, inline: true },
          { name: "🔓 Channels débloqués", value: `${channelsUnblocked}`, inline: true },
          { name: "🗑️ Channel supprimé", value: textChannelDeleted ? "Oui" : "Non", inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [confirmEmbed] });

      // ÉTAPE 7: Envoyer un DM au membre (tentative)
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("🔓 Retrait de quarantaine")
          .setDescription(`Vous avez été retiré de la quarantaine sur **${interaction.guild.name}**.`)
          .addFields(
            { name: "📝 Raison", value: reason },
            { name: "ℹ️ Information", value: `Vous avez de nouveau accès à tous les channels du serveur.\n\nMerci de respecter les règles du serveur.` }
          )
          .setTimestamp();

        await targetMember.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        console.log(`[Retirer Quarantaine] Impossible d'envoyer un DM à ${targetMember.user.tag}`);
      }

      // ÉTAPE 8: Log modération (optionnel)
      try {
        const { getLogsConfig } = require("../storage/jsonStore");
        const cfg = await getLogsConfig(interaction.guild.id);
        
        if (cfg && global.sendLog) {
          const logEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle(`${cfg.emoji || "📋"} Modération • Retrait de Quarantaine`)
            .setDescription(`${targetMember} retiré de quarantaine par ${interaction.user}`)
            .addFields({ name: "Raison", value: reason })
            .setTimestamp();

          await global.sendLog(interaction.guild, "moderation", logEmbed);
        }
      } catch (logError) {
        console.log(`[Retirer Quarantaine] Erreur logs:`, logError.message);
      }

    } catch (error) {
      console.error("[Retirer Quarantaine] Erreur:", error);
      return interaction.editReply({
        content: `❌ **Erreur lors du retrait de quarantaine :**\n\`\`\`${error.message}\`\`\``
      });
    }
  }
};
