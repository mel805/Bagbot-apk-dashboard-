const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

const CONFIG_PATH = path.join(__dirname, '../data/config.json');
const GIF_CACHE_DIR = path.join(__dirname, 'gif-cache');
const GUILD = '1360897918504271882';

// Download and cache a GIF
async function downloadGif(url) {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash('md5').update(url).digest('hex');
      const ext = url.includes('.gif') ? '.gif' : '.png';
      const filename = hash + ext;
      const filepath = path.join(GIF_CACHE_DIR, filename);
      
      // Already cached
      if (fs.existsSync(filepath)) {
        console.log(`  ✓ Déjà en cache: ${filename}`);
        return resolve({ url, filename, cached: true });
      }
      
      console.log(`  ⬇️  Téléchargement...`);
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const fileStream = fs.createWriteStream(filepath);
      
      protocol.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
      }, (res) => {
        if (res.statusCode !== 200) {
          fileStream.close();
          fs.unlinkSync(filepath);
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`  ✅ Téléchargé: ${filename}`);
          resolve({ url, filename, cached: false });
        });
      }).on('error', (err) => {
        fileStream.close();
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function preloadAllGifs() {
  console.log('📖 Lecture de la configuration...');
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const gifs = config.guilds?.[GUILD]?.economy?.actions?.gifs || {};
  
  const results = [];
  const errors = [];
  
  for (const action in gifs) {
    const actionGifs = gifs[action];
    
    // Success GIFs
    if (Array.isArray(actionGifs.success)) {
      for (const url of actionGifs.success) {
        console.log(`\n🎬 ${action} (success): ${url.substring(0, 60)}...`);
        try {
          const result = await downloadGif(url);
          results.push({ action, type: 'success', ...result });
        } catch (err) {
          console.log(`  ❌ Erreur: ${err.message}`);
          errors.push({ action, type: 'success', url, error: err.message });
        }
      }
    }
    
    // Fail GIFs
    if (Array.isArray(actionGifs.fail)) {
      for (const url of actionGifs.fail) {
        console.log(`\n🎬 ${action} (fail): ${url.substring(0, 60)}...`);
        try {
          const result = await downloadGif(url);
          results.push({ action, type: 'fail', ...result });
        } catch (err) {
          console.log(`  ❌ Erreur: ${err.message}`);
          errors.push({ action, type: 'fail', url, error: err.message });
        }
      }
    }
  }
  
  console.log(`\n\n✅ Terminé!`);
  console.log(`📊 GIFs en cache: ${results.length}`);
  console.log(`❌ Erreurs: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Erreurs:`);
    errors.forEach(e => console.log(`  - ${e.action} (${e.type}): ${e.error}`));
  }
  
  // Save mapping
  const mapping = {};
  results.forEach(r => {
    const hash = crypto.createHash('md5').update(r.url).digest('hex');
    mapping[hash] = r.filename;
  });
  
  fs.writeFileSync(
    path.join(GIF_CACHE_DIR, 'mapping.json'),
    JSON.stringify(mapping, null, 2)
  );
  console.log(`\n💾 Mapping sauvegardé dans gif-cache/mapping.json`);
}

preloadAllGifs().catch(console.error);
