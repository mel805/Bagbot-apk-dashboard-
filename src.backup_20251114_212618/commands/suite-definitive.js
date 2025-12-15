const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getEconomyConfig, updateEconomyConfig } = require('../storage/jsonStore');

module.exports = {
  name: 'suite-definitive',
  
  data: new SlashCommandBuilder()
    .setName('suite-definitive')
    .setDescription('🔒 [ADMIN] Rendre cette suite privée définitive (permanente)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    // Vérifier que l'utilisateur est admin
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: '❌ Cette commande est réservée aux administrateurs.', 
        ephemeral: true 
      });
    }

    const currentChannelId = interaction.channel.id;
    
    // Récupérer la config
    const eco = await getEconomyConfig(interaction.guild.id);
    
    console.log('[Suite Définitive] Channel ID:', currentChannelId);
    console.log('[Suite Définitive] Suites actives:', eco.suites?.active ? Object.keys(eco.suites.active).length : 0);
    
    // Chercher quelle suite correspond à ce salon
    let targetUserId = null;
    let suite = null;
    
    if (eco.suites?.active) {
      for (const [userId, suiteData] of Object.entries(eco.suites.active)) {
        console.log(`[Suite Définitive] Check user ${userId}: textId=${suiteData.textId}, voiceId=${suiteData.voiceId}`);
        console.log(`[Suite Définitive] Comparing: ${suiteData.textId} === ${currentChannelId} ? ${suiteData.textId === currentChannelId}`);
        console.log(`[Suite Définitive] Comparing: ${suiteData.voiceId} === ${currentChannelId} ? ${suiteData.voiceId === currentChannelId}`);
        
        if (suiteData.textId === currentChannelId || suiteData.voiceId === currentChannelId) {
          targetUserId = userId;
          suite = suiteData;
          console.log('[Suite Définitive] ✅ Suite trouvée!');
          break;
        }
      }
    }
    
    if (!targetUserId || !suite) {
      return interaction.reply({ 
        content: `❌ Cette commande doit être utilisée dans le salon textuel ou vocal d'une suite privée.\n\n💡 Allez dans la suite que vous voulez rendre définitive et utilisez la commande là-bas.`,
        ephemeral: true 
      });
    }
    
    // Vérifier si déjà définitive
    if (!suite.expiresAt || suite.expiresAt === null || suite.expiresAt === 0) {
      return interaction.reply({ 
        content: `⚠️  Cette suite est déjà définitive.`,
        ephemeral: true 
      });
    }

    // Rendre la suite définitive
    suite.expiresAt = null; // null = jamais d'expiration
    
    // Sauvegarder
    await updateEconomyConfig(interaction.guild.id, { suites: eco.suites });
    
    // Notifier l'utilisateur dans son salon textuel
    try {
      const textChannel = interaction.guild.channels.cache.get(suite.textId);
      if (textChannel) {
        await textChannel.send({
          content: `🎉 <@${targetUserId}> Félicitations ! Votre suite privée est maintenant **DÉFINITIVE** ! Elle ne sera jamais supprimée automatiquement.`
        });
      }
    } catch (err) {
      console.error('[Suite Définitive] Erreur notification:', err);
    }

    const textInfo = `<#${suite.textId}>`;
    const voiceInfo = `<#${suite.voiceId}>`;
    
    return interaction.reply({ 
      content: `✅ Cette suite privée est maintenant **DÉFINITIVE** !\n\n👤 Propriétaire: <@${targetUserId}>\n\n📌 Salons :\n• Texte: ${textInfo}\n• Vocal: ${voiceInfo}\n\n⏰ Expiration : **Jamais**`,
      ephemeral: true 
    });
  },
};
