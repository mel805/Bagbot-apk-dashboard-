const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ChannelSelectMenuBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

/**
 * Module de gestion des messages de bienvenue et de départ
 * Aperçu automatique après validation des modals
 */

// ===== HANDLERS WELCOME =====

async function handleWelcomeConfigureButton(interaction) {
  const { readConfig } = require("../storage/jsonStore");
  const cfg = await readConfig();
  const welcomeConfig = cfg.guilds?.[interaction.guild.id]?.welcome || {};
  
  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("👋 Configuration Bienvenue")
    .setDescription("Configurez les messages de bienvenue pour votre serveur.")
    .addFields(
      { name: "📊 État", value: welcomeConfig.enabled ? "✅ Activé" : "❌ Désactivé", inline: true },
      { name: "📍 Salon", value: welcomeConfig.channelId ? `<#${welcomeConfig.channelId}>` : "Non configuré", inline: true },
      { name: "💬 Message", value: welcomeConfig.message ? "✅ Configuré" : "Non configuré", inline: true },
      { name: "🎨 Embed", value: welcomeConfig.embedEnabled ? "✅ Activé" : "❌ Désactivé", inline: true }
    );
    
  const select = new StringSelectMenuBuilder()
    .setCustomId("welcome_action_select")
    .setPlaceholder("Choisir une option…")
    .addOptions([
      { label: welcomeConfig.enabled ? "Désactiver" : "Activer", value: "toggle", emoji: welcomeConfig.enabled ? "❌" : "✅", description: "Activer/désactiver les messages de bienvenue" },
      { label: "Configurer le salon", value: "channel", emoji: "📍", description: "Choisir le salon de bienvenue" },
      { label: "Configurer le message", value: "message", emoji: "💬", description: "Personnaliser le message de bienvenue" },
      { label: "Configurer l'embed", value: "embed", emoji: "🎨", description: "Configurer l'embed de bienvenue" },
      { label: "Image embed (bas)", value: "embed_image", emoji: "🖼️", description: "Définir l'image en bas de l'embed" },
      { label: "Toggle Embed", value: "toggle_embed", emoji: "🔄", description: "Activer/désactiver l'embed" }
    ]);
    
  const row1 = new ActionRowBuilder().addComponents(select);
  const backBtn = new ButtonBuilder().setCustomId("welcomegoodbye_back_to_section").setLabel("← Retour").setStyle(ButtonStyle.Secondary);
  const row2 = new ActionRowBuilder().addComponents(backBtn);
  
  return interaction.update({ embeds: [embed], components: [row1, row2] });
}

