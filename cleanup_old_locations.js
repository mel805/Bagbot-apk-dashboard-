// Script de nettoyage des localisations des anciens membres
const { Client, GatewayIntentBits } = require('discord.js');
const { getAllLocations, removeUserLocation } = require('./src/storage/jsonStore');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

async function cleanupOldLocations() {
  console.log('[CLEANUP] Démarrage du nettoyage des localisations...');
  
  try {
    await client.login(process.env.TOKEN);
    console.log('[CLEANUP] Bot connecté');
    
    // Attendre que le bot soit prêt
    await new Promise(resolve => client.once('ready', resolve));
    
    const guilds = client.guilds.cache;
    console.log(`[CLEANUP] ${guilds.size} serveur(s) trouvé(s)`);
    
    let totalRemoved = 0;
    
    for (const [guildId, guild] of guilds) {
      console.log(`\n[CLEANUP] Traitement serveur: ${guild.name} (${guildId})`);
      
      // Récupérer toutes les localisations
      const locations = await getAllLocations(guildId);
      const locationUserIds = Object.keys(locations);
      
      if (locationUserIds.length === 0) {
        console.log(`[CLEANUP] Aucune localisation trouvée`);
        continue;
      }
      
      console.log(`[CLEANUP] ${locationUserIds.length} localisation(s) trouvée(s)`);
      
      // Récupérer tous les membres du serveur
      await guild.members.fetch();
      console.log(`[CLEANUP] ${guild.members.cache.size} membre(s) dans le serveur`);
      
      // Vérifier chaque localisation
      let removedCount = 0;
      for (const userId of locationUserIds) {
        const member = guild.members.cache.get(userId);
        
        if (!member) {
          // Membre n'est plus dans le serveur
          const removed = await removeUserLocation(guildId, userId);
          if (removed) {
            console.log(`[CLEANUP] ✓ Supprimé: ${userId} (${locations[userId].city || 'ville inconnue'})`);
            removedCount++;
            totalRemoved++;
          }
        }
      }
      
      console.log(`[CLEANUP] ${removedCount} localisation(s) supprimée(s) pour ${guild.name}`);
    }
    
    console.log(`\n[CLEANUP] ✅ Nettoyage terminé: ${totalRemoved} localisation(s) supprimée(s) au total`);
    
  } catch (error) {
    console.error('[CLEANUP] ❌ Erreur:', error);
  } finally {
    await client.destroy();
    process.exit(0);
  }
}

cleanupOldLocations();
