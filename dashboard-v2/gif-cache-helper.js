// Système de cache GIF pour le dashboard
window.GifCacheHelper = {
  cache: {},
  mapping: {},
  
  async init() {
    try {
      const r = await fetch('/gif-cache/mapping.json');
      if (r.ok) {
        this.mapping = await r.json();
        console.log('✅ GIF Cache loaded:', Object.keys(this.mapping).length);
      }
    } catch (e) {
      console.warn('Cache mapping unavailable');
    }
  },
  
  md5Hash(str) {
    // Simple hash (pas un vrai MD5 mais compatible)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(32, '0');
  },
  
  getDisplayUrl(url) {
    if (!url) return '';
    
    // Chercher dans le mapping
    for (const [hash, filename] of Object.entries(this.mapping)) {
      if (this.cache[url]) {
        return this.cache[url];
      }
    }
    
    // Utiliser le proxy
    return '/api/proxy-image?url=' + encodeURIComponent(url);
  },
  
  async cacheUrl(url) {
    if (!url) return null;
    
    // Mettre en cache les URLs Discord CDN
    if (url.includes('cdn.discordapp.com') || url.includes('media.discordapp')) {
      try {
        const r = await fetch('/api/cache-gif-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        
        if (r.ok) {
          const data = await r.json();
          this.cache[url] = data.url;
          await this.init(); // Recharger le mapping
          console.log('✅ GIF cached:', data.filename);
          return data.url;
        }
      } catch (e) {
        console.warn('Cache error:', e);
      }
    }
    return null;
  },
  
  async cacheMultiple(urls) {
    const results = [];
    for (const url of urls) {
      const cached = await this.cacheUrl(url);
      results.push({ url, cached: !!cached, cacheUrl: cached });
    }
    return results;
  }
};

// Initialiser au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.GifCacheHelper.init());
} else {
  window.GifCacheHelper.init();
}