async function handleWelcomeActionSelect(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const action = interaction.values[0];
  const cfg = await readConfig();
  
  if (!cfg.guilds) cfg.guilds = {};
  if (!cfg.guilds[interaction.guild.id]) cfg.guilds[interaction.guild.id] = {};
  if (!cfg.guilds[interaction.guild.id].welcome) cfg.guilds[interaction.guild.id].welcome = {};
  
  const welcomeConfig = cfg.guilds[interaction.guild.id].welcome;
  
  if (action === 'toggle') {
    welcomeConfig.enabled = !welcomeConfig.enabled;
    await writeConfig(cfg);
    const embed = new EmbedBuilder().setColor(welcomeConfig.enabled ? '#00FF00' : '#FF0000').setTitle(welcomeConfig.enabled ? '✅ Bienvenue Activé' : '❌ Bienvenue Désactivé').setDescription(`Les messages de bienvenue sont maintenant **${welcomeConfig.enabled ? 'activés' : 'désactivés'}**.`);
    return interaction.update({ embeds: [embed], components: [] });
  }
  
  if (action === 'channel') {
    const channelSelect = new ChannelSelectMenuBuilder().setCustomId('welcome_channel_select').setPlaceholder('Choisir le salon de bienvenue...').setChannelTypes([0]);
    const row = new ActionRowBuilder().addComponents(channelSelect);
    return interaction.reply({ content: '📍 **Sélectionnez le salon de bienvenue :**', components: [row], ephemeral: true });
  }
  
  if (action === 'message') {
    const modal = new ModalBuilder().setCustomId('welcome_message_modal').setTitle('Message de Bienvenue');
    const messageInput = new TextInputBuilder().setCustomId('message').setLabel('Message').setStyle(TextInputStyle.Paragraph).setPlaceholder('{user} = mention, {server} = nom serveur, {memberCount} = nb membres').setMaxLength(2000).setRequired(true);
    if (typeof welcomeConfig.message === 'string' && welcomeConfig.message) messageInput.setValue(welcomeConfig.message);
    const messageImageInput = new TextInputBuilder().setCustomId('messageImage').setLabel('URL Image du message (optionnel)').setStyle(TextInputStyle.Short).setPlaceholder('https://exemple.com/image.png').setRequired(false);
    if (typeof welcomeConfig.messageImage === 'string' && welcomeConfig.messageImage) messageImageInput.setValue(welcomeConfig.messageImage);
    modal.addComponents(new ActionRowBuilder().addComponents(messageInput), new ActionRowBuilder().addComponents(messageImageInput));
    return interaction.showModal(modal);
  }
  
  if (action === 'embed') {
    const modal = new ModalBuilder().setCustomId('welcome_embed_modal').setTitle('Configuration Embed');
    const titleInput = new TextInputBuilder().setCustomId('title').setLabel('Titre').setStyle(TextInputStyle.Short).setMaxLength(256).setRequired(false);
    if (typeof welcomeConfig.embedTitle === 'string' && welcomeConfig.embedTitle) titleInput.setValue(welcomeConfig.embedTitle);
    const descInput = new TextInputBuilder().setCustomId('description').setLabel('Description').setStyle(TextInputStyle.Paragraph).setMaxLength(2000).setRequired(false);
    if (typeof welcomeConfig.embedDescription === 'string' && welcomeConfig.embedDescription) descInput.setValue(welcomeConfig.embedDescription);
    const colorInput = new TextInputBuilder().setCustomId('color').setLabel('Couleur (hex ou nom)').setStyle(TextInputStyle.Short).setPlaceholder('#5865F2').setRequired(false);
    if (typeof welcomeConfig.embedColor === 'string' && welcomeConfig.embedColor) colorInput.setValue(welcomeConfig.embedColor);
    const thumbnailInput = new TextInputBuilder().setCustomId('thumbnail').setLabel('URL Thumbnail').setStyle(TextInputStyle.Short).setPlaceholder('https://...').setRequired(false);
    if (typeof welcomeConfig.embedThumbnail === 'string' && welcomeConfig.embedThumbnail) thumbnailInput.setValue(welcomeConfig.embedThumbnail);
    const footerInput = new TextInputBuilder().setCustomId('footer').setLabel('Footer').setStyle(TextInputStyle.Short).setMaxLength(256).setRequired(false);
    if (typeof welcomeConfig.embedFooter === 'string' && welcomeConfig.embedFooter) footerInput.setValue(welcomeConfig.embedFooter);
    modal.addComponents(new ActionRowBuilder().addComponents(titleInput), new ActionRowBuilder().addComponents(descInput), new ActionRowBuilder().addComponents(colorInput), new ActionRowBuilder().addComponents(thumbnailInput), new ActionRowBuilder().addComponents(footerInput));
    return interaction.showModal(modal);
  }
  
  if (action === 'embed_image') {
    const modal = new ModalBuilder().setCustomId('welcome_embed_image_modal').setTitle('Image embed');
    const imageInput = new TextInputBuilder().setCustomId('embedImage').setLabel('URL image (bas embed)').setStyle(TextInputStyle.Short).setPlaceholder('https://...').setRequired(false);
    if (typeof welcomeConfig.embedImage === 'string' && welcomeConfig.embedImage) imageInput.setValue(welcomeConfig.embedImage);
    modal.addComponents(new ActionRowBuilder().addComponents(imageInput));
    return interaction.showModal(modal);
  }
  
  if (action === 'toggle_embed') {
    welcomeConfig.embedEnabled = !welcomeConfig.embedEnabled;
    await writeConfig(cfg);
    const embed = new EmbedBuilder().setColor(welcomeConfig.embedEnabled ? '#00FF00' : '#FF0000').setTitle(welcomeConfig.embedEnabled ? '✅ Embed Activé' : '❌ Embed Désactivé').setDescription(`L'embed de bienvenue est maintenant **${welcomeConfig.embedEnabled ? 'activé' : 'désactivé'}**.`);
    return interaction.update({ embeds: [embed], components: [] });
  }
}

