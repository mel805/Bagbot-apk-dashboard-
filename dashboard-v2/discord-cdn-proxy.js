// Proxy pour télécharger les GIFs Discord CDN via le client Discord authentifié
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Route pour proxifier les URLs Discord CDN
router.get('/discord-cdn', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  
  // Vérifier que c'est bien une URL Discord CDN
  if (!url.includes('cdn.discordapp.com') && !url.includes('media.discordapp')) {
    return res.status(400).json({ error: 'Not a Discord CDN URL' });
  }
  
  try {
    console.log('[Discord CDN Proxy] Fetching:', url);
    
    // Télécharger avec les bons headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://discord.com/',
        'Origin': 'https://discord.com'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log('[Discord CDN Proxy] Failed:', response.status);
      return res.status(response.status).json({ error: 'Failed to fetch from Discord CDN' });
    }
    
    const contentType = response.headers.get('content-type') || 'image/gif';
    const buffer = await response.buffer();
    
    console.log('[Discord CDN Proxy] Success:', buffer.length, 'bytes');
    
    // Mettre en cache
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h
    res.send(buffer);
    
  } catch (error) {
    console.error('[Discord CDN Proxy] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
