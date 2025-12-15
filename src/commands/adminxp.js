const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getLevelsConfig, getUserStats, setUserStats, ensureStorageExists } = require('../storage/jsonStore');
const { xpRequiredForNext, xpToLevel, totalXpAtLevel, fetchMember } = require('../utils/levelHelpers');

module.exports = { 
  name: 'adminxp',

  data: new SlashCommandBuilder()
    .setName('adminxp')
    .setDescription('Gérer l\'XP et les niveaux des membres')
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Action à effectuer')
        .setRequired(true)
        .addChoices(
          { name: '➕ Ajouter XP', value: 'addxp' },
          { name: '➖ Retirer XP', value: 'removexp' },
          { name: '🎚️ Définir niveau', value: 'setlevel' },
          { name: '⬆️ Ajouter niveaux', value: 'addlevel' },
          { name: '⬇️ Retirer niveaux', value: 'removelevel' },
          { name: '🔄 Réinitialiser', value: 'reset' }
        ))
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre concerné')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('valeur')
        .setDescription('Quantité (XP ou niveaux)')
        .setRequired(false))
    .setDMPermission(false),

  description: 'Gérer XP et niveaux',
  
  async execute(interaction) {
    const hasManageGuild = interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild) 
      || interaction.member?.permissions?.has(PermissionsBitField.Flags.ManageGuild);
    
    if (!hasManageGuild) {
      return interaction.reply({ content: '⛔ Permission requise.', ephemeral: true });
    }
    
    const action = interaction.options.getString('action', true);
    const target = interaction.options.getUser('membre', true);
    const value = interaction.options.getInteger('valeur', false);
    
    if (target?.bot) {
      return interaction.reply({ content: '⛔ Cible invalide: les bots sont exclus.', ephemeral: true });
    }
    
    // Vérifier que la valeur est fournie pour les actions qui en ont besoin
    if (['addxp', 'removexp', 'setlevel', 'addlevel', 'removelevel'].includes(action) && !value) {
      return interaction.reply({ content: '⛔ La valeur est requise pour cette action.', ephemeral: true });
    }
    
    try { 
      await interaction.deferReply({ ephemeral: true }); 
    } catch (_) {}
    
    let levels;
    try {
      levels = await getLevelsConfig(interaction.guild.id);
    } catch (e) {
      try {
        await ensureStorageExists();
        levels = await getLevelsConfig(interaction.guild.id);
      } catch (e2) {
        return interaction.editReply({ content: `Erreur de stockage: ${e2?.code||'inconnue'}` });
      }
    }
    
    let stats = await getUserStats(interaction.guild.id, target.id);
    
    const applyRewardsUpTo = async (newLevel) => {
      const tm = await fetchMember(interaction.guild, target.id);
      if (!tm) return;
      const entries = Object.entries(levels.rewards || {});
      for (const [lvlStr, rid] of entries) {
        const lvlNum = Number(lvlStr);
        if (Number.isFinite(lvlNum) && newLevel >= lvlNum) {
          try { await tm.roles.add(rid); } catch (_) {}
        }
      }
    };
    
    if (action === 'addxp') {
      const amount = value;
      stats.xp += amount;
      stats.xpSinceLevel += amount;
      let required = xpRequiredForNext(stats.level, levels.levelCurve);
      let leveled = false;
      
      while (stats.xpSinceLevel >= required) {
        stats.xpSinceLevel -= required;
        stats.level += 1;
        leveled = true;
        required = xpRequiredForNext(stats.level, levels.levelCurve);
      }
      
      await setUserStats(interaction.guild.id, target.id, stats);
      
      // Normalisation finale
      const norm = xpToLevel(stats.xp, levels.levelCurve);
      if (norm.level !== stats.level || norm.xpSinceLevel !== stats.xpSinceLevel) {
        stats.level = norm.level;
        stats.xpSinceLevel = norm.xpSinceLevel;
        await setUserStats(interaction.guild.id, target.id, stats);
      }
      
      await applyRewardsUpTo(stats.level);
      return interaction.editReply({ content: `✅ Ajouté ${amount} XP à ${target}. Niveau: ${stats.level}` });
    }
    
    if (action === 'removexp') {
      const amount = value;
      const newTotal = Math.max(0, (stats.xp || 0) - amount);
      const norm = xpToLevel(newTotal, levels.levelCurve);
      stats.xp = newTotal;
      stats.level = norm.level;
      stats.xpSinceLevel = norm.xpSinceLevel;
      await setUserStats(interaction.guild.id, target.id, stats);
      return interaction.editReply({ content: `✅ Retiré ${amount} XP à ${target}. Niveau: ${stats.level}` });
    }
    
    if (action === 'addlevel') {
      const n = value;
      stats.level = Math.max(0, stats.level + n);
      stats.xpSinceLevel = 0;
      stats.xp = totalXpAtLevel(stats.level, levels.levelCurve);
      await setUserStats(interaction.guild.id, target.id, stats);
      await applyRewardsUpTo(stats.level);
      return interaction.editReply({ content: `✅ Ajouté ${n} niveau(x) à ${target}. Niveau: ${stats.level}` });
    }
    
    if (action === 'removelevel') {
      const n = value;
      stats.level = Math.max(0, stats.level - n);
      stats.xpSinceLevel = 0;
      stats.xp = totalXpAtLevel(stats.level, levels.levelCurve);
      await setUserStats(interaction.guild.id, target.id, stats);
      return interaction.editReply({ content: `✅ Retiré ${n} niveau(x) à ${target}. Niveau: ${stats.level}` });
    }
    
    if (action === 'setlevel') {
      const n = value;
      stats.level = Math.max(0, n);
      stats.xpSinceLevel = 0;
      stats.xp = totalXpAtLevel(stats.level, levels.levelCurve);
      await setUserStats(interaction.guild.id, target.id, stats);
      await applyRewardsUpTo(stats.level);
      return interaction.editReply({ content: `✅ Niveau de ${target} défini à ${stats.level}` });
    }
    
    if (action === 'reset') {
      stats.xp = 0;
      stats.level = 0;
      stats.xpSinceLevel = 0;
      await setUserStats(interaction.guild.id, target.id, stats);
      return interaction.editReply({ content: `✅ XP et niveau de ${target} réinitialisés` });
    }
    
    return interaction.editReply({ content: 'Action inconnue.' });
  }
};