async function handleWelcomeChannelSelect(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const cfg = await readConfig();
  const channel = interaction.channels.first();
  if (!cfg.guilds[interaction.guild.id].welcome) cfg.guilds[interaction.guild.id].welcome = {};
  cfg.guilds[interaction.guild.id].welcome.channelId = channel.id;
  await writeConfig(cfg);
  const embed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Salon Configuré').setDescription(`Le salon de bienvenue est maintenant ${channel}.`);
  return interaction.update({ content: '', embeds: [embed], components: [] });
}

async function handleWelcomeMessageModal(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const cfg = await readConfig();
  const message = interaction.fields.getTextInputValue('message');
  const messageImage = interaction.fields.getTextInputValue('messageImage');
  if (!cfg.guilds[interaction.guild.id].welcome) cfg.guilds[interaction.guild.id].welcome = {};
  cfg.guilds[interaction.guild.id].welcome.message = message;
  if (messageImage) { cfg.guilds[interaction.guild.id].welcome.messageImage = messageImage; } else { delete cfg.guilds[interaction.guild.id].welcome.messageImage; }
  await writeConfig(cfg);
  await interaction.deferReply({ ephemeral: true });
  const memberCount = interaction.guild.memberCount || 0;
  const replacements = { '{user}': `<@${interaction.user.id}>`, '{username}': interaction.user.username, '{server}': interaction.guild.name, '{memberCount}': memberCount.toString() };
  let previewMessage = message;
  Object.entries(replacements).forEach(([key, value]) => { previewMessage = previewMessage.replace(new RegExp(key, 'g'), value); });
  const embed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Message Configuré').setDescription(`Le message de bienvenue a été mis à jour.\n\n**📋 Aperçu :**\n${previewMessage}`);
  if (messageImage) { embed.setImage(messageImage); embed.addFields({ name: '🖼️ Image', value: 'Image jointe au message' }); }
  return interaction.editReply({ embeds: [embed] });
}

async function handleWelcomeEmbedModal(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const cfg = await readConfig();
  const title = interaction.fields.getTextInputValue('title');
  const description = interaction.fields.getTextInputValue('description');
  const color = interaction.fields.getTextInputValue('color');
  const thumbnail = interaction.fields.getTextInputValue('thumbnail');
  const footer = interaction.fields.getTextInputValue('footer');
  if (!cfg.guilds[interaction.guild.id].welcome) cfg.guilds[interaction.guild.id].welcome = {};
  const welcomeConfig = cfg.guilds[interaction.guild.id].welcome;
  if (title) welcomeConfig.embedTitle = title; else delete welcomeConfig.embedTitle;
  if (description) welcomeConfig.embedDescription = description; else delete welcomeConfig.embedDescription;
  if (color) welcomeConfig.embedColor = color; else delete welcomeConfig.embedColor;
  if (thumbnail) welcomeConfig.embedThumbnail = thumbnail; else delete welcomeConfig.embedThumbnail;
  if (footer) welcomeConfig.embedFooter = footer; else delete welcomeConfig.embedFooter;
  await writeConfig(cfg);
  await interaction.deferReply({ ephemeral: true });
  const memberCount = interaction.guild.memberCount || 0;
  const replacements = { '{user}': `<@${interaction.user.id}>`, '{username}': interaction.user.username, '{server}': interaction.guild.name, '{memberCount}': memberCount.toString() };
  let previewTitle = title || '', previewDesc = description || '', previewFooter = footer || '';
  Object.entries(replacements).forEach(([key, value]) => { previewTitle = previewTitle.replace(new RegExp(key, 'g'), value); previewDesc = previewDesc.replace(new RegExp(key, 'g'), value); previewFooter = previewFooter.replace(new RegExp(key, 'g'), value); });
  const confirmEmbed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Embed Configuré').setDescription('Les paramètres de l\'embed ont été mis à jour. Voici un aperçu :');
  const previewEmbed = new EmbedBuilder().setColor(color || '#5865F2');
  if (previewTitle) previewEmbed.setTitle(previewTitle);
  if (previewDesc) previewEmbed.setDescription(previewDesc);
  if (previewFooter) previewEmbed.setFooter({ text: previewFooter });
  if (thumbnail) previewEmbed.setThumbnail(thumbnail);
  if (welcomeConfig.embedImage) previewEmbed.setImage(welcomeConfig.embedImage);
  return interaction.editReply({ embeds: [confirmEmbed, previewEmbed] });
}

