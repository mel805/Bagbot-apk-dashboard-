const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "actionverite",
  
  data: new SlashCommandBuilder()
    .setName("actionverite")
    .setDescription("Jouer à action ou vérité")
    .setDMPermission(true)
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]),

  dmPermission: true,
  description: "Jouer à action ou vérité",
  
  async execute(interaction, context) {
    // Ne PAS déferer ici - bot.js s'en charge
    console.log("[actionverite.js] Passing to bot.js without defer");
    
    // Retourner false pour que le CommandHandler passe à bot.js
    return false;
  }
};
