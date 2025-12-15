const { REST, Routes } = require('discord.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const APPLICATION_ID = process.env.APPLICATION_ID || process.env.CLIENT_ID;
const GUILD_ID = '1360897918504271882';

(async () => {
  try {
    const globalCommands = await rest.get(Routes.applicationCommands(APPLICATION_ID));
    const guildCommands = await rest.get(Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID));
    
    console.log('📊 État actuel des commandes Discord');
    console.log('='.repeat(80));
    console.log(`🌐 Commandes GLOBALES (MP): ${globalCommands.length}`);
    console.log(`🏰 Commandes GUILD (Serveur): ${guildCommands.length}`);
    console.log('');
    
    const globalNames = new Set(globalCommands.map(c => c.name));
    const guildNames = new Set(guildCommands.map(c => c.name));
    const duplicates = [...globalNames].filter(name => guildNames.has(name));
    
    if (duplicates.length > 0) {
      console.log(`❌ DOUBLONS DÉTECTÉS: ${duplicates.length}`);
      console.log('Exemples:', duplicates.slice(0, 10).join(', '));
    } else {
      console.log('✅ AUCUN DOUBLON - Tout est OK !');
    }
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
})();
