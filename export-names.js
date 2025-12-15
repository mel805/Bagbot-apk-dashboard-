// Script pour exporter les noms Discord dans un fichier JSON
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const GUILD_ID = '1360897918504271882';
const OUTPUT_FILE = '/home/bagbot/Bag-bot/data/discord-names.json';

client.once('ready', async () => {
  console.log('✅ Bot connecté, export en cours...');
  
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error('❌ Serveur non trouvé');
      process.exit(1);
    }

    // Fetch tous les membres
    await guild.members.fetch();

    const data = {
      channels: {},
      roles: {},
      members: {},
      updatedAt: Date.now()
    };

    // Channels
    guild.channels.cache.forEach(channel => {
      data.channels[channel.id] = channel.name;
    });

    // Roles
    guild.roles.cache.forEach(role => {
      data.roles[role.id] = role.name;
    });

    // Members
    guild.members.cache.forEach(member => {
      data.members[member.id] = member.user.username;
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Export terminé: ${Object.keys(data.channels).length} channels, ${Object.keys(data.roles).length} roles, ${Object.keys(data.members).length} members`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
});

client.login(process.env.DISCORD_TOKEN);
