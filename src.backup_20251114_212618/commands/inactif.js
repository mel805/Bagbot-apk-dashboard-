const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'inactif',
  dmPermission: false,
  data: new SlashCommandBuilder()
    .setName('inactif')
    .setDescription('Gérer votre statut d\'inactivité')
    .addSubcommand(subcommand =>
      subcommand
        .setName('declarer')
        .setDescription('Déclarer une période d\'inactivité prévue')
        .addIntegerOption(option =>
          option.setName('duree')
            .setDescription('Durée d\'inactivité')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(365))
        .addStringOption(option =>
          option.setName('unite')
            .setDescription('Unité de temps')
            .setRequired(true)
            .addChoices(
              { name: 'Minutes (test)', value: 'minutes' },
              { name: 'Jours', value: 'days' },
              { name: 'Semaines', value: 'weeks' },
              { name: 'Mois', value: 'months' }
            ))
        .addStringOption(option =>
          option.setName('raison')
            .setDescription('Raison de votre absence (optionnel)')
            .setRequired(false)
            .setMaxLength(200)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('annuler')
        .setDescription('Annuler votre déclaration d\'inactivité'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('statut')
        .setDescription('Voir votre statut d\'inactivité'))
    .setDMPermission(false),
  
  async execute(interaction) {
    const { getAutoKickConfig, setPlannedInactivity, removePlannedInactivity, getInactivityTracking } = require('../storage/jsonStore');
    
    const subcommand = interaction.options.getSubcommand();
    const autokick = await getAutoKickConfig(interaction.guild.id);
    
    if (!autokick.inactivityKick.enabled) {
      return interaction.reply({
        content: '⛔ Le système d\'autokick inactivité n\'est pas activé sur ce serveur.',
        ephemeral: true
      });
    }
    
    if (subcommand === 'declarer') {
      const duree = interaction.options.getInteger('duree');
      const unite = interaction.options.getString('unite');
      const raison = interaction.options.getString('raison') || 'Non spécifié';
      
      // Calculer la durée en millisecondes
      let durationMs = 0;
      switch (unite) {
        case 'minutes':
          durationMs = duree * 60 * 1000;
          break;
        case 'days':
          durationMs = duree * 24 * 60 * 60 * 1000;
          break;
        case 'weeks':
          durationMs = duree * 7 * 24 * 60 * 60 * 1000;
          break;
        case 'months':
          durationMs = duree * 30 * 24 * 60 * 60 * 1000;
          break;
      }
      
      const untilTimestamp = Date.now() + durationMs;
      await setPlannedInactivity(interaction.guild.id, interaction.user.id, untilTimestamp, raison);
      
      // Donner le rôle "Inactif" si configuré
      let roleGiven = false;
      if (autokick.inactivityKick.inactiveRoleId) {
        try {
          const member = await interaction.guild.members.fetch(interaction.user.id);
          if (member && !member.roles.cache.has(autokick.inactivityKick.inactiveRoleId)) {
            await member.roles.add(autokick.inactivityKick.inactiveRoleId, 'Inactivité déclarée');
            roleGiven = true;
          }
        } catch (err) {
          console.error('[Inactif] Erreur attribution rôle:', err.message);
        }
      }
      
      const uniteLabel = unite === 'minutes' ? 'minute(s)' : (unite === 'days' ? 'jour(s)' : (unite === 'weeks' ? 'semaine(s)' : 'mois'));
      const dateRetour = new Date(untilTimestamp);
      
      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('🛡️ Inactivité déclarée')
        .setDescription(`Vous êtes maintenant protégé de l'autokick pendant votre absence !${roleGiven ? '\n✅ Rôle "Inactif" attribué' : (!autokick.inactivityKick.inactiveRoleId ? '\n⚠️ Aucun rôle "Inactif" configuré' : '')}`)
        .addFields(
          { name: 'Durée', value: `${duree} ${uniteLabel}`, inline: true },
          { name: 'Retour prévu', value: `<t:${Math.floor(untilTimestamp/1000)}:F>`, inline: true },
          { name: 'Raison', value: raison }
        )
        .setFooter({ text: 'BAG • AutoKick Inactivité' })
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (subcommand === 'annuler') {
      const tracking = await getInactivityTracking(interaction.guild.id);
      const userTracking = tracking[interaction.user.id];
      
      if (!userTracking || !userTracking.plannedInactive) {
        return interaction.reply({
          content: '⛔ Vous n\'avez pas de déclaration d\'inactivité active.',
          ephemeral: true
        });
      }
      
      await removePlannedInactivity(interaction.guild.id, interaction.user.id);
      
      // Retirer le rôle "Inactif" si configuré
      let roleRemoved = false;
      if (autokick.inactivityKick.inactiveRoleId) {
        try {
          const member = await interaction.guild.members.fetch(interaction.user.id);
          if (member && member.roles.cache.has(autokick.inactivityKick.inactiveRoleId)) {
            await member.roles.remove(autokick.inactivityKick.inactiveRoleId, 'Inactivité annulée');
            roleRemoved = true;
          }
        } catch (err) {
          console.error('[Inactif] Erreur retrait rôle:', err.message);
        }
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('✅ Déclaration annulée')
        .setDescription(`Votre déclaration d'inactivité a été annulée. Vous êtes à nouveau soumis à l'autokick inactivité.$${roleRemoved ? '\n✅ Rôle "Inactif" retiré' : ''}`)
        .setFooter({ text: 'BAG • AutoKick Inactivité' })
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (subcommand === 'statut') {
      const tracking = await getInactivityTracking(interaction.guild.id);
      const userTracking = tracking[interaction.user.id];
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📊 Votre statut d\'inactivité')
        .setFooter({ text: 'BAG • AutoKick Inactivité' })
        .setTimestamp();
      
      if (userTracking && userTracking.plannedInactive) {
        const until = userTracking.plannedInactive.until;
        const remaining = until - Date.now();
        const daysRemaining = Math.ceil(remaining / (24 * 60 * 60 * 1000));
        
        embed.setDescription('🛡️ **Vous êtes protégé de l\'autokick**')
          .addFields(
            { name: 'Retour prévu', value: `<t:${Math.floor(until/1000)}:F>`, inline: true },
            { name: 'Temps restant', value: `${daysRemaining} jour(s)`, inline: true },
            { name: 'Raison', value: userTracking.plannedInactive.reason || 'Non spécifié' }
          );
      } else {
        const lastActivity = userTracking?.lastActivity || 0;
        const daysSinceActivity = lastActivity ? Math.floor((Date.now() - lastActivity) / (24 * 60 * 60 * 1000)) : '?';
        const kickDelayDays = autokick.inactivityKick.delayDays;
        const daysBeforeKick = lastActivity ? Math.max(0, kickDelayDays - daysSinceActivity) : kickDelayDays;
        
        embed.setDescription('⚠️ **Aucune protection active**')
          .addFields(
            { name: 'Dernière activité', value: lastActivity ? `<t:${Math.floor(lastActivity/1000)}:R>` : 'Inconnue', inline: true },
            { name: 'Jours d\'inactivité', value: String(daysSinceActivity), inline: true },
            { name: 'Kick dans', value: `${daysBeforeKick} jour(s)`, inline: true },
            { name: 'Délai autokick', value: `${kickDelayDays} jours` }
          );
      }
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
