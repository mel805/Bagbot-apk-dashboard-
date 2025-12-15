// Commandes pour les playlists personnalisées
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const playlistListCommand = {
  name: 'playlist',
  
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('📁 Gérer les playlists personnalisées')
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('📋 Liste des playlists disponibles'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('play')
        .setDescription('▶️ Jouer une playlist')
        .addStringOption(option =>
          option.setName('nom')
            .setDescription('Nom de la playlist')
            .setRequired(true)
            .setAutocomplete(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('ℹ️ Infos sur une playlist')
        .addStringOption(option =>
          option.setName('nom')
            .setDescription('Nom de la playlist')
            .setRequired(true)
            .setAutocomplete(true)))
    .setDMPermission(false),
  
  dmPermission: false,
  description: 'Gérer les playlists personnalisées',
  
  getPlaylistsPath() {
    // Utiliser le chemin absolu ou relatif au répertoire racine du bot
    const possiblePaths = [
      path.join(__dirname, '../../data/playlists'),
      path.join(process.cwd(), 'data/playlists'),
      '/home/bagbot/Bag-bot/data/playlists'
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        console.log(`[Playlist] Utilisation du chemin: ${p}`);
        return p;
      }
    }
    
    console.error(`[Playlist] ERREUR: Aucun chemin valide trouvé parmi:`, possiblePaths);
    return possiblePaths[0]; // Fallback
  },
  
  async autocomplete(interaction) {
    const playlistsPath = this.getPlaylistsPath();
    
    try {
      if (!fs.existsSync(playlistsPath)) {
        console.error(`[Playlist] Autocomplete: Chemin inexistant: ${playlistsPath}`);
        return interaction.respond([]);
      }
      
      const files = fs.readdirSync(playlistsPath);
      console.log(`[Playlist] Autocomplete: ${files.length} fichiers trouvés`);
      
      const playlists = files
        .filter(f => f.endsWith('.json'))
        .map(f => {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, f), 'utf8'));
            return {
              name: `${data.name} (${data.tracks?.length || 0} pistes)`,
              value: data.name
            };
          } catch (e) {
            console.error(`[Playlist] Erreur lecture ${f}:`, e.message);
            return null;
          }
        })
        .filter(p => p !== null)
        .slice(0, 25);
      
      console.log(`[Playlist] Autocomplete: ${playlists.length} playlists valides`);
      await interaction.respond(playlists);
    } catch (error) {
      console.error('[Playlist] Erreur autocomplete:', error);
      await interaction.respond([]);
    }
  },
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    console.log(`[Playlist] Commande: /playlist ${subcommand}`);
    
    if (subcommand === 'list') {
      return this.handleList(interaction);
    } else if (subcommand === 'play') {
      return this.handlePlay(interaction);
    } else if (subcommand === 'info') {
      return this.handleInfo(interaction);
    }
  },
  
  async handleList(interaction) {
    const playlistsPath = this.getPlaylistsPath();
    console.log(`[Playlist] List - Chemin: ${playlistsPath}`);
    
    try {
      if (!fs.existsSync(playlistsPath)) {
        console.error(`[Playlist] List: Chemin inexistant`);
        return interaction.reply({
          content: '❌ Aucune playlist disponible. Créez-en via le dashboard !',
          ephemeral: true
        });
      }
      
      const files = fs.readdirSync(playlistsPath);
      console.log(`[Playlist] List: ${files.length} fichiers trouvés`);
      
      const playlists = files
        .filter(f => f.endsWith('.json'))
        .map(f => {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, f), 'utf8'));
            return `📁 **${data.name}** - ${data.tracks?.length || 0} piste(s)`;
          } catch (e) {
            console.error(`[Playlist] Erreur lecture ${f}:`, e.message);
            return null;
          }
        })
        .filter(p => p !== null);
      
      if (playlists.length === 0) {
        return interaction.reply({
          content: '❌ Aucune playlist disponible. Créez-en via le dashboard !',
          ephemeral: true
        });
      }
      
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setColor(0xE91E63)
        .setTitle('📁 Playlists Personnalisées')
        .setDescription(playlists.join('\n'))
        .setFooter({ text: 'Utilisez /playlist play <nom> pour jouer une playlist' })
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('[Playlist] Erreur list:', error);
      return interaction.reply({
        content: '❌ Erreur lors de la récupération des playlists',
        ephemeral: true
      });
    }
  },
  
  async handlePlay(interaction) {
    const playlistName = interaction.options.getString('nom');
    const playlistsPath = this.getPlaylistsPath();
    
    console.log(`[Playlist] Play: Recherche de "${playlistName}"`);
    console.log(`[Playlist] Play: Chemin: ${playlistsPath}`);
    
    // IMPORTANT: Déférer IMMÉDIATEMENT avant toute autre opération
    // Si l'interaction a déjà expiré, on retourne immédiatement
    try {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }
    } catch (deferError) {
      console.error('[Playlist] Erreur deferReply (interaction expirée):', deferError.message);
      // L'interaction a expiré, on ne peut plus rien faire
      return;
    }
    
    try {
      if (!fs.existsSync(playlistsPath)) {
        console.error(`[Playlist] Play: Chemin inexistant`);
        return interaction.editReply({
          content: `❌ Répertoire playlists introuvable !`
        }).catch(err => console.error('[Playlist] editReply error:', err.message));
      }
      
      // Chercher le fichier en lisant le champ "name" dans chaque JSON
      const files = fs.readdirSync(playlistsPath).filter(f => f.endsWith('.json'));
      console.log(`[Playlist] Play: ${files.length} fichiers JSON trouvés:`, files);
      
      let playlistFile = null;
      let foundPlaylistName = null;
      
      for (const file of files) {
        try {
          const filePath = path.join(playlistsPath, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(`[Playlist] Play: Fichier ${file} - nom: "${data.name}"`);
          
          if (data.name && data.name.toLowerCase() === playlistName.toLowerCase()) {
            playlistFile = filePath;
            foundPlaylistName = data.name;
            console.log(`[Playlist] Play: ✅ TROUVÉ! Fichier: ${file}`);
            break;
          }
        } catch (e) {
          console.error(`[Playlist] Play: Erreur lecture ${file}:`, e.message);
        }
      }
      
      if (!playlistFile || !fs.existsSync(playlistFile)) {
        console.error(`[Playlist] Play: Playlist "${playlistName}" non trouvée`);
        return interaction.editReply({
          content: `❌ Playlist "${playlistName}" introuvable !\n\n🔍 Playlists disponibles: Utilisez \`/playlist list\``
        }).catch(err => console.error('[Playlist] editReply error:', err.message));
      }
      
      const playlist = JSON.parse(fs.readFileSync(playlistFile, 'utf8'));
      console.log(`[Playlist] Play: Playlist "${foundPlaylistName}" chargée, ${playlist.tracks?.length || 0} pistes`);
      
      if (!playlist.tracks || playlist.tracks.length === 0) {
        return interaction.editReply({
          content: `❌ La playlist "${foundPlaylistName}" est vide !`
        }).catch(err => console.error('[Playlist] editReply error:', err.message));
      }
      
      const member = interaction.member;
      const voiceChannel = member.voice.channel;
      
      if (!voiceChannel) {
        return interaction.editReply({
          content: '❌ Vous devez être dans un salon vocal !'
        }).catch(err => console.error('[Playlist] editReply error:', err.message));
      }
      
      if (!global.musicManager) {
        console.error(`[Playlist] Play: MusicManager non initialisé`);
        return interaction.editReply({
          content: '❌ Système musique non initialisé'
        }).catch(err => console.error('[Playlist] editReply error:', err.message));
      }
      
      const queue = global.musicManager.getQueue(interaction.guild.id);
      const wasEmpty = !queue.current && queue.tracks.length === 0;
      console.log('[Playlist] Play: Queue vide?', wasEmpty, '- current:', queue.current ? 'oui' : 'non', '- tracks:', queue.tracks.length);

      // Ajouter toutes les pistes de la playlist
      let added = 0;
      for (const track of playlist.tracks) {
        try {
          console.log(`[Playlist] Play: Ajout piste ${track.title || track.filename}, source: ${track.source || 'upload'}`);
          
          // Distinction selon la source
          if (track.source === 'youtube' && track.url) {
            // Piste YouTube : utiliser play() avec l'URL
            console.log(`[Playlist] Play: Ajout piste YouTube: ${track.url}`);
            await global.musicManager.play(interaction, track.url, true);
            added++;
          } else if (track.filename) {
            // Piste upload locale : utiliser playLocal()
            console.log(`[Playlist] Play: Ajout piste locale: ${track.filename}`);
            await global.musicManager.playLocal(interaction, track, voiceChannel, false);
            added++;
          } else {
            console.error(`[Playlist] Play: Piste invalide (pas de source valide):`, track);
          }
        } catch (error) {
          console.error('[Playlist] Erreur ajout piste:', error.message);
        }
      }
      
      
      // Si la queue était vide, démarrer la lecture maintenant
      if (wasEmpty && added > 0) {
        console.log('[Playlist] Play: Démarrage de la lecture (queue était vide)...');
        await global.musicManager.processQueue(interaction.guild, voiceChannel).catch(err => {
          console.error('[Playlist] Erreur démarrage queue:', err);
        });
      }
      console.log(`[Playlist] Play: ✅ ${added} pistes ajoutées`);
      return interaction.editReply(`✅ **Playlist "${foundPlaylistName}" ajoutée !**\n🎵 ${added} piste(s) ajoutée(s) à la file`)
        .catch(err => console.error('[Playlist] editReply error:', err.message));
      
    } catch (error) {
      console.error('[Playlist] Erreur play:', error);
      try {
        return interaction.editReply({
          content: '❌ Erreur lors de la lecture de la playlist'
        }).catch(err => console.error('[Playlist] editReply error:', err.message));
      } catch (editError) {
        console.error('[Playlist] Erreur finale:', editError.message);
      }
    }
  },
  
  async handleInfo(interaction) {
    const playlistName = interaction.options.getString('nom');
    const playlistsPath = this.getPlaylistsPath();
    
    try {
      // Chercher le fichier en lisant le champ "name" dans chaque JSON
      const files = fs.readdirSync(playlistsPath).filter(f => f.endsWith('.json'));
      let playlistFile = null;
      
      for (const file of files) {
        try {
          const filePath = path.join(playlistsPath, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (data.name && data.name.toLowerCase() === playlistName.toLowerCase()) {
            playlistFile = filePath;
            break;
          }
        } catch (e) {}
      }
      
      if (!playlistFile || !fs.existsSync(playlistFile)) {
        return interaction.reply({
          content: `❌ Playlist "${playlistName}" introuvable !`,
          ephemeral: true
        });
      }
      
      const playlist = JSON.parse(fs.readFileSync(playlistFile, 'utf8'));
      
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setColor(0xE91E63)
        .setTitle(`📁 ${playlist.name}`)
        .setDescription(`**Nombre de pistes:** ${playlist.tracks?.length || 0}`)
        .setTimestamp(playlist.updatedAt || Date.now());
      
      if (playlist.tracks && playlist.tracks.length > 0) {
        const trackList = playlist.tracks.slice(0, 10).map((track, i) => 
          `${i + 1}. ${track.title || track.filename || 'Sans titre'}`
        ).join('\n');
        
        embed.addFields([{
          name: '🎵 Pistes',
          value: trackList + (playlist.tracks.length > 10 ? `\n... et ${playlist.tracks.length - 10} autres` : '')
        }]);
      }
      
      return interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('[Playlist] Erreur info:', error);
      return interaction.reply({
        content: '❌ Erreur lors de la récupération des informations',
        ephemeral: true
      });
    }
  }
};

module.exports = playlistListCommand;
