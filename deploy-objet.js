const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Charger le token depuis .env.token
const tokenEnv = fs.readFileSync('.env.token', 'utf8');
const token = tokenEnv.split('=')[1].trim();

// Charger les IDs depuis .env
require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log('✅ Bot connecté !');
  
  try {
    const commands = [];
    const commandsPath = path.join(__dirname, 'src', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    console.log(`📦 Chargement de ${commandFiles.length} commandes...`);
    
    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (command.data) {
        commands.push(command.data);
        console.log(`  ✅ ${command.data.name}`);
      }
    }
    
    console.log(`\n🚀 Déploiement de ${commands.length} commandes...`);
    
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.commands.set(commands);
    
    console.log(`✅ ${commands.length} commandes déployées avec succès !`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
});

client.login(token);
