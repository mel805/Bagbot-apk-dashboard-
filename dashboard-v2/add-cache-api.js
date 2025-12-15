const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server-v2.js');
let server = fs.readFileSync(serverPath, 'utf8');

// Vérifier si l'API existe déjà
if (server.includes('app.post(\'\/api\/cache-gif-url\'')) {
  console.log('⚠️  API cache-gif-url existe déjà');
  process.exit(0);
}

// Trouver où insérer (après app.post('/api/actions')
const insertPoint = server.indexOf('// POST - Mettre à jour les messages');

if (insertPoint === -1) {
  console.error('❌ Point d\'insertion non trouvé');
  process.exit(1);
}

const newAPI = `
// POST - Mettre en cache un GIF et retourner l'URL du cache
app.post('/api/cache-gif-url', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing url' });
  }
  
  try {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const ext = url.includes('.gif') ? '.gif' : (url.includes('.png') ? '.png' : '.jpg');
    const filename = hash + ext;
    const filepath = path.join(__dirname, 'gif-cache', filename);
    
    // Vérifier si déjà en cache
    if (fs.existsSync(filepath)) {
      return res.json({ 
        success: true, 
        cached: true,
        url: \`/gif-cache/\${filename}\`,
        filename 
      });
    }
    
    // Télécharger
    await new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const fileStream = fs.createWriteStream(filepath);
      
      protocol.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
      }, (proxyRes) => {
        if (proxyRes.statusCode !== 200) {
          fileStream.close();
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          return reject(new Error(\`HTTP \${proxyRes.statusCode}\`));
        }
        
        proxyRes.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      }).on('error', (err) => {
        fileStream.close();
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        reject(err);
      });
    });
    
    // Mettre à jour le mapping
    const mappingPath = path.join(__dirname, 'gif-cache', 'mapping.json');
    let mapping = {};
    if (fs.existsSync(mappingPath)) {
      mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    }
    mapping[hash] = filename;
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    
    console.log('✅ GIF mis en cache:', filename);
    res.json({ 
      success: true, 
      cached: false,
      url: \`/gif-cache/\${filename}\`,
      filename 
    });
  } catch (err) {
    console.error('Erreur cache GIF:', err);
    res.status(500).json({ error: err.message });
  }
});

`;

// Insérer l'API
server = server.slice(0, insertPoint) + newAPI + server.slice(insertPoint);

// Sauvegarder
const backupPath = serverPath + '.backup-cache-api-' + Date.now();
fs.copyFileSync(serverPath, backupPath);
fs.writeFileSync(serverPath, server);

console.log('✅ API cache-gif-url ajoutée');
console.log('💾 Backup:', backupPath);
