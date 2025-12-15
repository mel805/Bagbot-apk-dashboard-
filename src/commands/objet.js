const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, UserSelectMenuBuilder } = require('discord.js');
const { getEconomyUser, setEconomyUser, getEconomyConfig } = require('../storage/jsonStore');

module.exports = {
  name: 'objet',

  data: new SlashCommandBuilder()
    .setName('objet')
    .setDescription('Gérer vos objets achetés')
    .setDMPermission(false),

  description: "Afficher et gérer vos objets de la boutique",
  
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      
      // Récupérer l'inventaire de l'utilisateur
      const user = await getEconomyUser(guildId, userId);
      const inventory = user.inventory || [];
      
      if (inventory.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor("#FF6B6B")
          .setTitle("🎒 Votre Inventaire")
          .setDescription("Votre inventaire est vide !\n\nAchetez des objets dans la boutique avec `/boutique`")
          .setFooter({ text: "BAG • Inventaire" })
          .setTimestamp();
        
        return interaction.editReply({ embeds: [emptyEmbed] });
      }
      
      // Créer l'embed de l'inventaire
      const eco = await getEconomyConfig(guildId);
      const currency = eco.currency?.name || 'BAG$';
      
      const inventoryEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🎒 Votre Inventaire")
        .setDescription(`Vous possédez **${inventory.length}** objet(s)\n\nSélectionnez un objet pour l'utiliser ou l'offrir :`)
        .setFooter({ text: "BAG • Inventaire" })
        .setTimestamp();
      
      // Afficher la liste des objets
      let itemsList = '';
      inventory.forEach((item, index) => {
        const itemName = item.name || item.id || 'Objet inconnu';
        const quantity = item.quantity || 1;
        const emoji = item.emoji || '🎁';
        itemsList += `${emoji} ${index + 1}. **${itemName}** ${quantity > 1 ? `(×${quantity})` : ''}\n`;
      });
      
      if (itemsList) {
        inventoryEmbed.addFields({ name: '📦 Objets', value: itemsList, inline: false });
      }
      
      // Créer le menu de sélection des objets
      const selectOptions = inventory.map((item, index) => {
        const itemName = item.name || item.id || 'Objet inconnu';
        const quantity = item.quantity || 1;
        const emojiStr = item.emoji || '🎁';
        const emojiMatch = emojiStr.match(/<a?:[\w]+:(\d+)>/);
        let emojiValue;
        if (emojiMatch) {
          emojiValue = emojiMatch[1];
        } else {
          emojiValue = emojiStr.length <= 4 ? emojiStr : '🎁';
        }
        return {
          label: `${itemName}${quantity > 1 ? ` (×${quantity})` : ''}`,
          value: `obj_${index}`,
          description: `ID: ${item.id}`,
          emoji: emojiValue
        };
      });
      
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('inventory_select')
        .setPlaceholder('Choisir un objet...')
        .addOptions(selectOptions.slice(0, 25)); // Discord limite à 25 options
      
      const selectRow = new ActionRowBuilder().addComponents(selectMenu);
      
      await interaction.editReply({ embeds: [inventoryEmbed], components: [selectRow] });
      
      // Créer le collector pour gérer la sélection
      const collector = interaction.channel.createMessageComponentCollector({
        filter: i => i.user.id === userId && (
          i.customId === 'inventory_select' || 
          i.customId.startsWith('obj_action_') || 
          i.customId.startsWith('obj_select_target_') ||
          i.customId.startsWith('obj_skip_target_') ||
          i.customId.startsWith('obj_give_target_')
        ),
        time: 300000 // 5 minutes
      });
      
      collector.on('collect', async i => {
        try {
          if (i.customId === 'inventory_select') {
            // Afficher les boutons Utiliser/Offrir
            await i.deferUpdate();
            
            const objIndex = parseInt(i.values[0].replace('obj_', ''));
            const selectedItem = inventory[objIndex];
            
            if (!selectedItem) {
              return i.followUp({ content: '❌ Objet introuvable !', ephemeral: true });
            }
            
            const itemName = selectedItem.name || selectedItem.id || 'Objet inconnu';
            
            const actionEmbed = new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle("🎁 " + itemName)
              .setDescription(`Que voulez-vous faire avec cet objet ?`)
              .addFields(
                { name: '📦 Objet', value: itemName, inline: true },
                { name: '🔢 Quantité', value: String(selectedItem.quantity || 1), inline: true }
              )
              .setFooter({ text: "BAG • Inventaire" })
              .setTimestamp();
            
            const actionRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`obj_action_use_${objIndex}`)
                .setLabel('✨ Utiliser')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId(`obj_action_give_${objIndex}`)
                .setLabel('🎁 Offrir')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId(`obj_action_cancel`)
                .setLabel('🔙 Retour')
                .setStyle(ButtonStyle.Secondary)
            );
            
            await i.editReply({ embeds: [actionEmbed], components: [actionRow] });
            
          } else if (i.customId.startsWith('obj_action_use_')) {
            // Utiliser l'objet - Étape 1: Sélectionner un membre (optionnel)
            await i.deferUpdate();
            
            const objIndex = parseInt(i.customId.replace('obj_action_use_', ''));
            
            // Recharger l'inventaire pour avoir les données les plus récentes
            const currentUser = await getEconomyUser(guildId, userId);
            const currentInventory = currentUser.inventory || [];
            const selectedItem = currentInventory[objIndex];
            
            if (!selectedItem) {
              return i.editReply({ content: '❌ Objet introuvable !', components: [] });
            }
            
            const itemName = selectedItem.name || selectedItem.id || 'Objet inconnu';
            const itemId = selectedItem.id;
            
            // Stocker l'ID de l'objet (pas l'index) pour éviter les problèmes de sync
            if (!global.objetIds) global.objetIds = new Map();
            global.objetIds.set(userId, itemId);
            
            // Demander de sélectionner un membre cible (optionnel)
            const targetEmbed = new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle("🎯 Sélectionner une Cible")
              .setDescription(`Vous allez utiliser **${itemName}**\n\n**Étape 1/2 :** Sélectionnez un membre sur qui utiliser cet objet\n*(Cliquez sur "Passer" pour ne cibler personne)*`)
              .setFooter({ text: "BAG • Inventaire" })
              .setTimestamp();
            
            const userSelectMenu = new UserSelectMenuBuilder()
              .setCustomId(`obj_select_target_${userId}`)
              .setPlaceholder('🎯 Sélectionner un membre...')
              .setMinValues(0)
              .setMaxValues(1);
            
            const skipButton = new ButtonBuilder()
              .setCustomId(`obj_skip_target_${userId}`)
              .setLabel('⏭️ Passer (personne)')
              .setStyle(ButtonStyle.Secondary);
            
            const selectRow = new ActionRowBuilder().addComponents(userSelectMenu);
            const buttonRow = new ActionRowBuilder().addComponents(skipButton);
            
            await i.editReply({ embeds: [targetEmbed], components: [selectRow, buttonRow] });
            
          } else if (i.customId.startsWith('obj_select_target_')) {
            // Membre sélectionné - Passer à la phrase
            await i.deferUpdate();
            
            // Récupérer l'ID de l'objet stocké
            const itemId = global.objetIds?.get(userId);
            if (!itemId) {
              return i.editReply({ content: '❌ Session expirée. Veuillez recommencer.', components: [] });
            }
            
            // Recharger l'inventaire
            const currentUser = await getEconomyUser(guildId, userId);
            const currentInventory = currentUser.inventory || [];
            const objIndex = currentInventory.findIndex(item => item.id === itemId);
            const selectedItem = currentInventory[objIndex];
            
            if (!selectedItem || objIndex === -1) {
              global.objetIds.delete(userId);
              return i.editReply({ content: '❌ Objet introuvable !', components: [] });
            }
            
            const targetUser = i.values[0] ? await interaction.guild.members.fetch(i.values[0]).catch(() => null) : null;
            const itemName = selectedItem.name || selectedItem.id || 'Objet inconnu';
            
            // Stocker temporairement la cible dans une Map
            if (!global.objetTargets) global.objetTargets = new Map();
            global.objetTargets.set(userId, targetUser);
            
            // Demander la phrase personnalisée
            const phraseEmbed = new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle("✨ Phrase Personnalisée")
              .setDescription(`Vous allez utiliser **${itemName}**${targetUser ? ` sur ${targetUser}` : ''}\n\n**Étape 2/2 :** Écrivez une phrase personnalisée :\n\n*Exemple : "Je bois ma potion magique !" ou "J'active mon pouvoir spécial !"*\n\nRépondez dans les 60 secondes :`)
              .setFooter({ text: "BAG • Inventaire" })
              .setTimestamp();
            
            await i.editReply({ embeds: [phraseEmbed], components: [] });
            
            // Créer un collector de messages pour la phrase
            const msgCollector = interaction.channel.createMessageCollector({
              filter: m => m.author.id === userId,
              time: 60000,
              max: 1
            });
            
            msgCollector.on('collect', async msg => {
              const customPhrase = msg.content;
              const storedTarget = global.objetTargets.get(userId);
              
              // Supprimer le message de l'utilisateur
              try {
                await msg.delete();
              } catch (_) {}
              
              // Recharger l'inventaire pour éviter les problèmes de sync
              const freshUser = await getEconomyUser(guildId, userId);
              const freshInventory = freshUser.inventory || [];
              const freshItem = freshInventory[objIndex];
              
              if (!freshItem) {
                global.objetTargets.delete(userId);
                return msg.channel.send({ content: `${interaction.user} ❌ Objet introuvable dans votre inventaire !` });
              }
              
              // Réduire la quantité ou supprimer l'objet
              if (freshItem.quantity && freshItem.quantity > 1) {
                freshItem.quantity--;
              } else {
                freshInventory.splice(objIndex, 1);
              }
              
              freshUser.inventory = freshInventory;
              await setEconomyUser(guildId, userId, freshUser);
              
              // Message public visible par tous
              const publicUseEmbed = new EmbedBuilder()
                .setColor("#57F287")
                .setTitle("✨ Objet Utilisé")
                .setDescription(`${interaction.user} a utilisé **${itemName}**${storedTarget ? ` sur ${storedTarget}` : ''} !\n\n💬 *"${customPhrase}"*`)
                .addFields(
                  { name: '🎁 Objet', value: itemName, inline: true },
                  { name: '👤 Utilisateur', value: interaction.user.username, inline: true }
                );
              
              if (storedTarget) {
                publicUseEmbed.addFields({ name: '🎯 Cible', value: storedTarget.user.username, inline: true });
              }
              
              publicUseEmbed.setFooter({ text: "BAG • Inventaire" }).setTimestamp();
              
              // Envoyer dans le channel (visible par tous) avec mentions
              let mentionContent = `${interaction.user}`;
              if (storedTarget) mentionContent += ` ➜ ${storedTarget}`;
              
              await interaction.channel.send({ content: mentionContent, embeds: [publicUseEmbed] });
              
              // Confirmation éphémère
              await i.followUp({ content: '✅ Objet utilisé avec succès ! Le message a été publié dans le channel.', ephemeral: true }).catch(() => {});
              
              // Nettoyer
              global.objetTargets.delete(userId);
              collector.stop();
            });
            
            msgCollector.on('end', (collected, reason) => {
              if (reason === 'time' && collected.size === 0) {
                global.objetTargets.delete(userId);
                i.followUp({ content: '⏱️ Temps écoulé. Action annulée.', ephemeral: true }).catch(() => {});
              }
            });
            
          } else if (i.customId.startsWith('obj_skip_target_')) {
            // Passer la sélection de membre - Aller directement à la phrase
            await i.deferUpdate();
            
            // Récupérer l'ID de l'objet stocké
            const itemId = global.objetIds?.get(userId);
            if (!itemId) {
              return i.editReply({ content: '❌ Session expirée. Veuillez recommencer.', components: [] });
            }
            
            // Recharger l'inventaire
            const currentUser = await getEconomyUser(guildId, userId);
            const currentInventory = currentUser.inventory || [];
            const objIndex = currentInventory.findIndex(item => item.id === itemId);
            const selectedItem = currentInventory[objIndex];
            
            if (!selectedItem || objIndex === -1) {
              global.objetIds.delete(userId);
              return i.editReply({ content: '❌ Objet introuvable !', components: [] });
            }
            
            const itemName = selectedItem.name || selectedItem.id || 'Objet inconnu';
            
            // Pas de cible
            if (!global.objetTargets) global.objetTargets = new Map();
            global.objetTargets.set(userId, null);
            
            // Demander la phrase personnalisée
            const phraseEmbed = new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle("✨ Phrase Personnalisée")
              .setDescription(`Vous allez utiliser **${itemName}**\n\n**Étape 2/2 :** Écrivez une phrase personnalisée :\n\n*Exemple : "Je bois ma potion magique !" ou "J'active mon pouvoir spécial !"*\n\nRépondez dans les 60 secondes :`)
              .setFooter({ text: "BAG • Inventaire" })
              .setTimestamp();
            
            await i.editReply({ embeds: [phraseEmbed], components: [] });
            
            // Créer un collector de messages pour la phrase
            const msgCollector = interaction.channel.createMessageCollector({
              filter: m => m.author.id === userId,
              time: 60000,
              max: 1
            });
            
            msgCollector.on('collect', async msg => {
              const customPhrase = msg.content;
              
              // Supprimer le message de l'utilisateur
              try {
                await msg.delete();
              } catch (_) {}
              
              // Recharger l'inventaire pour éviter les problèmes de sync
              const freshUser = await getEconomyUser(guildId, userId);
              const freshInventory = freshUser.inventory || [];
              const freshItem = freshInventory[objIndex];
              
              if (!freshItem) {
                global.objetTargets.delete(userId);
                return msg.channel.send({ content: `${interaction.user} ❌ Objet introuvable dans votre inventaire !` });
              }
              
              // Réduire la quantité ou supprimer l'objet
              if (freshItem.quantity && freshItem.quantity > 1) {
                freshItem.quantity--;
              } else {
                freshInventory.splice(objIndex, 1);
              }
              
              freshUser.inventory = freshInventory;
              await setEconomyUser(guildId, userId, freshUser);
              
              // Message public visible par tous
              const publicUseEmbed = new EmbedBuilder()
                .setColor("#57F287")
                .setTitle("✨ Objet Utilisé")
                .setDescription(`${interaction.user} a utilisé **${itemName}** !\n\n💬 *"${customPhrase}"*`)
                .addFields(
                  { name: '🎁 Objet', value: itemName, inline: true },
                  { name: '👤 Utilisateur', value: interaction.user.username, inline: true }
                )
                .setFooter({ text: "BAG • Inventaire" })
                .setTimestamp();
              
              // Envoyer dans le channel (visible par tous)
              await interaction.channel.send({ content: `${interaction.user}`, embeds: [publicUseEmbed] });
              
              // Confirmation éphémère
              await i.followUp({ content: '✅ Objet utilisé avec succès ! Le message a été publié dans le channel.', ephemeral: true }).catch(() => {});
              
              // Nettoyer
              global.objetTargets.delete(userId);
              collector.stop();
            });
            
            msgCollector.on('end', (collected, reason) => {
              if (reason === 'time' && collected.size === 0) {
                global.objetTargets.delete(userId);
                i.followUp({ content: '⏱️ Temps écoulé. Action annulée.', ephemeral: true }).catch(() => {});
              }
            });
            
          } else if (i.customId.startsWith('obj_action_give_')) {
            // Offrir l'objet - Étape 1: Sélectionner le destinataire
            await i.deferUpdate();
            
            const objIndex = parseInt(i.customId.replace('obj_action_give_', ''));
            
            // Recharger l'inventaire pour avoir les données les plus récentes
            const currentUser = await getEconomyUser(guildId, userId);
            const currentInventory = currentUser.inventory || [];
            const selectedItem = currentInventory[objIndex];
            
            if (!selectedItem) {
              return i.editReply({ content: '❌ Objet introuvable !', components: [] });
            }
            
            const itemName = selectedItem.name || selectedItem.id || 'Objet inconnu';
            const itemId = selectedItem.id;
            
            // Stocker l'ID de l'objet pour éviter les problèmes de sync
            if (!global.objetGiveIds) global.objetGiveIds = new Map();
            global.objetGiveIds.set(userId, itemId);
            
            const giveEmbed = new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle("🎁 Offrir un Objet")
              .setDescription(`Vous allez offrir **${itemName}**\n\nSélectionnez le membre à qui vous souhaitez offrir cet objet :`)
              .setFooter({ text: "BAG • Inventaire" })
              .setTimestamp();
            
            const userSelectMenu = new UserSelectMenuBuilder()
              .setCustomId(`obj_give_target_${userId}`)
              .setPlaceholder('🎯 Sélectionner un membre...')
              .setMinValues(1)
              .setMaxValues(1);
            
            const selectRow = new ActionRowBuilder().addComponents(userSelectMenu);
            
            await i.editReply({ embeds: [giveEmbed], components: [selectRow] });
            
          } else if (i.customId.startsWith('obj_give_target_')) {
            // Destinataire sélectionné - Finaliser l'offre
            await i.deferUpdate();
            
            // Récupérer l'ID de l'objet stocké
            const itemId = global.objetGiveIds?.get(userId);
            if (!itemId) {
              return i.editReply({ content: '❌ Session expirée. Veuillez recommencer.', components: [] });
            }
            
            const targetUserId = i.values[0];
            const mentioned = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            
            if (!mentioned) {
              global.objetGiveIds.delete(userId);
              return i.editReply({ content: '❌ Utilisateur introuvable !', components: [] });
            }
            
            if (mentioned.user.bot) {
              global.objetGiveIds.delete(userId);
              return i.editReply({ content: '❌ Vous ne pouvez pas offrir un objet à un bot !', components: [] });
            }
            
            if (mentioned.id === userId) {
              global.objetGiveIds.delete(userId);
              return i.editReply({ content: '❌ Vous ne pouvez pas vous offrir un objet à vous-même !', components: [] });
            }
              
            // Recharger l'inventaire actuel pour éviter les problèmes de sync
            const freshUser = await getEconomyUser(guildId, userId);
            const freshInventory = freshUser.inventory || [];
            const objIndex = freshInventory.findIndex(item => item.id === itemId);
            const freshItem = freshInventory[objIndex];
            
            if (!freshItem || objIndex === -1) {
              global.objetGiveIds.delete(userId);
              return i.editReply({ content: '❌ Objet introuvable dans votre inventaire !', components: [] });
            }
            
            const itemName = freshItem.name || freshItem.id || 'Objet inconnu';
            
            // Transférer l'objet
            const targetUser = await getEconomyUser(guildId, mentioned.id);
            if (!targetUser.inventory) targetUser.inventory = [];
            
            // Réduire la quantité ou supprimer l'objet de l'inventaire du donneur
            if (freshItem.quantity && freshItem.quantity > 1) {
              freshItem.quantity--;
              // Ajouter 1 exemplaire à la cible
              const existingItem = targetUser.inventory.find(it => it.id === freshItem.id);
              if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
              } else {
                targetUser.inventory.push({ ...freshItem, quantity: 1 });
              }
            } else {
              // Supprimer complètement de l'inventaire du donneur
              freshInventory.splice(objIndex, 1);
              // Ajouter à la cible
              const existingItem = targetUser.inventory.find(it => it.id === freshItem.id);
              if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
              } else {
                targetUser.inventory.push({ ...freshItem, quantity: 1 });
              }
            }
            
            freshUser.inventory = freshInventory;
            await setEconomyUser(guildId, userId, freshUser);
            await setEconomyUser(guildId, mentioned.id, targetUser);
            
            // Message PUBLIC visible par tous dans le channel
            const publicGiveEmbed = new EmbedBuilder()
              .setColor("#FFD700")
              .setTitle("🎁 Cadeau Offert")
              .setDescription(`${interaction.user} a offert **${itemName}** à ${mentioned} !\n\n✨ Quelle générosité !`)
              .addFields(
                { name: '🎁 Objet', value: itemName, inline: true },
                { name: '👤 De', value: interaction.user.username, inline: true },
                { name: '🎯 À', value: mentioned.user.username, inline: true }
              )
              .setFooter({ text: "BAG • Inventaire" })
              .setTimestamp();
            
            // Envoyer dans le channel (visible par tous) avec mention
            await interaction.channel.send({ content: `${interaction.user} ➜ ${mentioned}`, embeds: [publicGiveEmbed] });
            
            // Confirmation éphémère
            await i.followUp({ content: '✅ Objet offert avec succès ! Le message a été publié dans le channel.', ephemeral: true });
            
            // Nettoyer
            global.objetGiveIds.delete(userId);
            collector.stop();
            
          } else if (i.customId === 'obj_action_cancel') {
            // Retour à la liste
            await i.deferUpdate();
            collector.stop();
            
            // Recharger l'inventaire
            const updatedUser = await getEconomyUser(guildId, userId);
            const updatedInventory = updatedUser.inventory || [];
            
            if (updatedInventory.length === 0) {
              const emptyEmbed = new EmbedBuilder()
                .setColor("#FF6B6B")
                .setTitle("🎒 Votre Inventaire")
                .setDescription("Votre inventaire est vide !\n\nAchetez des objets dans la boutique avec `/boutique`")
                .setFooter({ text: "BAG • Inventaire" })
                .setTimestamp();
              
              return i.editReply({ embeds: [emptyEmbed], components: [] });
            }
            
            // Recréer l'affichage
            const newInventoryEmbed = new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle("🎒 Votre Inventaire")
              .setDescription(`Vous possédez **${updatedInventory.length}** objet(s)\n\nSélectionnez un objet pour l'utiliser ou l'offrir :`)
              .setFooter({ text: "BAG • Inventaire" })
              .setTimestamp();
            
            let newItemsList = '';
            updatedInventory.forEach((item, index) => {
              const itemName = item.name || item.id || 'Objet inconnu';
              const quantity = item.quantity || 1;
              const emoji = item.emoji || '🎁';
              newItemsList += `${emoji} ${index + 1}. **${itemName}** ${quantity > 1 ? `(×${quantity})` : ''}\n`;
            });
            
            if (newItemsList) {
              newInventoryEmbed.addFields({ name: '📦 Objets', value: newItemsList, inline: false });
            }
            
            const newSelectOptions = updatedInventory.map((item, index) => {
              const itemName = item.name || item.id || 'Objet inconnu';
              const quantity = item.quantity || 1;
              const emojiStr = item.emoji || '🎁';
              const emojiMatch = emojiStr.match(/<a?:[\w]+:(\d+)>/);
              let emojiValue;
              if (emojiMatch) {
                emojiValue = emojiMatch[1];
              } else {
                emojiValue = emojiStr.length <= 4 ? emojiStr : '🎁';
              }
              return {
                label: `${itemName}${quantity > 1 ? ` (×${quantity})` : ''}`,
                value: `obj_${index}`,
                description: `ID: ${item.id}`,
                emoji: emojiValue
              };
            });
            
            const newSelectMenu = new StringSelectMenuBuilder()
              .setCustomId('inventory_select')
              .setPlaceholder('Choisir un objet...')
              .addOptions(newSelectOptions.slice(0, 25));
            
            const newSelectRow = new ActionRowBuilder().addComponents(newSelectMenu);
            
            await i.editReply({ embeds: [newInventoryEmbed], components: [newSelectRow] });
          }
        } catch (err) {
          console.error('[OBJET] Erreur dans collector:', err);
          await i.reply({ content: '❌ Une erreur est survenue.', ephemeral: true }).catch(() => {});
        }
      });
      
      collector.on('end', () => {
        // Nettoyer après expiration
        interaction.editReply({ components: [] }).catch(() => {});
      });
      
    } catch (error) {
      console.error('[OBJET] Erreur:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: '❌ Une erreur est survenue lors de l\'affichage de votre inventaire.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'affichage de votre inventaire.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
