// Système de musique avec répétition et connexion permanente
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  StreamType,
  NoSubscriberBehavior
} = require('@discordjs/voice');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const YOUTUBE_COOKIES = '/home/bagbot/youtube_cookies.txt';

const YTDLP_PATH = '/home/bagbot/yt-dlp';
const YTDLP_SEARCH_SCRIPT = '/home/bagbot/yt-dlp-search.sh';
const FFMPEG_PATH = require('ffmpeg-static');

class CustomMusicManager {
  constructor(client) {
    this.client = client;
    this.queues = new Map();
    
    this.playlistsPath = path.join(__dirname, '../data/playlists');
    this.uploadsPath = path.join(__dirname, '../../data/uploads');
    
    if (!fs.existsSync(this.playlistsPath)) fs.mkdirSync(this.playlistsPath, { recursive: true });
    if (!fs.existsSync(this.uploadsPath)) fs.mkdirSync(this.uploadsPath, { recursive: true });
    
    console.log('[CustomMusic] ✅ Système musique initialisé (avec répétition + connexion 24/7)');
    
    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isButton()) return;
      if (!interaction.customId.startsWith('music_')) return;
      await this.handleButton(interaction);
    });
    
    // Déconnecter automatiquement quand le salon vocal est vide
    this.client.on('voiceStateUpdate', (oldState, newState) => {
      this.handleVoiceStateUpdate(oldState, newState);
    });
  }
  
  async handleVoiceStateUpdate(oldState, newState) {
    // Vérifier si quelqu'un a quitté un salon
    if (oldState.channelId && oldState.channelId !== newState.channelId) {
      const voiceChannel = oldState.channel;
      if (!voiceChannel) return;
      
      // Vérifier si le bot est dans ce salon
      const botMember = voiceChannel.guild.members.me;
      if (!botMember.voice.channelId || botMember.voice.channelId !== voiceChannel.id) return;
      
      // Compter les membres (hors bots)
      const humanMembers = voiceChannel.members.filter(m => !m.user.bot);
      
      if (humanMembers.size === 0) {
        console.log('[CustomMusic] Salon vocal vide, déconnexion dans 60s...');
        
        const queue = this.queues.get(voiceChannel.guild.id);
        if (queue) {
          // Attendre 60 secondes avant de déconnecter (au cas où quelqu'un revient)
          setTimeout(() => {
            // Revérifier que le salon est toujours vide
            const currentMembers = voiceChannel.members.filter(m => !m.user.bot);
            if (currentMembers.size === 0 && queue.connection) {
              console.log('[CustomMusic] 🚪 Déconnexion - salon vide');
              
              // Nettoyer l'interval de progression
              if (queue.progressInterval) {
                clearInterval(queue.progressInterval);
                queue.progressInterval = null;
              }
              
              // Arrêter la musique et déconnecter
              if (queue.player) queue.player.stop();
              if (queue.connection) queue.connection.destroy();
              
              // Notifier dans le channel
              if (queue.channel) {
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                  .setColor(0xFFD700)
                  .setDescription('**🚪 Bot déconnecté**\n```Salon vocal vide```')
                  .setFooter({ 
                    text: 'Utilisez /play pour relancer',
                    iconURL: voiceChannel.guild.iconURL()
                  });
                queue.channel.send({ embeds: [embed] }).catch(() => {});
              }
              
              // Réinitialiser la queue
              queue.tracks = [];
              queue.originalQueue = [];
              queue.current = null;
              queue.connection = null;
              queue.player = null;
            }
          }, 60000); // 60 secondes
        }
      }
    }
  }
  
  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        tracks: [],
        current: null,
        connection: null,
        player: null,
        channel: null,
        volume: 80,
        playerMessage: null,
        repeatMode: 'off', // 'off', 'queue', 'one'
        originalQueue: [], // Pour repeat queue
        startTime: null, // Heure de début de lecture
        progressInterval: null // Interval pour mise à jour de la progression
      });
    }
    return this.queues.get(guildId);
  }
  
  async searchYouTube(query) {
    return new Promise((resolve, reject) => {
      const isUrl = query.startsWith('http://') || query.startsWith('https://');
      const searchQuery = isUrl ? query : `ytsearch1:${query}`;
      
      console.log('[YouTube] Recherche avec exec():', searchQuery);
      
      const command = `${YTDLP_SEARCH_SCRIPT} "${searchQuery}"`;
      
      exec(command, { timeout: 15000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        // Vérifier d'abord si on a des résultats valides dans stdout
        const lines = stdout.trim().split('\n').filter(l => l.trim().length > 0);
        
        // Si on a des résultats, ignorer l'erreur (probablement juste des warnings)
        if (error && lines.length < 2) {
          console.error('[YouTube] ❌ Erreur exec:', error.message);
          console.error('[YouTube] stderr:', stderr.substring(0, 200));
          console.error('[YouTube] stdout:', stdout.substring(0, 200));
          return reject(new Error('Recherche échouée: ' + error.message));
        }
        
        if (error) {
          console.log('[YouTube] ⚠️ Erreur ignorée car résultats présents:', error.message);
        }
        
        console.log('[YouTube] Lignes reçues:', lines.length);
        
        if (lines.length < 2) {
          console.error('[YouTube] ❌ Pas assez de lignes:', lines.length);
          return reject(new Error('Aucun résultat trouvé'));
        }
        
        const title = lines[0] || 'Sans titre';
        const videoId = lines[1];
        const duration = lines.length >= 3 ? lines[2] : '0:00';
        
        console.log('[YouTube] ✅ OK:', title.substring(0, 50), '('+duration+')');
        
        resolve({
          title,
          author: 'YouTube',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          duration: duration,
          thumbnail: ''
        });
      });
    });
  }

  async play(interaction, query, alreadyDeferred = false) {
    try {
      const member = interaction.member;
      const voiceChannel = member.voice.channel;
      
      if (!voiceChannel) {
        return interaction.reply({ 
          content: '❌ Vous devez être dans un salon vocal !', 
          ephemeral: true 
        });
      }
      
      // Ne defer que si ce n'est pas déjà fait
      if (!alreadyDeferred && !interaction.deferred) {
        await interaction.deferReply();
      }
      
      const queue = this.getQueue(interaction.guild.id);
      
      // OPTIMISATION : Se connecter IMMÉDIATEMENT au salon vocal (en parallèle de la recherche)
      if (!queue.connection || queue.connection.state.status === VoiceConnectionStatus.Destroyed) {
        console.log('[CustomMusic] ⚡ Pré-connexion au salon vocal...');
        queue.connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator
        });
        
        if (!queue.player) {
          queue.player = createAudioPlayer({
            behaviors: {
              noSubscriber: NoSubscriberBehavior.Play
            }
          });
          queue.connection.subscribe(queue.player);
          
          queue.player.on(AudioPlayerStatus.Idle, () => {
            console.log('[CustomMusic] Piste terminée');
            this.processQueue(interaction.guild);
          });
          
          queue.player.on('error', error => {
            console.error('[CustomMusic] ❌ Erreur player:', error);
            queue.channel?.send('❌ Erreur de lecture');
            this.processQueue(interaction.guild);
          });
        }
        
        queue.voiceChannel = voiceChannel;
        console.log('[CustomMusic] ✅ Pré-connecté (gain de temps)');
      }
      
      console.log('[CustomMusic] 🔍 Recherche:', query);
      
      let track;
      
      try {
        const result = await this.searchYouTube(query);
        track = {
          ...result,
          requestedBy: interaction.user
        };
        console.log('[CustomMusic] ✅ Trouvé:', track.title, '-', track.duration);
      } catch (error) {
        console.error('[CustomMusic] ❌ Erreur recherche:', error.message);
        const errorMsg = `❌ Impossible de trouver: **${query}**\n\`\`\`${error.message}\`\`\``;
        if (interaction.deferred) {
          return interaction.editReply(errorMsg);
        } else {
          return interaction.reply({ content: errorMsg, ephemeral: true });
        }
      }
      
      queue.tracks.push(track);
      queue.channel = interaction.channel;
      queue.voiceChannel = voiceChannel;
      
      if (!queue.current) {
        await this.processQueue(interaction.guild, voiceChannel);
        if (interaction.deferred) {
          return interaction.editReply('🎵 Lecture démarrée !');
        } else {
          return interaction.reply('🎵 Lecture démarrée !');
        }
      } else {
        const response = `✅ **Ajouté à la file (#${queue.tracks.length}):** ${track.title}`;
        if (interaction.deferred) {
          return interaction.editReply(response);
        } else {
          return interaction.reply(response);
        }
      }
      
    } catch (error) {
      console.error('[CustomMusic] Erreur play:', error);
      const errorMsg = { content: '❌ Erreur: ' + error.message };
      if (interaction.deferred) {
        return interaction.editReply(errorMsg);
      } else {
        return interaction.reply({ ...errorMsg, ephemeral: true });
      }
    }
  }
  async processQueue(guild, voiceChannel = null) {
    const queue = this.getQueue(guild.id);
    
    // Si voiceChannel n'est pas fourni, utiliser celui stocké dans la queue
    if (!voiceChannel && queue.voiceChannel) {
      voiceChannel = queue.voiceChannel;
      console.log('[CustomMusic] Utilisation du voiceChannel stocké');
    }
    
    // Si toujours pas de voiceChannel, impossible de continuer
    if (!voiceChannel) {
      console.error('[CustomMusic] Aucun voiceChannel disponible');
      return;
    }
    
    if (queue.tracks.length === 0 && queue.repeatMode === 'off') {
      queue.current = null;
      
      // Nettoyer l'interval de progression
      if (queue.progressInterval) {
        clearInterval(queue.progressInterval);
        queue.progressInterval = null;
      }
      
      console.log('[CustomMusic] File vide, mais reste connecté 24/7');
      
      if (queue.playerMessage) {
        const embed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setDescription('**File de lecture vide**\n```Utilisez /play pour ajouter une musique```')
          .setThumbnail(guild.iconURL())
          .setFooter({ 
            text: 'Bot en veille 24/7',
            iconURL: guild.iconURL()
          });
        
        await queue.playerMessage.edit({ embeds: [embed], components: [] }).catch(() => {});
      }
      
      // NE PAS déconnecter - rester 24/7
      return;
    }
    
    // Gestion de la répétition
    if (queue.tracks.length === 0 && queue.repeatMode === 'queue' && queue.originalQueue.length > 0) {
      console.log('[CustomMusic] 🔁 Répétition de la file');
      queue.tracks = [...queue.originalQueue];
    }
    
    if (queue.repeatMode === 'one' && queue.current) {
      console.log('[CustomMusic] 🔂 Répétition de la musique actuelle');
      // Rejouer la même musique
    } else if (queue.tracks.length > 0) {
      queue.current = queue.tracks.shift();
      console.log('[CustomMusic] Lecture:', queue.current.title);
      console.log('[CustomMusic] File restante:', queue.tracks.length);
      
      // Sauvegarder la queue originale pour repeat
      if (queue.repeatMode === 'queue' && queue.originalQueue.length === 0) {
        queue.originalQueue = [queue.current, ...queue.tracks];
      }
    } else if (!queue.current) {
      return; // Rien à jouer
    }
    
    // Vérifier si la connexion existe ET est valide
    const isConnectionValid = queue.connection && 
                             queue.connection.state && 
                             queue.connection.state.status !== VoiceConnectionStatus.Destroyed &&
                             queue.connection.state.status !== VoiceConnectionStatus.Disconnected;
    
    if (!isConnectionValid) {
      console.log('[CustomMusic] ⚡ Connexion rapide au salon vocal...');
      
      // Détruire l'ancienne connexion si elle existe
      if (queue.connection) {
        try {
          queue.connection.destroy();
        } catch (e) {}
      }
      
      queue.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
      });
      
      if (!queue.player) {
        queue.player = createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
          }
        });
        
        queue.connection.subscribe(queue.player);
        
        queue.player.on(AudioPlayerStatus.Idle, () => {
          console.log('[CustomMusic] Piste terminée');
          this.processQueue(guild);
        });
        
        queue.player.on('error', error => {
          console.error('[CustomMusic] ❌ Erreur player:', error);
          queue.channel?.send('❌ Erreur de lecture');
          this.processQueue(guild);
        });
      } else {
        queue.connection.subscribe(queue.player);
      }
      
      queue.voiceChannel = voiceChannel;
      console.log('[CustomMusic] ✅ Connecté instantanément');
    } else {
      console.log('[CustomMusic] ⚡ Déjà connecté - lecture immédiate');
    }
    try {
      // Vérifier si c'est un fichier local ou YouTube
      if (queue.current.isLocal && queue.current.localPath) {
        console.log('[CustomMusic] Lecture fichier local:', queue.current.localPath);
        
        if (!fs.existsSync(queue.current.localPath)) {
          throw new Error('Fichier introuvable: ' + queue.current.localPath);
        }
        
        // Streamer le fichier local directement avec FFmpeg
        const ffmpegProcess = spawn(FFMPEG_PATH, [
          '-i', queue.current.localPath,
          '-analyzeduration', '0',
          '-loglevel', '0',
          '-f', 's16le',
          '-ar', '48000',
          '-ac', '2',
          'pipe:1'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        ffmpegProcess.on('error', (err) => {
          console.error('[CustomMusic] ❌ Erreur FFmpeg local:', err);
        });
        
        const resource = createAudioResource(ffmpegProcess.stdout, {
          inputType: StreamType.Raw,
          inlineVolume: true
        });
        
        resource.volume.setVolume(queue.volume / 100);
        queue.player.play(resource);
        
        console.log('[CustomMusic] ✅ Lecture fichier local démarrée');
        
      } else {
        console.log('[CustomMusic] ⚡ Streaming YouTube optimisé:', queue.current.url);
        
        // Options ultra-optimisées pour démarrage rapide + haute qualité
        const ytdlpProcess = spawn(YTDLP_PATH, [
          '--extractor-args', 'youtube:player_client=default',
          '--format', 'bestaudio[ext=webm][abr<=192]/bestaudio',
          '--no-playlist',
          '--no-warnings',
          '--no-continue',
          '--no-part',
          '--buffer-size', '8K',
          '--http-chunk-size', '1M',
          '--output', '-',
          queue.current.url
        ]);
      
      // FFmpeg ultra-rapide : conversion minimale pour latence minimale
      const ffmpegProcess = spawn(FFMPEG_PATH, [
        '-i', 'pipe:0',
        '-analyzeduration', '0',
        '-probesize', '32',
        '-loglevel', 'error',
        '-acodec', 'libopus',
        '-b:a', '192k',
        '-vbr', 'on',
        '-compression_level', '10',
        '-frame_duration', '20',
        '-application', 'audio',
        '-ar', '48000',
        '-ac', '2',
        '-f', 'opus',
        '-vn',
        'pipe:1'
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
        ytdlpProcess.stdout.pipe(ffmpegProcess.stdin);
        
        ytdlpProcess.on('error', (err) => {
          console.error('[CustomMusic] ❌ Erreur yt-dlp stream:', err.message);
        });
        
        ffmpegProcess.on('error', (err) => {
          console.error('[CustomMusic] ❌ Erreur FFmpeg:', err.message);
        });
        
        const resource = createAudioResource(ffmpegProcess.stdout, {
          inputType: StreamType.OggOpus,
          inlineVolume: true
        });
        
        resource.volume.setVolume(queue.volume / 100);
        queue.player.play(resource);
        
        console.log('[CustomMusic] ✅ Streaming rapide démarré (Opus 192kbps VBR)');
      }
      
      // Afficher le lecteur immédiatement (ne pas attendre)
      setImmediate(() => {
        this.displayPlayer(guild, queue).catch(err => {
          console.error('[CustomMusic] Erreur displayPlayer:', err.message);
        });
      });
      
    } catch (error) {
      console.error('[CustomMusic] ❌ Erreur:', error);
      queue.channel?.send('❌ Erreur lors de la lecture de: ' + queue.current.title);
      // Utiliser le voiceChannel stocké dans la queue
      this.processQueue(guild);
    }
  }
  
  async displayPlayer(guild, queue) {
    if (!queue.channel) return;
    
    // Démarrer le timer de progression
    queue.startTime = Date.now();
    
    // Nettoyer l'ancien interval
    if (queue.progressInterval) {
      clearInterval(queue.progressInterval);
    }
    
    // Mettre à jour la progression toutes les 10 secondes
    queue.progressInterval = setInterval(() => {
      this.updatePlayerProgress(guild, queue).catch(() => {});
    }, 10000);
    
    let repeatIcon = '';
    if (queue.repeatMode === 'queue') repeatIcon = '🔁 ';
    if (queue.repeatMode === 'one') repeatIcon = '🔂 ';
    
    // Lecteur compact et professionnel avec liseré doré
    const progressBar = this.getProgressBar(0, queue.current?.duration || '0:00');
    const title = queue.current?.title || 'Aucune musique';
    const duration = queue.current?.duration || '0:00';
    const totalTracks = queue.tracks.length + (queue.current ? 1 : 0);
    
    const embed = new EmbedBuilder()
      .setColor(0xFFD700) // Couleur dorée
      .setDescription(`${repeatIcon}**${title}**\n\`\`\`0:00 ${progressBar} ${duration}\`\`\``)
      .setThumbnail(guild.iconURL({ size: 128 }))  // Icône du serveur à droite
      .setFooter({ 
        text: `Volume: ${queue.volume}% • File: ${totalTracks} piste(s)`,
        iconURL: guild.iconURL()
      });
    
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('music_pause')
          .setEmoji('⏸️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('music_skip')
          .setEmoji('⏭️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('music_stop')
          .setEmoji('⏹️')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('music_volumedown')
          .setEmoji('🔉')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music_volumeup')
          .setEmoji('🔊')
          .setStyle(ButtonStyle.Secondary)
      );
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('music_repeatone')
          .setEmoji('🔂')
          .setStyle(queue.repeatMode === 'one' ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music_repeatqueue')
          .setEmoji('🔁')
          .setStyle(queue.repeatMode === 'queue' ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
    
    if (queue.playerMessage) {
      try {
        await queue.playerMessage.delete();
      } catch (e) {}
    }
    
    queue.playerMessage = await queue.channel.send({ 
      embeds: [embed], 
      components: [row1, row2] 
    });
  }
  
  async handleButton(interaction) {
    const queue = this.getQueue(interaction.guild.id);
    const action = interaction.customId.replace('music_', '');
    
    if (!queue.player && action !== 'repeatone' && action !== 'repeatqueue') {
      return interaction.reply({ 
        content: '❌ Aucune musique en cours !', 
        ephemeral: true 
      });
    }
    
    switch (action) {
      case 'pause':
        if (queue.player.state.status === AudioPlayerStatus.Playing) {
          queue.player.pause();
          await interaction.reply({ content: '⏸️ **Pause**', ephemeral: true });
        } else {
          queue.player.unpause();
          await interaction.reply({ content: '▶️ **Reprise**', ephemeral: true });
        }
        break;
        
      case 'skip':
        queue.player.stop();
        await interaction.reply({ content: '⏭️ **Musique suivante**', ephemeral: true });
        break;
        
      case 'stop':
        // Nettoyer l'interval de progression
        if (queue.progressInterval) {
          clearInterval(queue.progressInterval);
          queue.progressInterval = null;
        }
        
        queue.tracks = [];
        queue.originalQueue = [];
        queue.current = null;
        queue.repeatMode = 'off';
        queue.player.stop();
        await interaction.reply({ content: '⏹️ **Arrêté (bot reste connecté)**', ephemeral: true });
        break;
        
      case 'volumedown':
        queue.volume = Math.max(0, queue.volume - 10);
        if (queue.player?.state?.resource?.volume) {
          queue.player.state.resource.volume.setVolume(queue.volume / 100);
          console.log(`[Volume] Baissé à ${queue.volume}%`);
        } else {
          console.warn('[Volume] Resource volume non disponible');
        }
        await interaction.reply({ content: `🔉 Volume: ${queue.volume}%`, ephemeral: true });
        await this.updatePlayerEmbed(interaction.guild, queue);
        break;
        
      case 'volumeup':
        queue.volume = Math.min(200, queue.volume + 10);
        if (queue.player?.state?.resource?.volume) {
          queue.player.state.resource.volume.setVolume(queue.volume / 100);
          console.log(`[Volume] Augmenté à ${queue.volume}%`);
        } else {
          console.warn('[Volume] Resource volume non disponible');
        }
        await interaction.reply({ content: `🔊 Volume: ${queue.volume}%`, ephemeral: true });
        await this.updatePlayerEmbed(interaction.guild, queue);
        break;
        
      case 'repeatone':
        if (queue.repeatMode === 'one') {
          queue.repeatMode = 'off';
          await interaction.reply({ content: '🔂 **Répétition désactivée**', ephemeral: true });
        } else {
          queue.repeatMode = 'one';
          queue.originalQueue = [];
          await interaction.reply({ content: '🔂 **Répétition d\'une musique activée**', ephemeral: true });
        }
        await this.updatePlayerEmbed(interaction.guild, queue);
        break;
        
      case 'repeatqueue':
        if (queue.repeatMode === 'queue') {
          queue.repeatMode = 'off';
          queue.originalQueue = [];
          await interaction.reply({ content: '🔁 **Répétition désactivée**', ephemeral: true });
        } else {
          queue.repeatMode = 'queue';
          queue.originalQueue = queue.current ? [queue.current, ...queue.tracks] : [...queue.tracks];
          await interaction.reply({ content: '🔁 **Répétition de la file activée**', ephemeral: true });
        }
        await this.updatePlayerEmbed(interaction.guild, queue);
        break;
    }
  }
  
  async updatePlayerEmbed(guild, queue) {
    if (!queue.playerMessage || !queue.current) return;
    
    let repeatIcon = '';
    if (queue.repeatMode === 'queue') repeatIcon = '🔁 ';
    if (queue.repeatMode === 'one') repeatIcon = '🔂 ';
    
    // Calculer le temps écoulé
    const elapsed = queue.startTime ? Math.floor((Date.now() - queue.startTime) / 1000) : 0;
    const elapsedStr = this.formatTime(elapsed);
    
    // Recréer l'embed avec le nouveau design compact
    const progressBar = this.getProgressBar(elapsed, queue.current?.duration || '0:00');
    const title = queue.current?.title || 'Aucune musique';
    const duration = queue.current?.duration || '0:00';
    const totalTracks = queue.tracks.length + (queue.current ? 1 : 0);
    
    const embed = new EmbedBuilder()
      .setColor(0xFFD700) // Couleur dorée
      .setDescription(`${repeatIcon}**${title}**\n\`\`\`${elapsedStr} ${progressBar} ${duration}\`\`\``)
      .setThumbnail(guild.iconURL({ size: 128 }))
      .setFooter({ 
        text: `Volume: ${queue.volume}% • File: ${totalTracks} piste(s)`,
        iconURL: guild.iconURL()
      });
    
    const row2 = ActionRowBuilder.from(queue.playerMessage.components[1]);
    row2.components[0].setStyle(queue.repeatMode === 'one' ? ButtonStyle.Success : ButtonStyle.Secondary);
    row2.components[1].setStyle(queue.repeatMode === 'queue' ? ButtonStyle.Success : ButtonStyle.Secondary);
    
    try {
      await queue.playerMessage.edit({ 
        embeds: [embed],
        components: [queue.playerMessage.components[0], row2]
      });
    } catch (e) {}
  }
  
  // Fonction pour créer la barre de progression
  getProgressBar(elapsedSeconds, durationStr) {
    const totalSeconds = this.parseTime(durationStr);
    if (totalSeconds === 0) return '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
    
    const progress = Math.min(elapsedSeconds / totalSeconds, 1);
    const barLength = 15;
    const filledLength = Math.floor(progress * barLength);
    
    const filled = '🟨'.repeat(filledLength);
    const empty = '▬'.repeat(barLength - filledLength);
    
    return filled + empty;
  }
  
  // Fonction pour mettre à jour la progression
  async updatePlayerProgress(guild, queue) {
    if (!queue.playerMessage || !queue.current || !queue.startTime) return;
    await this.updatePlayerEmbed(guild, queue);
  }
  
  // Convertir "3:45" en secondes
  parseTime(timeStr) {
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }
  
  // Convertir secondes en "3:45"
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  async pause(interaction) {
    const queue = this.getQueue(interaction.guild.id);
    if (!queue.player) {
      return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    }
    queue.player.pause();
    return interaction.reply('⏸️ **Lecture mise en pause**');
  }
  
  async resume(interaction) {
    const queue = this.getQueue(interaction.guild.id);
    if (!queue.player) {
      return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    }
    queue.player.unpause();
    return interaction.reply('▶️ **Lecture reprise**');
  }
  
  async skip(interaction) {
    const queue = this.getQueue(interaction.guild.id);
    if (!queue.player || !queue.current) {
      return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    }
    const current = queue.current;
    queue.player.stop();
    return interaction.reply(`⏭️ **Musique passée:** ${current.title}`);
  }
  
  async stop(interaction) {
    const queue = this.getQueue(interaction.guild.id);
    if (!queue.connection) {
      return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    }
    
    // Nettoyer l'interval de progression
    if (queue.progressInterval) {
      clearInterval(queue.progressInterval);
      queue.progressInterval = null;
    }
    
    queue.tracks = [];
    queue.originalQueue = [];
    queue.current = null;
    queue.repeatMode = 'off';
    queue.player.stop();
    return interaction.reply('⏹️ **Lecture arrêtée (bot reste connecté 24/7)**');
  }
  
  async queue(interaction) {
    const queue = this.getQueue(interaction.guild.id);
    if (!queue.current) {
      return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    }
    
    const embed = new EmbedBuilder()
      .setColor(0xE91E63)
      
      .setThumbnail(interaction.guild.iconURL())
      
      ;
    
    if (queue.tracks.length > 0) {
      const queueList = queue.tracks.slice(0, 10).map((track, i) => 
        `${i + 1}. ${track.title} - ${track.duration}`
      ).join('\n');
      
      embed.addFields([{ name: '📋 Suivant(s)', value: queueList }]);
    }
    
    return interaction.reply({ embeds: [embed] });
  }
  
  formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Méthode pour jouer des fichiers locaux (playlists personnalisées)
  async playLocal(interaction, track, voiceChannel, isFirst = false) {
    const uploadsPath = path.join(__dirname, '../../data/uploads');
    const queue = this.getQueue(interaction.guild.id);
    
    // Créer l'objet track avec le chemin local
    const localTrack = {
      title: track.title || track.filename || 'Musique locale',
      author: track.author || 'Playlist personnalisée',
      url: null, // Pas d'URL
      localPath: path.join(uploadsPath, track.filename),
      duration: track.duration || '?:??',
      thumbnail: track.thumbnail || null,
      requestedBy: interaction.user,
      isLocal: true
    };
    
    queue.tracks.push(localTrack);
    queue.channel = interaction.channel;
    
    if (!queue.current && isFirst) {
      await this.processQueue(interaction.guild, voiceChannel);
    }
  }

}



module.exports = { CustomMusicManager };