async function handleWelcomeEmbedImageModal(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const cfg = await readConfig();
  const embedImage = interaction.fields.getTextInputValue('embedImage');
  if (!cfg.guilds[interaction.guild.id].welcome) cfg.guilds[interaction.guild.id].welcome = {};
  if (embedImage) { cfg.guilds[interaction.guild.id].welcome.embedImage = embedImage; } else { delete cfg.guilds[interaction.guild.id].welcome.embedImage; }
  await writeConfig(cfg);
  await interaction.deferReply({ ephemeral: true });
  const embed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Image Configurée').setDescription('L\'image de l\'embed a été mise à jour.');
  if (embedImage) { embed.setImage(embedImage); embed.addFields({ name: '📋 Aperçu', value: 'Image affichée ci-dessous' }); }
  return interaction.editReply({ embeds: [embed] });
}

// ===== HANDLERS GOODBYE =====

async function handleGoodbyeConfigureButton(interaction) {
  const { readConfig } = require("../storage/jsonStore");
  const cfg = await readConfig();
  const goodbyeConfig = cfg.guilds?.[interaction.guild.id]?.goodbye || {};
  
  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("👋 Configuration Départ")
    .setDescription("Configurez les messages de départ pour votre serveur.")
    .addFields(
      { name: "📊 État", value: goodbyeConfig.enabled ? "✅ Activé" : "❌ Désactivé", inline: true },
      { name: "📍 Salon", value: goodbyeConfig.channelId ? `<#${goodbyeConfig.channelId}>` : "Non configuré", inline: true },
      { name: "💬 Message", value: goodbyeConfig.message ? "✅ Configuré" : "Non configuré", inline: true },
      { name: "🎨 Embed", value: goodbyeConfig.embedEnabled ? "✅ Activé" : "❌ Désactivé", inline: true }
    );
    
  const select = new StringSelectMenuBuilder()
    .setCustomId("goodbye_action_select")
    .setPlaceholder("Choisir une option…")
    .addOptions([
      { label: goodbyeConfig.enabled ? "Désactiver" : "Activer", value: "toggle", emoji: goodbyeConfig.enabled ? "❌" : "✅", description: "Activer/désactiver les messages de départ" },
      { label: "Configurer le salon", value: "channel", emoji: "📍", description: "Choisir le salon de départ" },
      { label: "Configurer le message", value: "message", emoji: "💬", description: "Personnaliser le message de départ" },
      { label: "Configurer l'embed", value: "embed", emoji: "🎨", description: "Configurer l'embed de départ" },
      { label: "Image embed (bas)", value: "embed_image", emoji: "🖼️", description: "Définir l'image en bas de l'embed" },
      { label: "Toggle Embed", value: "toggle_embed", emoji: "🔄", description: "Activer/désactiver l'embed" }
    ]);
    
  const row1 = new ActionRowBuilder().addComponents(select);
  const backBtn = new ButtonBuilder().setCustomId("welcomegoodbye_back_to_section").setLabel("← Retour").setStyle(ButtonStyle.Secondary);
  const row2 = new ActionRowBuilder().addComponents(backBtn);
  
  return interaction.update({ embeds: [embed], components: [row1, row2] });
}

