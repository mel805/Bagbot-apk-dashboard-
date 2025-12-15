const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const listLocalBackups = require('./listLocalBackups');

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

module.exports = async function showRestoreMenu(interaction, page = 0) {
  try { console.log('[RestoreMenu] start', { deferred: interaction.deferred, replied: interaction.replied, page }); } catch (_) {}
  
  try { 
    if (!(interaction.deferred || interaction.replied)) { 
      await interaction.reply({ content: '⏳ Chargement des sauvegardes...', ephemeral: true }); 
    } 
  } catch (_) {}
  
  // Filtrer par serveur actuel pour sécuriser les restaurations
  const guildId = interaction.guild?.id || null;
  const allBackups = await listLocalBackups(guildId);
  try { console.log('[RestoreMenu] backups', Array.isArray(allBackups) ? allBackups.length : 'N/A', 'pour serveur', guildId); } catch (_) {}
  
  if (!Array.isArray(allBackups) || allBackups.length === 0) {
    const guildName = interaction.guild?.name || 'ce serveur';
    const message = guildId 
      ? `Aucune sauvegarde trouvée pour le serveur **${guildName}**.\n\n💡 Les sauvegardes sont spécifiques à chaque serveur pour votre sécurité.`
      : 'Aucune sauvegarde trouvée.';
    
    try {
      if (interaction.deferred || interaction.replied) {
        return await interaction.editReply({ content: message, embeds: [], components: [] });
      } else {
        return await interaction.reply({ content: message, ephemeral: true });
      }
    } catch (e) {
      try { await interaction.editReply({ content: '❌ Erreur restauration.' }); } catch (_) {}
      return;
    }
  }
  
  // Pagination : 25 par page (limite Discord)
  const ITEMS_PER_PAGE = 25;
  const totalPages = Math.ceil(allBackups.length / ITEMS_PER_PAGE);
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));
  const startIdx = currentPage * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, allBackups.length);
  const backups = allBackups.slice(startIdx, endIdx);
  
  // Créer des valeurs uniques pour chaque option et stocker le mapping
  const usedValues = new Set();
  const backupMapping = {};
  
  const options = backups.map((b, index) => {
    const globalIndex = startIdx + index;
    const rawLabel = String(b.displayName || b.filename || 'Backup');
    const label = rawLabel.slice(0, 100);
    const descRaw = `${Math.round(Number(b.size||0)/1024)} KB`;
    const description = descRaw.slice(0, 100);
    
    // Utiliser le filename comme valeur si unique, sinon créer une clé unique
    let value = String(b.filename || '').slice(0, 90); // Laisser de la place pour l'index
    if (!value || usedValues.has(value)) {
      value = `bkp_${globalIndex}_${Math.random().toString(36).slice(2, 8)}`;
    }
    
    // S'assurer que la valeur est vraiment unique
    let finalValue = value;
    let counter = 0;
    while (usedValues.has(finalValue)) {
      finalValue = `${value}_${counter}`;
      counter++;
    }
    
    usedValues.add(finalValue);
    backupMapping[finalValue] = b; // Stocker le mapping
    
    return { label, description, value: finalValue };
  });
  
  // Stocker le mapping globalement pour l'utiliser dans restore.js
  global.__restoreBackupMapping = backupMapping;
  
  const select = new StringSelectMenuBuilder()
    .setCustomId('restore_file_select')
    .setPlaceholder('Choisissez une sauvegarde à restaurer')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(options);
  
  const rows = [new ActionRowBuilder().addComponents(select)];
  
  // Ajouter les boutons de pagination si nécessaire
  if (totalPages > 1) {
    const navButtons = [];
    
    if (currentPage > 0) {
      navButtons.push(
        new ButtonBuilder()
          .setCustomId(`restore_page_${currentPage - 1}`)
          .setLabel('◀️ Précédent')
          .setStyle(ButtonStyle.Primary)
      );
    }
    
    navButtons.push(
      new ButtonBuilder()
        .setCustomId('restore_page_info')
        .setLabel(`Page ${currentPage + 1}/${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
    
    if (currentPage < totalPages - 1) {
      navButtons.push(
        new ButtonBuilder()
          .setCustomId(`restore_page_${currentPage + 1}`)
          .setLabel('Suivant ▶️')
          .setStyle(ButtonStyle.Primary)
      );
    }
    
    rows.push(new ActionRowBuilder().addComponents(navButtons));
  }
  
  
  // Compter par type
  const externalCount = allBackups.filter(b => b.type === 'external').length;
  const guildCount = allBackups.filter(b => b.type === 'manual').length;
  const globalCount = allBackups.filter(b => b.type === 'global').length;
  const localCount = allBackups.filter(b => b.type === 'local').length;
  const safetyCount = allBackups.filter(b => b.type === 'safety').length;
  
  const guildName = interaction.guild?.name || 'Serveur actuel';
  const embed = new EmbedBuilder()
    .setTitle('🔄 Restauration — Choisir une sauvegarde')
    .setDescription(
      `**Serveur** : ${guildName}\\n` +
      `**Total : ${allBackups.length} sauvegardes** pour ce serveur\\n\\n` +
      `⏰ Externes : ${externalCount} | 🌐 Globaux : ${globalCount}\\n` +
      `👤 Per-guild : ${guildCount} | 💾 Locaux : ${localCount} | 🛡️ Sécurité : ${safetyCount}\\n\\n` +
      `Affichage : ${startIdx + 1}-${endIdx} sur ${allBackups.length}\\n\\n` +
      `🔒 Toutes les sources de backups sont maintenant accessibles.`
    )
    .setColor(0x1e88e5);
  let sentOk = false;
  try { 
    await interaction.editReply({ content: null, embeds: [embed], components: rows }); 
    sentOk = true; 
  } catch (_) {}
  
  if (!sentOk) {
    try {
      if (!(interaction.deferred || interaction.replied)) {
        await interaction.reply({ embeds: [embed], components: rows, ephemeral: true });
      } else {
        await interaction.followUp({ embeds: [embed], components: rows, ephemeral: true });
      }
      sentOk = true;
    } catch (e) { 
      try { console.error('[RestoreMenu] final fail', e?.message||e); } catch (_) {} 
    }
  }
  
  if (!sentOk) {
    try { await interaction.editReply({ content: '❌ Erreur restauration.', embeds: [], components: [] }); } catch (_) {}
  }
};
