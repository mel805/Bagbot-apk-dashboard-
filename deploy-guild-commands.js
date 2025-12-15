const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log(`📦 Chargement de ${commandFiles.length} commandes...`);

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  delete require.cache[require.resolve(filePath)]; // Clear cache
  const command = require(filePath);
  
  if (command.data) {
    commands.push(command.data.toJSON());
    console.log(`  ✅ ${command.data.name} (${file})`);
  } else {
    console.log(`  ⚠️  ${file} - pas de propriété data`);
  }
}

console.log(`\n🚀 Déploiement de ${commands.length} commandes slash pour le guild...`);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log(`\n✅ ${data.length} commandes slash enregistrées pour le guild !`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error);
    process.exit(1);
  }
})();