async function handleGoodbyeActionSelect(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const action = interaction.values[0];
  const cfg = await readConfig();
  
  if (!cfg.guilds) cfg.guilds = {};
  if (!cfg.guilds[interaction.guild.id]) cfg.guilds[interaction.guild.id] = {};
  if (!cfg.guilds[interaction.guild.id].goodbye) cfg.guilds[interaction.guild.id].goodbye = {};
  
  const goodbyeConfig = cfg.guilds[interaction.guild.id].goodbye;
  
  if (action === 'toggle') {
    goodbyeConfig.enabled = !goodbyeConfig.enabled;
    await writeConfig(cfg);
    const embed = new EmbedBuilder().setColor(goodbyeConfig.enabled ? '#00FF00' : '#FF0000').setTitle(goodbyeConfig.enabled ? '✅ Départ Activé' : '❌ Départ Désactivé').setDescription(`Les messages de départ sont maintenant **${goodbyeConfig.enabled ? 'activés' : 'désactivés'}**.`);
    return interaction.update({ embeds: [embed], components: [] });
  }
  
  if (action === 'channel') {
    const channelSelect = new ChannelSelectMenuBuilder().setCustomId('goodbye_channel_select').setPlaceholder('Choisir le salon de départ...').setChannelTypes([0]);
    const row = new ActionRowBuilder().addComponents(channelSelect);
    return interaction.reply({ content: '📍 **Sélectionnez le salon de départ :**', components: [row], ephemeral: true });
  }
  
  if (action === 'message') {
    const modal = new ModalBuilder().setCustomId('goodbye_message_modal').setTitle('Message de Depart');
    const messageInput = new TextInputBuilder().setCustomId('message').setLabel('Message').setStyle(TextInputStyle.Paragraph).setPlaceholder('{user} = mention, {server} = nom serveur, {memberCount} = nb membres').setMaxLength(2000).setRequired(true);
    if (typeof goodbyeConfig.message === 'string' && goodbyeConfig.message) messageInput.setValue(goodbyeConfig.message);
    const messageImageInput = new TextInputBuilder().setCustomId('messageImage').setLabel('URL Image du message (optionnel)').setStyle(TextInputStyle.Short).setPlaceholder('https://exemple.com/image.png').setRequired(false);
    if (typeof goodbyeConfig.messageImage === 'string' && goodbyeConfig.messageImage) messageImageInput.setValue(goodbyeConfig.messageImage);
    modal.addComponents(new ActionRowBuilder().addComponents(messageInput), new ActionRowBuilder().addComponents(messageImageInput));
    return interaction.showModal(modal);
  }
  
  if (action === 'embed') {
    const modal = new ModalBuilder().setCustomId('goodbye_embed_modal').setTitle('Configuration Embed');
    const titleInput = new TextInputBuilder().setCustomId('title').setLabel('Titre').setStyle(TextInputStyle.Short).setMaxLength(256).setRequired(false);
    if (typeof goodbyeConfig.embedTitle === 'string' && goodbyeConfig.embedTitle) titleInput.setValue(goodbyeConfig.embedTitle);
    const descInput = new TextInputBuilder().setCustomId('description').setLabel('Description').setStyle(TextInputStyle.Paragraph).setMaxLength(2000).setRequired(false);
    if (typeof goodbyeConfig.embedDescription === 'string' && goodbyeConfig.embedDescription) descInput.setValue(goodbyeConfig.embedDescription);
    const colorInput = new TextInputBuilder().setCustomId('color').setLabel('Couleur (hex ou nom)').setStyle(TextInputStyle.Short).setPlaceholder('#ED4245').setRequired(false);
    if (typeof goodbyeConfig.embedColor === 'string' && goodbyeConfig.embedColor) colorInput.setValue(goodbyeConfig.embedColor);
    const thumbnailInput = new TextInputBuilder().setCustomId('thumbnail').setLabel('URL Thumbnail').setStyle(TextInputStyle.Short).setPlaceholder('https://...').setRequired(false);
    if (typeof goodbyeConfig.embedThumbnail === 'string' && goodbyeConfig.embedThumbnail) thumbnailInput.setValue(goodbyeConfig.embedThumbnail);
    const footerInput = new TextInputBuilder().setCustomId('footer').setLabel('Footer').setStyle(TextInputStyle.Short).setMaxLength(256).setRequired(false);
    if (typeof goodbyeConfig.embedFooter === 'string' && goodbyeConfig.embedFooter) footerInput.setValue(goodbyeConfig.embedFooter);
    modal.addComponents(new ActionRowBuilder().addComponents(titleInput), new ActionRowBuilder().addComponents(descInput), new ActionRowBuilder().addComponents(colorInput), new ActionRowBuilder().addComponents(thumbnailInput), new ActionRowBuilder().addComponents(footerInput));
    return interaction.showModal(modal);
  }
  
  if (action === 'embed_image') {
    const modal = new ModalBuilder().setCustomId('goodbye_embed_image_modal').setTitle('Image embed');
    const imageInput = new TextInputBuilder().setCustomId('embedImage').setLabel('URL image (bas embed)').setStyle(TextInputStyle.Short).setPlaceholder('https://...').setRequired(false);
    if (typeof goodbyeConfig.embedImage === 'string' && goodbyeConfig.embedImage) imageInput.setValue(goodbyeConfig.embedImage);
    modal.addComponents(new ActionRowBuilder().addComponents(imageInput));
    return interaction.showModal(modal);
  }
  
  if (action === 'toggle_embed') {
    goodbyeConfig.embedEnabled = !goodbyeConfig.embedEnabled;
    await writeConfig(cfg);
    const embed = new EmbedBuilder().setColor(goodbyeConfig.embedEnabled ? '#00FF00' : '#FF0000').setTitle(goodbyeConfig.embedEnabled ? '✅ Embed Activé' : '❌ Embed Désactivé').setDescription(`L'embed de départ est maintenant **${goodbyeConfig.embedEnabled ? 'activé' : 'désactivé'}**.`);
    return interaction.update({ embeds: [embed], components: [] });
  }
}

