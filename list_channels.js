// Script pour lister tous les channels et catégories
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

async function listChannels() {
  try {
    await client.login(process.env.TOKEN);
    await new Promise(resolve => client.once('ready', resolve));
    
    const guild = client.guilds.cache.first();
    if (!guild) {
      console.log('Aucun serveur trouvé');
      process.exit(1);
    }
    
    console.log(`\n📊 ANALYSE SERVEUR: ${guild.name}`);
    console.log(`👥 Membres: ${guild.memberCount}`);
    console.log(`📝 Channels: ${guild.channels.cache.size}`);
    console.log('\n' + '='.repeat(80));
    
    // Grouper par catégories
    const categories = guild.channels.cache
      .filter(c => c.type === ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position);
    
    const channelsWithoutCategory = guild.channels.cache
      .filter(c => !c.parent && c.type !== ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position);
    
    // Afficher channels sans catégorie
    if (channelsWithoutCategory.size > 0) {
      console.log('\n❓ SANS CATÉGORIE');
      channelsWithoutCategory.forEach(channel => {
        const emoji = getChannelEmoji(channel);
        const perms = getPermissionInfo(channel);
        console.log(`  ${emoji} ${channel.name}${perms}`);
      });
    }
    
    // Afficher par catégorie
    for (const category of categories.values()) {
      const children = category.children.cache
        .sort((a, b) => a.position - b.position);
      
      console.log(`\n📂 ${category.name.toUpperCase()} (${children.size} channels)`);
      
      children.forEach(channel => {
        const emoji = getChannelEmoji(channel);
        const perms = getPermissionInfo(channel);
        console.log(`  ${emoji} ${channel.name}${perms}`);
      });
    }
    
    // Statistiques
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 STATISTIQUES:');
    
    const stats = {
      categories: categories.size,
      text: guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size,
      voice: guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size,
      stage: guild.channels.cache.filter(c => c.type === ChannelType.GuildStageVoice).size,
      forum: guild.channels.cache.filter(c => c.type === ChannelType.GuildForum).size,
      announcement: guild.channels.cache.filter(c => c.type === ChannelType.GuildAnnouncement).size,
      private: 0,
      public: 0
    };
    
    guild.channels.cache
      .filter(c => c.type !== ChannelType.GuildCategory)
      .forEach(channel => {
        const everyoneRole = guild.roles.everyone;
        const perms = channel.permissionsFor(everyoneRole);
        if (perms && perms.has('ViewChannel')) {
          stats.public++;
        } else {
          stats.private++;
        }
      });
    
    console.log(`  📂 Catégories: ${stats.categories}`);
    console.log(`  💬 Salons texte: ${stats.text}`);
    console.log(`  🔊 Salons vocaux: ${stats.voice}`);
    console.log(`  🎤 Salons stage: ${stats.stage}`);
    console.log(`  📢 Annonces: ${stats.announcement}`);
    console.log(`  📋 Forums: ${stats.forum}`);
    console.log(`  🌍 Publics: ${stats.public}`);
    console.log(`  🔒 Privés: ${stats.private}`);
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await client.destroy();
    process.exit(0);
  }
}

function getChannelEmoji(channel) {
  switch(channel.type) {
    case ChannelType.GuildText: return '💬';
    case ChannelType.GuildVoice: return '🔊';
    case ChannelType.GuildAnnouncement: return '📢';
    case ChannelType.GuildStageVoice: return '🎤';
    case ChannelType.GuildForum: return '📋';
    default: return '❓';
  }
}

function getPermissionInfo(channel) {
  const guild = channel.guild;
  const everyoneRole = guild.roles.everyone;
  const perms = channel.permissionsFor(everyoneRole);
  
  if (!perms || !perms.has('ViewChannel')) {
    return ' 🔒';
  }
  return '';
}

listChannels();
