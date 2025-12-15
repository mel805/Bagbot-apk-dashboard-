const { REST, Routes } = require("discord.js");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🔄 Déploiement des commandes Discord...");

    const fs = require("fs");
    const path = require("path");
    const commands = [];
    const commandsPath = path.join(__dirname, "src", "commands");
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        if ("data" in command) {
          commands.push(command.data.toJSON());
        }
      } catch (err) {
        console.log(`⚠️  Erreur chargement ${file}: ${err.message}`);
      }
    }

    console.log(`📦 ${commands.length} commandes chargées`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log(`✅ ${commands.length} commandes déployées avec succès!`);
    console.log("Les autocompletions devraient être mises à jour immédiatement.");
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
})();