async function handleGoodbyeChannelSelect(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const cfg = await readConfig();
  const channel = interaction.channels.first();
  if (!cfg.guilds[interaction.guild.id].goodbye) cfg.guilds[interaction.guild.id].goodbye = {};
  cfg.guilds[interaction.guild.id].goodbye.channelId = channel.id;
  await writeConfig(cfg);
  const embed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Salon Configuré').setDescription(`Le salon de départ est maintenant ${channel}.`);
  return interaction.update({ content: '', embeds: [embed], components: [] });
}

async function handleGoodbyeMessageModal(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const cfg = await readConfig();
  const message = interaction.fields.getTextInputValue('message');
  const messageImage = interaction.fields.getTextInputValue('messageImage');
  if (!cfg.guilds[interaction.guild.id].goodbye) cfg.guilds[interaction.guild.id].goodbye = {};
  cfg.guilds[interaction.guild.id].goodbye.message = message;
  if (messageImage) { cfg.guilds[interaction.guild.id].goodbye.messageImage = messageImage; } else { delete cfg.guilds[interaction.guild.id].goodbye.messageImage; }
  await writeConfig(cfg);
  await interaction.deferReply({ ephemeral: true });
  const memberCount = interaction.guild.memberCount || 0;
  const replacements = { '{user}': `<@${interaction.user.id}>`, '{username}': interaction.user.username, '{server}': interaction.guild.name, '{memberCount}': memberCount.toString() };
  let previewMessage = message;
  Object.entries(replacements).forEach(([key, value]) => { previewMessage = previewMessage.replace(new RegExp(key, 'g'), value); });
  const embed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Message Configuré').setDescription(`Le message de départ a été mis à jour.\n\n**📋 Aperçu :**\n${previewMessage}`);
  if (messageImage) { embed.setImage(messageImage); embed.addFields({ name: '🖼️ Image', value: 'Image jointe au message' }); }
  return interaction.editReply({ embeds: [embed] });
}

