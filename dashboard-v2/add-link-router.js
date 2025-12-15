// Module pour l'ajout de liens YouTube/Spotify dans les playlists
module.exports = function(app) {
  const path = require('path');
  const fs = require('fs');
  const { spawn } = require('child_process');
  
  app.post('/api/music/add-link', async (req, res) => {
    const { link, playlistName, guildId } = req.body;
    
    if (!link || !playlistName || !guildId) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    
    try {
      console.log('[AddLink] Ajout du lien:', link);
      
      // Vérifier le type de lien
      if (link.includes('youtube') || link.includes('youtu.be')) {
        
        // Nettoyer le lien
        const cleanLink = link.split('&')[0];
        const ytdlPath = path.join(process.env.HOME, 'yt-dlp');
        
        console.log('[AddLink] Récupération des infos de la vidéo...');
        
        // Récupérer uniquement les métadonnées (sans télécharger)
        const ytdlArgs = [
          '--skip-download',
          '--print', '%(title)s|||%(uploader)s|||%(duration)s',
          '--no-warnings',
          cleanLink
        ];
        
        const ytdl = spawn(ytdlPath, ytdlArgs);
        
        let output = '';
        let errorOutput = '';
        
        ytdl.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        ytdl.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        const exitCode = await new Promise((resolve) => {
          ytdl.on('close', resolve);
          
          // Timeout de 30 secondes pour récupérer les infos
          setTimeout(() => {
            ytdl.kill();
            resolve(-1);
          }, 30000);
        });
        
        if (exitCode !== 0) {
          console.error('[AddLink] Erreur récupération infos:', errorOutput);
          throw new Error('Impossible de récupérer les informations de la vidéo');
        }
        
        // Extraire les informations
        const parts = output.trim().split('|||');
        const title = (parts[0] || 'Sans titre').substring(0, 100);
        const author = (parts[1] || 'Artiste inconnu').substring(0, 50);
        const durationSec = parseInt(parts[2]) || 0;
        const minutes = Math.floor(durationSec / 60);
        const seconds = durationSec % 60;
        const duration = minutes + ':' + seconds.toString().padStart(2, '0');
        
        console.log('[AddLink] Titre:', title);
        console.log('[AddLink] Auteur:', author);
        console.log('[AddLink] Durée:', duration);
        
        // Ajouter à la playlist (avec le lien YouTube au lieu d'un fichier)
        const playlistsPath = path.join(__dirname, '../data/playlists');
        if (!fs.existsSync(playlistsPath)) {
          fs.mkdirSync(playlistsPath, { recursive: true });
        }
        
        const playlistFile = path.join(playlistsPath, guildId + '-' + playlistName.replace(/[^a-zA-Z0-9_\-]/g, '_') + '.json');
        
        let playlist = { 
          name: playlistName, 
          guildId: guildId, 
          tracks: [], 
          createdAt: Date.now(), 
          updatedAt: Date.now() 
        };
        
        if (fs.existsSync(playlistFile)) {
          playlist = JSON.parse(fs.readFileSync(playlistFile, 'utf8'));
        }
        
        // Ajouter la piste avec le lien YouTube (pas de filename)
        playlist.tracks.push({
          title: title,
          author: author,
          url: cleanLink,  // Stocker le lien YouTube
          duration: duration,
          addedAt: Date.now(),
          source: 'youtube'
        });
        
        playlist.updatedAt = Date.now();
        fs.writeFileSync(playlistFile, JSON.stringify(playlist, null, 2));
        
        console.log('[AddLink] ✅', title, 'ajouté à', playlistName);
        
        return res.json({ success: true, title: title, author: author, duration: duration });
        
      } else if (link.includes('spotify')) {
        // Support Spotify : Extraire les métadonnées puis chercher sur YouTube
        console.log('[AddLink] Lien Spotify détecté');
        
        // Extraire l'ID Spotify du lien
        const spotifyIdMatch = link.match(/track\/([a-zA-Z0-9]+)/);
        if (!spotifyIdMatch) {
          return res.status(400).json({ error: 'Lien Spotify invalide' });
        }
        
        const spotifyId = spotifyIdMatch[1];
        console.log('[AddLink] Spotify ID:', spotifyId);
        
        // Récupérer les métadonnées via l'API publique Spotify (embed)
        const https = require('https');
        const spotifyEmbedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${spotifyId}`;
        
        const getSpotifyMetadata = () => {
          return new Promise((resolve, reject) => {
            https.get(spotifyEmbedUrl, (response) => {
              let data = '';
              response.on('data', (chunk) => { data += chunk; });
              response.on('end', () => {
                try {
                  const json = JSON.parse(data);
                  resolve(json);
                } catch (e) {
                  reject(new Error('Erreur parsing Spotify metadata'));
                }
              });
            }).on('error', reject);
          });
        };
        
        try {
          const spotifyData = await getSpotifyMetadata();
          console.log('[AddLink] Spotify metadata:', spotifyData);
          
          // Extraire titre et artiste du titre Spotify (format: "Artiste · Titre")
          const fullTitle = spotifyData.title || '';
          const parts = fullTitle.split(' · ');
          let artist = parts[0] || 'Artiste inconnu';
          let title = parts[1] || fullTitle;
          
          // Si pas de séparateur, essayer de parser autrement
          if (parts.length === 1) {
            // Titre seul, chercher l'artiste dans le HTML
            title = fullTitle;
          }
          
          console.log('[AddLink] Recherche YouTube pour:', artist, '-', title);
          
          // Chercher la musique sur YouTube
          const searchQuery = `${artist} ${title} official audio`;
          const ytdlArgs = [
            'ytsearch1:' + searchQuery,  // Chercher 1 résultat sur YouTube
            '--skip-download',
            '--print', '%(id)s|||%(title)s|||%(uploader)s|||%(duration)s',
            '--no-warnings'
          ];
          
          const ytdl = spawn(path.join(process.env.HOME, 'yt-dlp'), ytdlArgs);
          
          let output = '';
          let errorOutput = '';
          
          ytdl.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          ytdl.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
          
          const exitCode = await new Promise((resolve) => {
            ytdl.on('close', resolve);
            setTimeout(() => {
              ytdl.kill();
              resolve(-1);
            }, 30000);
          });
          
          if (exitCode !== 0 || !output.trim()) {
            console.error('[AddLink] Erreur recherche YouTube:', errorOutput);
            throw new Error('Impossible de trouver la musique sur YouTube');
          }
          
          // Parser les résultats
          const resultParts = output.trim().split('|||');
          const videoId = resultParts[0];
          const ytTitle = resultParts[1] || title;
          const ytAuthor = resultParts[2] || artist;
          const durationSec = parseInt(resultParts[3]) || 0;
          
          const minutes = Math.floor(durationSec / 60);
          const seconds = durationSec % 60;
          const duration = minutes + ':' + seconds.toString().padStart(2, '0');
          
          const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
          
          console.log('[AddLink] Trouvé sur YouTube:', ytTitle, '-', youtubeUrl);
          
          // Ajouter à la playlist avec l'URL YouTube
          const playlistsPath = path.join(__dirname, '../data/playlists');
          if (!fs.existsSync(playlistsPath)) {
            fs.mkdirSync(playlistsPath, { recursive: true });
          }
          
          const playlistFile = path.join(playlistsPath, guildId + '-' + playlistName.replace(/[^a-zA-Z0-9_\-]/g, '_') + '.json');
          
          let playlist = { 
            name: playlistName, 
            guildId: guildId, 
            tracks: [], 
            createdAt: Date.now(), 
            updatedAt: Date.now() 
          };
          
          if (fs.existsSync(playlistFile)) {
            playlist = JSON.parse(fs.readFileSync(playlistFile, 'utf8'));
          }
          
          // Ajouter la piste avec URL YouTube (équivalent Spotify)
          playlist.tracks.push({
            title: ytTitle,
            author: ytAuthor,
            url: youtubeUrl,
            duration: duration,
            addedAt: Date.now(),
            source: 'spotify-youtube',  // Source originale Spotify, mais URL YouTube
            spotifyUrl: link  // Garder le lien Spotify original
          });
          
          playlist.updatedAt = Date.now();
          fs.writeFileSync(playlistFile, JSON.stringify(playlist, null, 2));
          
          console.log('[AddLink] ✅', ytTitle, '(Spotify) ajouté via YouTube à', playlistName);
          
          return res.json({ 
            success: true, 
            title: ytTitle, 
            author: ytAuthor, 
            duration: duration,
            source: 'spotify'
          });
          
        } catch (spotifyError) {
          console.error('[AddLink] Erreur Spotify:', spotifyError.message);
          return res.status(500).json({ 
            error: 'Erreur lors du traitement du lien Spotify: ' + spotifyError.message 
          });
        }
        
      } else {
        return res.status(400).json({ error: 'Lien invalide (YouTube ou Spotify uniquement)' });
      }
      
    } catch (error) {
      console.error('[AddLink] Erreur:', error);
      res.status(500).json({ error: error.message || 'Erreur lors du téléchargement' });
    }
  });
};
