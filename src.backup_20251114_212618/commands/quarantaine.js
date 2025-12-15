const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "quarantaine",
  
  data: new SlashCommandBuilder()
    .setName("quarantaine")
    .setDescription("Mettre un membre en quarantaine")
    .addUserOption(option =>
      option.setName("membre")
        .setDescription("Le membre à mettre en quarantaine")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("raison")
        .setDescription("Raison de la mise en quarantaine")
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

      if (targetMember.id === interaction.user.id) {
        return interaction.editReply({ content: "❌ Vous ne pouvez pas vous mettre en quarantaine !" });
      }

      if (targetMember.id === interaction.guild.ownerId) {
        return interaction.editReply({ content: "❌ Impossible de mettre le propriétaire en quarantaine !" });
      }

      if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.editReply({ content: "❌ Rôle du membre trop élevé !" });
      }

      const botMember = await interaction.guild.members.fetchMe();
      if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
        return interaction.editReply({ content: "❌ Mon rôle est trop bas !" });
      }

      if (targetMember.roles.cache.has(quarantineRoleId)) {
        return interaction.editReply({ content: `⚠️ **${targetMember.user.tag}** est déjà en quarantaine !` });
      }

      // ÉTAPE 1: Créer ou récupérer la catégorie de quarantaine
      let quarantineCategory = interaction.guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && c.name.includes("QUARANTAINE")
      );

      if (!quarantineCategory) {
        quarantineCategory = await interaction.guild.channels.create({
          name: "🔒 QUARANTAINE",
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone,
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: quarantineRoleId,
              allow: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: botMember.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels]
            }
          ]
        });
        console.log(`[Quarantaine] Catégorie créée: ${quarantineCategory.name}`);
      }

      // ÉTAPE 2: Créer ou récupérer le channel vocal commun
      let voiceChannel = quarantineCategory.children.cache.find(
        c => c.type === ChannelType.GuildVoice && c.name.includes("vocal-quarantaine")
      );

      if (!voiceChannel) {
        voiceChannel = await interaction.guild.channels.create({
          name: "🔇・vocal-quarantaine",
          type: ChannelType.GuildVoice,
          parent: quarantineCategory.id,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone,
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: quarantineRoleId,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
            },
            {
              id: botMember.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels]
            }
          ]
        });
        console.log(`[Quarantaine] Channel vocal créé: ${voiceChannel.name}`);
      }

      // ÉTAPE 3: Créer un channel texte individuel pour le membre
      const textChannelName = `⚠️🚨・QUARANTAINE-${targetMember.user.username.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      
      let textChannel = await interaction.guild.channels.create({
        name: textChannelName,
        type: ChannelType.GuildText,
        parent: quarantineCategory.id,
        topic: `Quarantaine de ${targetMember.user.tag} - ${reason}`,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: targetMember.id,
            allow: [
              PermissionFlagsBits.ViewChannel, 
              PermissionFlagsBits.SendMessages, 
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: botMember.id,
            allow: [
              PermissionFlagsBits.ViewChannel, 
              PermissionFlagsBits.SendMessages, 
              PermissionFlagsBits.ManageChannels
            ]
          }
        ]
      });

      // Permettre aux modérateurs de voir le channel
      const staffRoles = interaction.member.roles.cache.filter(r => 
        r.permissions.has(PermissionFlagsBits.ModerateMembers)
      );
      
      for (const [, role] of staffRoles) {
        await textChannel.permissionOverwrites.create(role.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });
      }

      console.log(`[Quarantaine] Channel texte créé: ${textChannel.name}`);

      // ÉTAPE 4: Ajouter le rôle de quarantaine
      await targetMember.roles.add(quarantineRole, `Quarantaine par ${interaction.user.tag}: ${reason}`);

      // ÉTAPE 5: Bloquer l'accès à tous les autres channels
      const channels = interaction.guild.channels.cache.filter(ch => 
        (ch.isTextBased() || ch.type === ChannelType.GuildVoice || ch.type === ChannelType.GuildStageVoice) &&
        ch.parentId !== quarantineCategory.id
      );

      let channelsBlocked = 0;
      for (const [, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(targetMember.id, {
            ViewChannel: false,
            SendMessages: false,
            Connect: false
          }, {
            reason: `Quarantaine par ${interaction.user.tag}`
          });
          channelsBlocked++;
        } catch (err) {
          console.error(`[Quarantaine] Erreur channel ${channel.name}:`, err.message);
        }
      }

      // ÉTAPE 6: Envoyer un message de bienvenue dans le channel de quarantaine
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🔒 Mise en Quarantaine")
        .setDescription(`${targetMember}, vous avez été placé en quarantaine.`)
        .addFields(
          { name: "📝 Raison", value: reason },
          { name: "🛡️ Modérateur", value: `${interaction.user}` },
          { name: "ℹ️ Information", value: "Vous êtes confiné dans cette zone. Un modérateur vous contactera bientôt.\n\n**Channels accessibles:**\n• Ce channel texte (privé)\n• " + voiceChannel.toString() + " (vocal commun)" }
        )
        .setTimestamp();

      await textChannel.send({ content: `${targetMember}`, embeds: [welcomeEmbed] });

      // ÉTAPE 7: Confirmer au modérateur
      const confirmEmbed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("🔒 Membre mis en quarantaine")
        .setDescription(`**${targetMember.user.tag}** a été placé en quarantaine.`)
        .addFields(
          { name: "👤 Membre", value: `${targetMember}`, inline: true },
          { name: "🛡️ Modérateur", value: `${interaction.user}`, inline: true },
          { name: "📝 Raison", value: reason },
          { name: "🔐 Rôle ajouté", value: `${quarantineRole}`, inline: true },
          { name: "🚫 Channels bloqués", value: `${channelsBlocked}`, inline: true },
          { name: "📁 Zone créée", value: `Catégorie: ${quarantineCategory}\nTexte: ${textChannel}\nVocal: ${voiceChannel}` }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [confirmEmbed] });

      // ÉTAPE 8: Envoyer un DM au membre (tentative)
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🔒 Mise en quarantaine")
          .setDescription(`Vous avez été placé en quarantaine sur **${interaction.guild.name}**.`)
          .addFields(
            { name: "📝 Raison", value: reason },
            { name: "ℹ️ Information", value: `Vous avez été confiné dans un espace dédié.\n\nRendez-vous sur le serveur dans la catégorie **${quarantineCategory.name}** pour plus d'informations.` }
          )
          .setTimestamp();

        await targetMember.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        console.log(`[Quarantaine] Impossible d'envoyer un DM à ${targetMember.user.tag}`);
      }

    } catch (error) {
      console.error("[Quarantaine] Erreur:", error);
      return interaction.editReply({
        content: `❌ **Erreur lors de la mise en quarantaine :**\n\`\`\`${error.message}\`\`\``
      });
    }
  }
};