async function handleGoodbyeEmbedModal(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const cfg = await readConfig();
  const title = interaction.fields.getTextInputValue('title');
  const description = interaction.fields.getTextInputValue('description');
  const color = interaction.fields.getTextInputValue('color');
  const thumbnail = interaction.fields.getTextInputValue('thumbnail');
  const footer = interaction.fields.getTextInputValue('footer');
  if (!cfg.guilds[interaction.guild.id].goodbye) cfg.guilds[interaction.guild.id].goodbye = {};
  const goodbyeConfig = cfg.guilds[interaction.guild.id].goodbye;
  if (title) goodbyeConfig.embedTitle = title; else delete goodbyeConfig.embedTitle;
  if (description) goodbyeConfig.embedDescription = description; else delete goodbyeConfig.embedDescription;
  if (color) goodbyeConfig.embedColor = color; else delete goodbyeConfig.embedColor;
  if (thumbnail) goodbyeConfig.embedThumbnail = thumbnail; else delete goodbyeConfig.embedThumbnail;
  if (footer) goodbyeConfig.embedFooter = footer; else delete goodbyeConfig.embedFooter;
  await writeConfig(cfg);
  await interaction.deferReply({ ephemeral: true });
  const memberCount = interaction.guild.memberCount || 0;
  const replacements = { '{user}': `<@${interaction.user.id}>`, '{username}': interaction.user.username, '{server}': interaction.guild.name, '{memberCount}': memberCount.toString() };
  let previewTitle = title || '', previewDesc = description || '', previewFooter = footer || '';
  Object.entries(replacements).forEach(([key, value]) => { previewTitle = previewTitle.replace(new RegExp(key, 'g'), value); previewDesc = previewDesc.replace(new RegExp(key, 'g'), value); previewFooter = previewFooter.replace(new RegExp(key, 'g'), value); });
  const confirmEmbed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Embed Configuré').setDescription('Les paramètres de l\'embed ont été mis à jour. Voici un aperçu :');
  const previewEmbed = new EmbedBuilder().setColor(color || '#ED4245');
  if (previewTitle) previewEmbed.setTitle(previewTitle);
  if (previewDesc) previewEmbed.setDescription(previewDesc);
  if (previewFooter) previewEmbed.setFooter({ text: previewFooter });
  if (thumbnail) previewEmbed.setThumbnail(thumbnail);
  if (goodbyeConfig.embedImage) previewEmbed.setImage(goodbyeConfig.embedImage);
  return interaction.editReply({ embeds: [confirmEmbed, previewEmbed] });
}

async function handleGoodbyeEmbedImageModal(interaction) {
  const { readConfig, writeConfig } = require('../storage/jsonStore');
  const cfg = await readConfig();
  const embedImage = interaction.fields.getTextInputValue('embedImage');
  if (!cfg.guilds[interaction.guild.id].goodbye) cfg.guilds[interaction.guild.id].goodbye = {};
  if (embedImage) { cfg.guilds[interaction.guild.id].goodbye.embedImage = embedImage; } else { delete cfg.guilds[interaction.guild.id].goodbye.embedImage; }
  await writeConfig(cfg);
  await interaction.deferReply({ ephemeral: true });
  const embed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Image Configurée').setDescription('L\'image de l\'embed a été mise à jour.');
  if (embedImage) { embed.setImage(embedImage); embed.addFields({ name: '📋 Aperçu', value: 'Image affichée ci-dessous' }); }
  return interaction.editReply({ embeds: [embed] });
}

// ===== FONCTIONS D'ENVOI DE MESSAGES =====

