const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const commands = [];
const commandsPath = path.join(__dirname, "src", "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

console.log(`📦 Chargement de ${commandFiles.length} commandes...`);

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if (command.data) {
    commands.push(command.data.toJSON());
    console.log(`  ✅ ${command.data.name} (${file})`);
  } else {
    console.log(`  ⚠️  ${file} - pas de propriété data`);
  }
}

console.log(`\n🚀 Déploiement de ${commands.length} commandes slash sur le SERVEUR uniquement...`);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const GUILD_ID = '1360897918504271882'; // ID du serveur

(async () => {
  try {
    // MODIFICATION: Déploiement sur le serveur uniquement (pas global)
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log(`\n✅ ${data.length} commandes slash enregistrées sur le serveur !\n`);
    console.log('📝 Note: Les commandes MP doivent être déployées séparément avec deploy-dm-commands.js');
  } catch (error) {
    console.error("❌ Erreur lors du déploiement:", error);
  }
})();
