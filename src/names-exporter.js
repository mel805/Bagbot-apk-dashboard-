// Module d'export automatique des noms Discord
const fs = require('fs');
const path = require('path');

module.exports = function setupNamesExporter(client, guildId) {
  const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'discord-names.json');
  
  async function exportNames() {
    try {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        console.error('❌ [NamesExporter] Serveur non trouve');
        return;
      }

      // IMPORTANT: Fetch tous les membres avant de les exporter
      console.log('🔄 [NamesExporter] Chargement des membres...');
      await guild.members.fetch();
      console.log(`✅ [NamesExporter] ${guild.members.cache.size} membres charges`);

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

      // Members (tous les membres maintenant)
      guild.members.cache.forEach(member => {
        if (!member.user.bot) { // Exclure les bots
          data.members[member.id] = member.user.username;
        }
      });

      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
      console.log(`✅ [NamesExporter] Export: ${Object.keys(data.channels).length} channels, ${Object.keys(data.roles).length} roles, ${Object.keys(data.members).length} membres`);
    } catch (err) {
      console.error('❌ [NamesExporter] Erreur:', err.message);
    }
  }

  // Export initial après 30 secondes (pour laisser le temps au bot de charger)
  setTimeout(() => {
    console.log('🔄 [NamesExporter] Export initial des noms...');
    exportNames();
  }, 30000);

  // Export automatique toutes les 5 minutes
  setInterval(() => {
    console.log('🔄 [NamesExporter] Mise a jour des noms...');
    exportNames();
  }, 5 * 60 * 1000);

  console.log('✅ [NamesExporter] Module d\'export des noms active (intervalle: 5 min)');
};