async function sendWelcomeMessage(member) {
  const { readConfig } = require('../storage/jsonStore');
  try {
    const config = await readConfig();
    const welcomeConfig = config.guilds?.[member.guild.id]?.welcome;
    if (!welcomeConfig?.enabled || !welcomeConfig?.channelId) return;
    const channel = member.guild.channels.cache.get(welcomeConfig.channelId) || await member.guild.channels.fetch(welcomeConfig.channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;
    const memberCount = member.guild.memberCount || 0;
    const replacements = { '{user}': `<@${member.id}>`, '{username}': member.user.username, '{server}': member.guild.name, '{memberCount}': memberCount.toString() };
    
    // Message sur le serveur dans un embed doré
    let message = welcomeConfig.message || '';
    for (const [key, value] of Object.entries(replacements)) { message = message.replace(new RegExp(key, 'g'), value); }
    
    const serverEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setDescription(message)
      .setTimestamp(new Date());
    
    if (welcomeConfig.messageImage) serverEmbed.setImage(welcomeConfig.messageImage);
    
    const payload = { 
      content: `<@${member.id}>`,
      embeds: [serverEmbed],
      allowedMentions: { users: [member.id], roles: [] }
    };
    
    await channel.send(payload);
    console.log(`[Welcome] Message sent for ${member.user.tag} in ${member.guild.name}`);
    
    // Envoyer l'embed UNIQUEMENT en DM si activé
    if (welcomeConfig.sendEmbedInDM && welcomeConfig.embedEnabled) {
      try {
        let title = welcomeConfig.embedTitle || 'Bienvenue !', description = welcomeConfig.embedDescription || '', footer = welcomeConfig.embedFooter || '';
        for (const [key, value] of Object.entries(replacements)) { 
          title = title.replace(new RegExp(key, 'g'), value); 
          description = description.replace(new RegExp(key, 'g'), value); 
          footer = footer.replace(new RegExp(key, 'g'), value); 
        }
        const dmEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle(title)
          .setDescription(description);
        if (typeof welcomeConfig.embedThumbnail === 'string' && welcomeConfig.embedThumbnail) dmEmbed.setThumbnail(welcomeConfig.embedThumbnail);
        if (footer) {
          const footerObj = { text: footer };
          if (typeof welcomeConfig.embedFooterIcon === 'string' && welcomeConfig.embedFooterIcon) footerObj.iconURL = welcomeConfig.embedFooterIcon;
          dmEmbed.setFooter(footerObj);
        }
        if (welcomeConfig.embedImage) dmEmbed.setImage(welcomeConfig.embedImage);
        dmEmbed.setTimestamp(new Date());
        await member.send({ embeds: [dmEmbed] });
        console.log(`[Welcome] DM embed sent to ${member.user.tag}`);
      } catch (dmError) {
        console.error(`[Welcome] Could not send DM to ${member.user.tag}:`, dmError.message);
      }
    }
  } catch (error) {
    console.error('[Welcome] Error:', error.message);
  }
}

async function sendGoodbyeMessage(member) {
  const { readConfig } = require('../storage/jsonStore');
  try {
    const config = await readConfig();
    const goodbyeConfig = config.guilds?.[member.guild.id]?.goodbye;
    if (!goodbyeConfig?.enabled || !goodbyeConfig?.channelId) return;
    const channel = member.guild.channels.cache.get(goodbyeConfig.channelId) || await member.guild.channels.fetch(goodbyeConfig.channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;
    const memberCount = member.guild.memberCount || 0;
    const replacements = { '{user}': member.user ? `<@${member.id}>` : member.id, '{username}': member.user?.username || 'Unknown', '{server}': member.guild.name, '{memberCount}': memberCount.toString() };
    let message = goodbyeConfig.message || '';
    for (const [key, value] of Object.entries(replacements)) { message = message.replace(new RegExp(key, 'g'), value); }
    const payload = { content: message || undefined };
    if (goodbyeConfig.messageImage) {
      const messageEmbed = new EmbedBuilder().setImage(goodbyeConfig.messageImage).setColor('Default');
      if (!payload.embeds) payload.embeds = [];
      payload.embeds.push(messageEmbed);
    }
    if (goodbyeConfig.embedEnabled) {
      let title = goodbyeConfig.embedTitle || 'Au revoir', description = goodbyeConfig.embedDescription || '', footer = goodbyeConfig.embedFooter || '';
      for (const [key, value] of Object.entries(replacements)) { title = title.replace(new RegExp(key, 'g'), value); description = description.replace(new RegExp(key, 'g'), value); footer = footer.replace(new RegExp(key, 'g'), value); }
      const embed = new EmbedBuilder().setColor(goodbyeConfig.embedColor || '#ED4245').setTitle(title).setDescription(description);
      if (goodbyeConfig.embedThumbnail) embed.setThumbnail(goodbyeConfig.embedThumbnail);
      if (footer) embed.setFooter({ text: footer });
      if (goodbyeConfig.embedImage) embed.setImage(goodbyeConfig.embedImage);
      embed.setTimestamp(new Date());
      if (!payload.embeds) payload.embeds = [];
      payload.embeds.push(embed);
    }
    await channel.send(payload);
    console.log(`[Goodbye] Message sent for ${member.user?.tag || member.id} in ${member.guild.name}`);
  } catch (error) {
    console.error('[Goodbye] Error:', error.message);
  }
}

module.exports = { handleWelcomeConfigureButton, handleWelcomeActionSelect, handleWelcomeChannelSelect, handleWelcomeMessageModal, handleWelcomeEmbedModal, handleWelcomeEmbedImageModal, handleGoodbyeConfigureButton, handleGoodbyeActionSelect, handleGoodbyeChannelSelect, handleGoodbyeMessageModal, handleGoodbyeEmbedModal, handleGoodbyeEmbedImageModal, sendWelcomeMessage, sendGoodbyeMessage };
