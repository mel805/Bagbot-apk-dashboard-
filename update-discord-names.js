// Script autonome pour mettre à jour discord-names.json
const fs = require('fs');
const path = require('path');

// Lire la config du bot pour extraire les IDs connus
const configPath = '/home/bagbot/Bag-bot/data/config.json';
const outputPath = '/home/bagbot/Bag-bot/data/discord-names.json';

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const guildData = config.guilds['1360897918504271882'] || {};
  
  const data = {
    channels: {},
    roles: {},
    members: {},
    updatedAt: Date.now(),
    source: 'config-extraction'
  };
  
  // Extraire les noms de membres depuis economy.balances
  if (guildData.economy?.balances) {
    Object.keys(guildData.economy.balances).forEach(userId => {
      // Utiliser le format User-XXXX temporairement
      data.members[userId] = `User-${userId.slice(-4)}`;
    });
  }
  
  // Les channels et roles resteront avec les IDs pour l'instant
  // car on ne peut pas les récupérer sans l'API Discord
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✅ Export terminé: ${Object.keys(data.members).length} membres`);
} catch (err) {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
}
