const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'play',
  
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('🎵 Jouer une musique')
    .addStringOption(option =>
      option.setName('recherche')
        .setDescription('Nom ou URL de la musique')
        .setRequired(true))
    .setDMPermission(false),
  
  dmPermission: false,
  description: 'Jouer une musique',
  
  async execute(interaction) {
    if (!global.musicManager) {
      return interaction.reply({ 
        content: '❌ Système musique non initialisé', 
        ephemeral: true 
      });
    }
    
    let query = interaction.options.getString('recherche');
    
    // Détecter les liens Spotify et les convertir en recherche YouTube
    if (query.includes('spotify.com/track/')) {
      try {
        // NE PAS defer ici - music-manager.play() s'en occupe
        console.log('[Play] Lien Spotify détecté, conversion en cours...');
        
        // Extraire l'ID Spotify
        const spotifyIdMatch = query.match(/track\/([a-zA-Z0-9]+)/);
        if (!spotifyIdMatch) {
          return interaction.reply({ content: '❌ Lien Spotify invalide', ephemeral: true });
        }
        
        const spotifyId = spotifyIdMatch[1];
        
        // Defer avant le traitement long
        await interaction.deferReply();
        
        // Récupérer métadonnées via API publique Spotify (oEmbed)
        const https = require('https');
        const spotifyEmbedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${spotifyId}`;
        
        const spotifyData = await new Promise((resolve, reject) => {
          https.get(spotifyEmbedUrl, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error('Erreur parsing Spotify'));
              }
            });
          }).on('error', reject);
          
          setTimeout(() => reject(new Error('Timeout Spotify API')), 10000);
        });
        
        // Extraire titre et artiste (format: "Artiste · Titre")
        const fullTitle = spotifyData.title || '';
        const parts = fullTitle.split(' · ');
        const artist = parts[0] || '';
        const title = parts[1] || fullTitle;
        
        // Créer la recherche YouTube
        query = `${artist} ${title} official audio`;
        console.log('[Play] Spotify converti en recherche YouTube:', query);
        
        // Continuer avec la recherche YouTube (déjà deferred)
        await global.musicManager.play(interaction, query, true);
        
      } catch (error) {
        console.error('[Play] Erreur conversion Spotify:', error.message);
        const replyContent = '❌ Erreur lors de la conversion du lien Spotify: ' + error.message;
        if (interaction.deferred) {
          return interaction.editReply(replyContent);
        } else {
          return interaction.reply({ content: replyContent, ephemeral: true });
        }
      }
    } else {
      // YouTube ou recherche normale
      await global.musicManager.play(interaction, query);
    }
  }
};
