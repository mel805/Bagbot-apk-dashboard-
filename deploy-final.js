const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Charger depuis /var/data/.env
try { require('dotenv').config({ path: '/var/data/.env' }); } catch (_) {}

const CLIENT_ID = process.env.CLIENT_ID || '1414216173809307780';
const GUILD_ID = process.env.GUILD_ID || '1360897918504271882';
const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log('✅ Bot connecté !');
  
  try {
    const commands = [];
    const commandsPath = path.join(__dirname, 'src', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    console.log(`📦 Chargement de ${commandFiles.length} commandes...`);
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      if (command.data) {
        commands.push(command.data);
        if (command.data.name === 'objet') {
          console.log(`  🎁 ${command.data.name} - NOUVELLE COMMANDE`);
        } else {
          console.log(`  ✅ ${command.data.name}`);
        }
      }
    }
    
    console.log(`\n🚀 Déploiement de ${commands.length} commandes pour le guild...`);
    
    const guild = await client.guilds.fetch(GUILD_ID);
    const result = await guild.commands.set(commands);
    
    console.log(`✅ ${result.size} commandes déployées avec succès !`);
    console.log(`\n✅ La commande /objet est maintenant disponible sur Discord !`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
});

console.log('🔄 Connexion au bot...');
client.login(TOKEN);
