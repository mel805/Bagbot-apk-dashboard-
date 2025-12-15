const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "configbienvenue",
  data: new SlashCommandBuilder()
    .setName("configbienvenue")
    .setDescription("Configuration des messages de bienvenue et départ")
    .setDMPermission(false),
  
  async execute(interaction, context) {
    const hasManageGuild = interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild) || 
                          interaction.member?.permissions?.has(PermissionsBitField.Flags.ManageGuild);
    if (!hasManageGuild) {
      return interaction.reply({ content: "Réservé au staff.", ephemeral: true });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    const { readConfig } = require("../storage/jsonStore");
    const config = await readConfig();
    const guildConfig = config.guilds?.[interaction.guild.id] || {};
    const welcomeConfig = guildConfig.welcome || {};
    const goodbyeConfig = guildConfig.goodbye || {};
    
    const embed = new EmbedBuilder()
      .setColor(context.THEME_COLOR_PRIMARY)
      .setTitle("Configuration Bienvenue/Départ")
      .setDescription("Configurer les messages")
      .addFields(
        { name: "Bienvenue", value: `État: ${welcomeConfig.enabled ? "Activé" : "Désactivé"}\nSalon: ${welcomeConfig.channelId ? `<#${welcomeConfig.channelId}>` : "—"}`, inline: true },
        { name: "Départ", value: `État: ${goodbyeConfig.enabled ? "Activé" : "Désactivé"}\nSalon: ${goodbyeConfig.channelId ? `<#${goodbyeConfig.channelId}>` : "—"}`, inline: true }
      )
      .setFooter({ text: "BAG Config", iconURL: context.THEME_FOOTER_ICON })
      .setTimestamp();
    
    const welcomeBtn = new ButtonBuilder()
      .setCustomId("welcomegoodbye_configure_welcome")
      .setLabel("Configurer Bienvenue")
      .setStyle(ButtonStyle.Primary);
    
    const goodbyeBtn = new ButtonBuilder()
      .setCustomId("welcomegoodbye_configure_goodbye")
      .setLabel("Configurer Départ")
      .setStyle(ButtonStyle.Primary);
    
    const row = new ActionRowBuilder().addComponents(welcomeBtn, goodbyeBtn);
    
    await interaction.editReply({ embeds: [embed], components: [row] });
    return true;
  }
};
