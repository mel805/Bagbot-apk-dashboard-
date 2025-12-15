const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const APPLICATION_ID = process.env.APPLICATION_ID || process.env.CLIENT_ID;

(async () => {
  try {
    console.log('🗑️  Suppression de TOUTES les commandes globales...');
    
    const globalCommands = await rest.get(Routes.applicationCommands(APPLICATION_ID));
    console.log(`📦 ${globalCommands.length} commandes globales trouvées`);
    
    for (const cmd of globalCommands) {
      await rest.delete(Routes.applicationCommand(APPLICATION_ID, cmd.id));
      console.log(`  ✅ Supprimé: ${cmd.name}`);
    }
    
    console.log(`\n✅ ${globalCommands.length} commandes globales supprimées`);
    console.log('');
    console.log('📝 Les commandes guild avec dmPermission: true seront automatiquement');
    console.log('   disponibles en MP sans besoin de déploiement global.');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
})();
