const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log('✅ BOT CONNECTED:', client.user.tag);
  process.exit(0);
});

console.log('🔄 Testing login...');
client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
});

setTimeout(() => { console.log('⏱️ Timeout'); process.exit(1); }, 15000);
