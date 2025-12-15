// Script de synchronisation rapide des commandes
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log('Bot connecté !');
  
  try {
    const commands = [];
    const commandsPath = path.join(__dirname, 'src', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (command.data) {
        commands.push(command.data);
      }
    }
    
    console.log(`Synchronisation de ${commands.length} commandes...`);
    
    // Déploiement guild (plus rapide, immédiat)
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    await guild.commands.set(commands);
    
    console.log('✅ Commandes synchronisées avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
});

client.login(process.env.DISCORD_TOKEN);
