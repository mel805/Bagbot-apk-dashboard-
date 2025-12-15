const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

// Essayer tous les tokens disponibles
const tokens = [];

// Token depuis .env
try {
  require('dotenv').config();
  if (process.env.DISCORD_TOKEN) tokens.push({ source: '.env', token: process.env.DISCORD_TOKEN });
} catch (_) {}

// Token depuis .env.token
try {
  const content = fs.readFileSync('.env.token', 'utf8');
  const token = content.split('=')[1]?.trim();
  if (token) tokens.push({ source: '.env.token', token });
} catch (_) {}

// Essayer chaque token
(async () => {
  for (const {source, token} of tokens) {
    console.log(`\nTest token depuis ${source}...`);
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    
    try {
      await client.login(token);
      console.log('✅ Token valide !');
      
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const commands = await guild.commands.fetch();
      
      console.log(`📋 ${commands.size} commandes enregistrées:`);
      commands.forEach(cmd => console.log(`  - ${cmd.name}`));
      
      const hasObjet = commands.some(cmd => cmd.name === 'objet');
      console.log(`\n🔍 Commande /objet: ${hasObjet ? '✅ ENREGISTRÉE' : '❌ MANQUANTE'}`);
      
      await client.destroy();
      process.exit(0);
    } catch (err) {
      console.log(`❌ Échec: ${err.message}`);
    }
  }
  
  console.log('\n❌ Aucun token valide trouvé.');
  process.exit(1);
})();
