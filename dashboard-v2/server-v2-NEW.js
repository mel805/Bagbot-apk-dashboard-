require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const https = require('https');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = path.join(__dirname, "../data/uploads");
    if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${timestamp}-${basename}${ext}`);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

const app = express();
const PORT = 3003; // Changement de port pour contourner le cache

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(express.static('.'));

const CONFIG = path.join(__dirname, '../data/config.json');
const GUILD = '1360897918504271882';
const BACKUP_DIR = path.join(__dirname, '../backups');

// Discord API credentials
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN manquant dans .env');
} else {
  console.log('✓ Discord token chargé:', DISCORD_TOKEN.substring(0, 30) + '...');
}

// Cache for channel names
let channelsCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to read config
function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  } catch (err) {
    console.error('Error reading config:', err);
    return { guilds: {} };
  }
}

// Helper function to write config
function writeConfig(data) {
  try {
    fs.writeFileSync(CONFIG, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing config:', err);
    return false;
  }
}

// Fetch Discord channels
function fetchDiscordChannels() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'discord.com',
      path: `/api/v10/guilds/${GUILD}/channels`,
      method: 'GET',
      headers: {
        'Authorization': `Bot ${DISCORD_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const channels = JSON.parse(data);
          const result = {};
          channels.forEach(ch => result[ch.id] = ch.name);
          resolve(result);
        } else {
          reject(new Error(`Discord API error: ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Fetch Discord roles
function fetchDiscordRoles() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'discord.com',
      path: `/api/v10/guilds/${GUILD}/roles`,
      method: 'GET',
      headers: {
        'Authorization': `Bot ${DISCORD_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const roles = JSON.parse(data);
          const result = {};
          roles.forEach(role => result[role.id] = role.name);
          resolve(result);
        } else {
          reject(new Error(`Discord API error: ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Get channels with caching
async function getChannels() {
  const now = Date.now();
  if (channelsCache && (now - cacheTime) < CACHE_DURATION) {
    return channelsCache;
  }
  
  try {
    channelsCache = await fetchDiscordChannels();
    cacheTime = now;
    return channelsCache;
  } catch (err) {
    console.error('Error fetching channels:', err);
    return channelsCache || {};
  }
}

// Get roles with caching
let rolesCache = null;
let rolesCacheTime = 0;
async function getRoles() {
  const now = Date.now();
  if (rolesCache && (now - rolesCacheTime) < CACHE_DURATION) {
    return rolesCache;
  }
  
  try {
    rolesCache = await fetchDiscordRoles();
    rolesCacheTime = now;
    return rolesCache;
  } catch (err) {
    console.error('Error fetching roles:', err);
    return rolesCache || {};
  }
}

// Fetch Discord members with real names
async function fetchDiscordMembers() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'discord.com',
      path: `/api/v10/guilds/${GUILD}/members?limit=1000`,
      method: 'GET',
      headers: {
        'Authorization': `Bot ${DISCORD_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    https.get(options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode === 200) {
          const members = JSON.parse(data);
          const memberMap = {};
          members.forEach(m => {
            // Prioriser: nick > global_name > username
            const displayName = m.nick || m.user?.global_name || m.user?.username || `User-${m.user?.id?.slice(-4)}`;
            memberMap[m.user?.id] = displayName;
          });
          console.log('✅ Membres Discord récupérés:', Object.keys(memberMap).length);
          resolve(memberMap);
        } else {
          console.error('❌ Discord API error:', response.statusCode);
          reject(new Error(`Discord API error: ${response.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.error('❌ HTTPS request error:', err.message);
      reject(err);
    });
  });
}

// Get members with caching and fallback
let membersCache = null;
let membersCacheTime = 0;
async function getMembers() {
  const now = Date.now();
  if (membersCache && (now - membersCacheTime) < CACHE_DURATION) {
    console.log('🔄 Cache membres utilisé');
    return membersCache;
  }
  
  try {
    membersCache = await fetchDiscordMembers();
    membersCacheTime = now;
    return membersCache;
  } catch (err) {
    console.error('⚠️ Erreur fetch membres Discord:', err.message);
    // Fallback: extraire depuis la config
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    const fallbackMap = {};
    
    if (guildConfig.economy && guildConfig.economy.balances) {
      Object.keys(guildConfig.economy.balances).forEach(userId => {
        if (!fallbackMap[userId]) fallbackMap[userId] = `User-${userId.slice(-4)}`;
      });
    }
    if (guildConfig.levels && guildConfig.levels.users) {
      Object.keys(guildConfig.levels.users).forEach(userId => {
        if (!fallbackMap[userId]) fallbackMap[userId] = `User-${userId.slice(-4)}`;
      });
    }
    
    console.log('⚠️ Fallback config utilisé:', Object.keys(fallbackMap).length, 'membres');
    return membersCache || fallbackMap;
  }
}

// Get full guild config - MAIN ENDPOINT FOR DASHBOARD
app.get('/api/configs', async (req, res) => {
  try {
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    
    // Add channel names if requested
    if (req.query.include_channels === 'true') {
      const channels = await getChannels();
      guildConfig._channels = channels;
    }
    
    res.json(guildConfig);
  } catch (err) {
    console.error('Error in /api/configs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Discord channels
app.get('/api/discord/channels', async (req, res) => {
  try {
    const channels = await getChannels();
    res.json(channels);
  } catch (err) {
    console.error('Error fetching Discord channels:', err);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Get Discord roles
app.get('/api/discord/roles', async (req, res) => {
  try {
    const roles = await getRoles();
    res.json(roles);
  } catch (err) {
    console.error('Error fetching Discord roles:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get Discord members
app.get('/api/discord/members', async (req, res) => {
  try {
    const members = await getMembers();
    res.json(members);
  } catch (err) {
    console.error('Error in /api/discord/members:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Legacy endpoints for backward compatibility
app.get('/api/config', (req, res) => {
  try {
    const config = readConfig();
    res.json(config.guilds[GUILD] || {});
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/config/:section', (req, res) => {
  try {
    const config = readConfig();
    const section = req.params.section;
    res.json(config.guilds[GUILD]?.[section] || {});
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update economy settings
app.post('/api/economy', (req, res) => {
  try {
    const config = readConfig();
    if (!config.guilds[GUILD]) config.guilds[GUILD] = {};
    if (!config.guilds[GUILD].economy) config.guilds[GUILD].economy = {};
    
    if (req.body.settings) {
      config.guilds[GUILD].economy.settings = {
        ...config.guilds[GUILD].economy.settings,
        ...req.body.settings
      };
    }
    
    if (req.body.currency) {
      config.guilds[GUILD].economy.currency = {
        ...config.guilds[GUILD].economy.currency,
        ...req.body.currency
      };
    }
    
    if (writeConfig(config)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save config' });
    }
  } catch (err) {
    console.error('Error updating economy:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update actions (GIFs, messages, config)
app.post('/api/actions', (req, res) => {
  try {
    const { gifs, messages, config: actConfig } = req.body;
    const config = readConfig();
    if (!config.guilds[GUILD]) config.guilds[GUILD] = {};
    if (!config.guilds[GUILD].economy) config.guilds[GUILD].economy = {};
    if (!config.guilds[GUILD].economy.actions) config.guilds[GUILD].economy.actions = {};
    
    // Update GIFs if provided
    if (gifs !== undefined) {
      config.guilds[GUILD].economy.actions.gifs = gifs;
      console.log('✅ Actions GIFs updated');
    }
    
    // Update messages if provided
    if (messages !== undefined) {
      config.guilds[GUILD].economy.actions.messages = messages;
      console.log('✅ Actions messages updated');
    }
    
    // Update config if provided
    if (actConfig !== undefined) {
      config.guilds[GUILD].economy.actions.config = actConfig;
      console.log('✅ Actions config updated');
    }
    
    if (writeConfig(config)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save config' });
    }
  } catch (err) {
    console.error('Error updating actions:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// Update tickets configuration
app.post('/api/tickets', (req, res) => {
  try {
    const config = readConfig();
    if (!config.guilds[GUILD]) config.guilds[GUILD] = {};
    if (!config.guilds[GUILD].tickets) config.guilds[GUILD].tickets = {};
    
    // Update categories if provided
    if (req.body.categories !== undefined) {
      config.guilds[GUILD].tickets.categories = req.body.categories;
      console.log('✅ Tickets categories updated');
    }
    
    // Update panel if provided
    if (req.body.panel !== undefined) {
      config.guilds[GUILD].tickets.panel = req.body.panel;
      console.log('✅ Tickets panel updated');
    }
    
    // Update config if provided
    if (req.body.config !== undefined) {
      config.guilds[GUILD].tickets.config = req.body.config;
      console.log('✅ Tickets config updated');
    }
    
    // Update other ticket settings if provided
    if (req.body.settings) {
      config.guilds[GUILD].tickets = {
        ...config.guilds[GUILD].tickets,
        ...req.body.settings
      };
      console.log('✅ Tickets settings updated');
    }
    
    if (writeConfig(config)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save config' });
    }
  } catch (err) {
    console.error('Error updating tickets:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update confess configuration
app.post('/api/confess', (req, res) => {
  try {
    const config = readConfig();
    if (!config.guilds[GUILD]) config.guilds[GUILD] = {};
    if (!config.guilds[GUILD].confess) config.guilds[GUILD].confess = {};
    
    // Update confess settings
    if (req.body.settings) {
      config.guilds[GUILD].confess = {
        ...config.guilds[GUILD].confess,
        ...req.body.settings
      };
    }
    
    if (writeConfig(config)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save config' });
    }
  } catch (err) {
    console.error('Error updating confess:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Load welcome/goodbye routes
require('./welcome-routes')(app, readConfig, writeConfig, GUILD);

// ========== API MUSIQUE ==========

// GET /api/music - Récupérer les playlists et uploads
app.get('/api/music', (req, res) => {
  try {
    const playlistsPath = path.join(__dirname, '../data/playlists');
    const uploadsPath = path.join(__dirname, '../data/uploads');
    
    const playlists = [];
    if (fs.existsSync(playlistsPath)) {
      fs.readdirSync(playlistsPath).forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, file), 'utf8'));
            playlists.push({
              name: data.name,
              guildId: data.guildId,
              trackCount: data.tracks.length,
              updatedAt: data.updatedAt
            });
          } catch (e) {}
        }
      });
    }
    
    const uploads = [];
    if (fs.existsSync(uploadsPath)) {
      fs.readdirSync(uploadsPath).forEach(file => {
        const stats = fs.statSync(path.join(uploadsPath, file));
        uploads.push({
          filename: file,
          size: stats.size,
          uploadedAt: stats.mtime
        });
      });
    }
    
    res.json({ playlists, uploads });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/music/playlist - Créer/modifier une playlist
app.post('/api/music/playlist', (req, res) => {
  try {
    const { guildId, name, tracks } = req.body;
    const playlistsPath = path.join(__dirname, '../data/playlists');
    
    if (!fs.existsSync(playlistsPath)) {
      fs.mkdirSync(playlistsPath, { recursive: true });
    }
    
    const playlist = {
      name,
      guildId,
      tracks: tracks || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const filename = `${guildId}-${name.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(playlistsPath, filename), JSON.stringify(playlist, null, 2));
    
    res.json({ ok: true, filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/music/upload - Upload un fichier audio
app.post('/api/music/upload', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier' });
    }
    
    const uploadsPath = path.join(__dirname, '../data/uploads');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    
    const filename = `${Date.now()}-${req.file.originalname}`;
    fs.renameSync(req.file.path, path.join(uploadsPath, filename));
    
    res.json({ ok: true, filename, url: `/uploads/${filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/music/playlist/:guildId/:name
app.delete('/api/music/playlist/:guildId/:name', (req, res) => {
  try {
    const { guildId, name } = req.params;
    const playlistsPath = path.join(__dirname, '../data/playlists');
    const filename = `${guildId}-${name.replace(/[^a-z0-9]/gi, '_')}.json`;
    const filepath = path.join(playlistsPath, filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ ok: true });
    } else {
      res.status(404).json({ error: 'Playlist non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List backups
app.get('/backups', (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({ backups: [] });
    }
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          filename: f,
          date: stats.mtime.toLocaleString('fr-FR'),
          size: (stats.size / 1024).toFixed(2) + ' KB'
        };
      })
      .sort((a, b) => b.filename.localeCompare(a.filename));
    
    res.json({ backups: files });
  } catch (err) {
    console.error('Error listing backups:', err);
    res.json({ backups: [] });
  }
});

// Create backup
app.post('/backup', (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup-${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, filename);
    
    const config = readConfig();
    fs.writeFileSync(backupPath, JSON.stringify(config, null, 2), 'utf8');
    
    res.json({ success: true, filename });
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Restore backup
app.post('/restore', (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename required' });
    }
    
    const backupPath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Create a backup of current config before restoring
    const currentBackupPath = path.join(BACKUP_DIR, `pre-restore-${Date.now()}.json`);
    fs.writeFileSync(currentBackupPath, fs.readFileSync(CONFIG, 'utf8'));
    
    // Restore the backup
    fs.writeFileSync(CONFIG, JSON.stringify(backupData, null, 2), 'utf8');
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error restoring backup:', err);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// Bot control
app.post('/bot/control', (req, res) => {
  try {
    const { action } = req.body;
    
    if (action === 'restart') {
      // Restart the bot using PM2
      exec('pm2 restart bag-bot', (error, stdout, stderr) => {
        if (error) {
          console.error('Error restarting bot:', error);
        }
      });
      res.json({ success: true, message: 'Bot restart initiated' });
    } else if (action === 'deploy') {
      // Deploy commands
      exec('cd /home/bagbot/Bag-bot && node deploy-commands.js', (error, stdout, stderr) => {
        if (error) {
          console.error('Error deploying commands:', error);
        }
      });
      res.json({ success: true, message: 'Command deployment initiated' });
    } else {
      res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error('Error in bot control:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== CONFIGURATION MULTER POUR UPLOADS ==========

app.get('/api/music', (req, res) => {
  try {
    const playlistsPath = path.join(__dirname, '../data/playlists');
    const uploadsPath = path.join(__dirname, '../data/uploads');
    
    const playlists = [];
    if (fs.existsSync(playlistsPath)) {
      fs.readdirSync(playlistsPath).forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, file), 'utf8'));
            playlists.push({
              name: data.name,
              guildId: data.guildId,
              trackCount: (data.tracks || []).length,
              updatedAt: data.updatedAt || Date.now()
            });
          } catch (e) {
            console.error(`Erreur lecture playlist ${file}:`, e);
          }
        }
      });
    }
    
    const uploads = [];
    let totalSize = 0;
    if (fs.existsSync(uploadsPath)) {
      fs.readdirSync(uploadsPath).forEach(file => {
        try {
          const stats = fs.statSync(path.join(uploadsPath, file));
          uploads.push({
            filename: file,
            size: stats.size,
            uploadedAt: stats.mtimeMs
          });
          totalSize += stats.size;
        } catch (e) {
          console.error(`Erreur stats ${file}:`, e);
        }
      });
    }
    
    res.json({ playlists, uploads, totalSize });
  } catch (error) {
    console.error('Erreur API /api/music:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/music/playlist/:guildId/:name - Détail d'une playlist
app.get('/api/music/playlist/:guildId/:name', (req, res) => {
  try {
    const { guildId, name } = req.params;
    const playlistsPath = path.join(__dirname, '../data/playlists');
    
    if (!fs.existsSync(playlistsPath)) {
      return res.status(404).json({ error: 'Aucune playlist' });
    }
    
    const files = fs.readdirSync(playlistsPath);
    const playlistFile = files.find(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, f), 'utf8'));
        return data.guildId === guildId && data.name === name;
      } catch (e) {
        return false;
      }
    });
    
    if (playlistFile) {
      const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, playlistFile), 'utf8'));
      res.json(data);
    } else {
      res.status(404).json({ error: 'Playlist non trouvée' });
    }
  } catch (error) {
    console.error('Erreur détail playlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/music/upload - Upload fichier audio
app.post('/api/music/upload', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier' });
    }
    console.log('Fichier uploadé:', req.file.filename);
    res.json({ ok: true, filename: req.file.filename });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/music/upload/:filename - Supprimer un fichier uploadé
app.delete('/api/music/upload/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsPath = path.join(__dirname, '../data/uploads');
    const filepath = path.join(uploadsPath, filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log('Fichier supprimé:', filename);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Fichier non trouvé' });
    }
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/music/playlist/:guildId/:name - Renommer une playlist
app.put('/api/music/playlist/:guildId/:name', (req, res) => {
  try {
    const { guildId, name } = req.params;
    const { newName } = req.body;
    
    if (!newName || newName.trim() === '') {
      return res.status(400).json({ error: 'Nouveau nom requis' });
    }
    
    const playlistsPath = path.join(__dirname, '../data/playlists');
    const files = fs.readdirSync(playlistsPath);
    
    const playlistFile = files.find(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, f), 'utf8'));
        return data.guildId === guildId && data.name === name;
      } catch (e) {
        return false;
      }
    });
    
    if (playlistFile) {
      const filepath = path.join(playlistsPath, playlistFile);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      // Vérifier qu'aucune autre playlist n'a ce nom
      const nameExists = files.some(f => {
        if (f === playlistFile) return false;
        try {
          const otherData = JSON.parse(fs.readFileSync(path.join(playlistsPath, f), 'utf8'));
          return otherData.guildId === guildId && otherData.name === newName.trim();
        } catch (e) {
          return false;
        }
      });
      
      if (nameExists) {
        return res.status(400).json({ error: 'Une playlist avec ce nom existe déjà' });
      }
      
      data.name = newName.trim();
      data.updatedAt = Date.now();
      
      const newFilename = `${guildId}-${newName.trim().replace(/[^a-zA-Z0-9-_]/g, '_')}.json`;
      const newFilepath = path.join(playlistsPath, newFilename);
      
      fs.writeFileSync(newFilepath, JSON.stringify(data, null, 2));
      if (filepath !== newFilepath) {
        fs.unlinkSync(filepath);
      }
      
      console.log(`Playlist renommée: ${name} -> ${newName}`);
      res.json({ success: true, playlist: data });
    } else {
      res.status(404).json({ error: 'Playlist non trouvée' });
    }
  } catch (error) {
    console.error('Erreur renommage playlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/music/playlist/:guildId/:name - Supprimer une playlist
app.delete('/api/music/playlist/:guildId/:name', (req, res) => {
  try {
    const { guildId, name } = req.params;
    const playlistsPath = path.join(__dirname, '../data/playlists');
    
    const files = fs.readdirSync(playlistsPath);
    const playlistFile = files.find(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, f), 'utf8'));
        return data.guildId === guildId && data.name === name;
      } catch (e) {
        return false;
      }
    });
    
    if (playlistFile) {
      fs.unlinkSync(path.join(playlistsPath, playlistFile));
      console.log('Playlist supprimée:', name);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Playlist non trouvée' });
    }
  } catch (error) {
    console.error('Erreur suppression playlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/music/playlist/:guildId/:name/track/:index - Supprimer une piste
app.delete('/api/music/playlist/:guildId/:name/track/:index', (req, res) => {
  try {
    const { guildId, name, index } = req.params;
    const playlistsPath = path.join(__dirname, '../data/playlists');
    
    const files = fs.readdirSync(playlistsPath);
    const playlistFile = files.find(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, f), 'utf8'));
        return data.guildId === guildId && data.name === name;
      } catch (e) {
        return false;
      }
    });
    
    if (playlistFile) {
      const filepath = path.join(playlistsPath, playlistFile);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      const trackIndex = parseInt(index);
      if (trackIndex >= 0 && trackIndex < data.tracks.length) {
        const removedTrack = data.tracks.splice(trackIndex, 1)[0];
        data.updatedAt = Date.now();
        
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`Piste supprimée: ${removedTrack.title}`);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Piste non trouvée' });
      }
    } else {
      res.status(404).json({ error: 'Playlist non trouvée' });
    }
  } catch (error) {
    console.error('Erreur suppression piste:', error);
    res.status(500).json({ error: error.message });
  }
});


// POST /api/music/playlist/create - Créer une nouvelle playlist
app.post('/api/music/playlist/create', (req, res) => {
  try {
    const { guildId, name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nom de playlist requis' });
    }
    
    const playlistsPath = path.join(__dirname, '../data/playlists');
    if (!fs.existsSync(playlistsPath)) {
      fs.mkdirSync(playlistsPath, { recursive: true });
    }
    
    // Vérifier qu'aucune playlist n'a ce nom
    const files = fs.readdirSync(playlistsPath);
    const nameExists = files.some(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, f), 'utf8'));
        return data.guildId === guildId && data.name === name.trim();
      } catch (e) {
        return false;
      }
    });
    
    if (nameExists) {
      return res.status(400).json({ error: 'Une playlist avec ce nom existe déjà' });
    }
    
    const playlist = {
      name: name.trim(),
      guildId: guildId,
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const filename = `${guildId}-${name.trim().replace(/[^a-zA-Z0-9-_]/g, '_')}.json`;
    const filepath = path.join(playlistsPath, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(playlist, null, 2));
    console.log(`✅ Nouvelle playlist créée: ${name}`);
    res.json({ success: true, playlist });
  } catch (error) {
    console.error('Erreur création playlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/music/playlist/:guildId/:name/add - Ajouter une piste à une playlist
app.post('/api/music/playlist/:guildId/:name/add', (req, res) => {
  try {
    const { guildId, name } = req.params;
    const { filename, title, author, duration } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Nom de fichier requis' });
    }
    
    const playlistsPath = path.join(__dirname, '../data/playlists');
    const files = fs.readdirSync(playlistsPath);
    
    const playlistFile = files.find(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(playlistsPath, f), 'utf8'));
        return data.guildId === guildId && data.name === name;
      } catch (e) {
        return false;
      }
    });
    
    if (playlistFile) {
      const filepath = path.join(playlistsPath, playlistFile);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      // Créer la piste avec les métadonnées
      const track = {
        title: title || filename.replace(/^\d+-/, '').replace(/\.[^.]+$/, ''),
        author: author || 'Artiste inconnu',
        filename: filename,
        duration: duration || '0:00',
        addedAt: Date.now()
      };
      
      data.tracks.push(track);
      data.updatedAt = Date.now();
      
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`✅ Piste ajoutée à ${name}: ${track.title}`);
      res.json({ success: true, playlist: data });
    } else {
      res.status(404).json({ error: 'Playlist non trouvée' });
    }
  } catch (error) {
    console.error('Erreur ajout piste:', error);
    res.status(500).json({ error: error.message });
  }
});


// Charger le router add-link
require("./add-link-router")(app);



// ============ A/V (Action/Vérité) API Routes ============

// Get A/V prompts for a mode (sfw or nsfw)
app.get('/api/truthdare/:mode', (req, res) => {
  try {
    const { mode } = req.params;
    if (!['sfw', 'nsfw'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be sfw or nsfw' });
    }
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    const tdData = guildConfig.truthdare || { sfw: { prompts: [], channels: [] }, nsfw: { prompts: [], channels: [] } };
    res.json(tdData[mode] || { prompts: [], channels: [] });
  } catch (err) {
    console.error('Error in GET /api/truthdare/:mode:', err);
    res.status(500).json({ error: 'Failed to fetch truth/dare data' });
  }
});

// Add a new prompt
app.post('/api/truthdare/:mode', (req, res) => {
  try {
    const { mode } = req.params;
    const { type, text } = req.body;
    if (!['sfw', 'nsfw'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be sfw or nsfw' });
    }
    if (!type || !text) {
      return res.status(400).json({ error: 'Type and text are required' });
    }
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    if (!guildConfig.truthdare) {
      guildConfig.truthdare = { sfw: { prompts: [], channels: [] }, nsfw: { prompts: [], channels: [] } };
    }
    if (!guildConfig.truthdare[mode]) {
      guildConfig.truthdare[mode] = { prompts: [], channels: [] };
    }
    if (!guildConfig.truthdare[mode].prompts) {
      guildConfig.truthdare[mode].prompts = [];
    }
    const newId = Math.max(0, ...guildConfig.truthdare[mode].prompts.map(p => p.id || 0)) + 1;
    const newPrompt = { id: newId, type, text };
    guildConfig.truthdare[mode].prompts.push(newPrompt);
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    console.log(`✅ Prompt A/V ${mode} ajouté: #${newId} (${type})`);
    res.json({ success: true, prompt: newPrompt });
  } catch (err) {
    console.error('Error in POST /api/truthdare/:mode:', err);
    res.status(500).json({ error: 'Failed to add prompt' });
  }
});

// Edit a prompt
app.patch('/api/truthdare/:mode/:id', (req, res) => {
  try {
    const { mode, id } = req.params;
    const { text } = req.body;
    if (!['sfw', 'nsfw'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be sfw or nsfw' });
    }
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    if (!guildConfig.truthdare || !guildConfig.truthdare[mode] || !guildConfig.truthdare[mode].prompts) {
      return res.status(404).json({ error: 'No prompts found' });
    }
    const promptId = parseInt(id);
    const prompt = guildConfig.truthdare[mode].prompts.find(p => p.id === promptId);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    prompt.text = text;
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    console.log(`✅ Prompt A/V ${mode} modifié: #${promptId}`);
    res.json({ success: true, prompt });
  } catch (err) {
    console.error('Error in PATCH /api/truthdare/:mode/:id:', err);
    res.status(500).json({ error: 'Failed to edit prompt' });
  }
});

// Delete a prompt
app.delete('/api/truthdare/:mode/:id', (req, res) => {
  try {
    const { mode, id } = req.params;
    if (!['sfw', 'nsfw'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be sfw or nsfw' });
    }
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    if (!guildConfig.truthdare || !guildConfig.truthdare[mode] || !guildConfig.truthdare[mode].prompts) {
      return res.status(404).json({ error: 'No prompts found' });
    }
    const promptId = parseInt(id);
    const index = guildConfig.truthdare[mode].prompts.findIndex(p => p.id === promptId);
    if (index === -1) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    guildConfig.truthdare[mode].prompts.splice(index, 1);
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    console.log(`✅ Prompt A/V ${mode} supprimé: #${promptId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/truthdare/:mode/:id:', err);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// Add a channel
app.post('/api/truthdare/:mode/channels', (req, res) => {
  try {
    const { mode } = req.params;
    const { channelId } = req.body;
    if (!['sfw', 'nsfw'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be sfw or nsfw' });
    }
    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    if (!guildConfig.truthdare) {
      guildConfig.truthdare = { sfw: { prompts: [], channels: [] }, nsfw: { prompts: [], channels: [] } };
    }
    if (!guildConfig.truthdare[mode]) {
      guildConfig.truthdare[mode] = { prompts: [], channels: [] };
    }
    if (!guildConfig.truthdare[mode].channels) {
      guildConfig.truthdare[mode].channels = [];
    }
    if (!guildConfig.truthdare[mode].channels.includes(channelId)) {
      guildConfig.truthdare[mode].channels.push(channelId);
    }
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    console.log(`✅ Channel A/V ${mode} ajouté: ${channelId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/truthdare/:mode/channels:', err);
    res.status(500).json({ error: 'Failed to add channel' });
  }
});

// Delete a channel
app.delete('/api/truthdare/:mode/channels/:channelId', (req, res) => {
  try {
    const { mode, channelId } = req.params;
    if (!['sfw', 'nsfw'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be sfw or nsfw' });
    }
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    if (!guildConfig.truthdare || !guildConfig.truthdare[mode] || !guildConfig.truthdare[mode].channels) {
      return res.status(404).json({ error: 'No channels found' });
    }
    const index = guildConfig.truthdare[mode].channels.indexOf(channelId);
    if (index === -1) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    guildConfig.truthdare[mode].channels.splice(index, 1);
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    console.log(`✅ Channel A/V ${mode} supprimé: ${channelId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/truthdare/:mode/channels/:channelId:', err);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

// ============ Counting API Routes ============

// Get counting configuration
app.get('/api/counting', (req, res) => {
  try {
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    const counting = guildConfig.counting || { allowFormulas: false, state: {}, achievedNumbers: [] };
    res.json(counting);
  } catch (err) {
    console.error('Error in GET /api/counting:', err);
    res.status(500).json({ error: 'Failed to fetch counting config' });
  }
});

// Update counting configuration
app.post('/api/counting', (req, res) => {
  try {
    const { allowFormulas, channels } = req.body;
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    
    if (!guildConfig.counting) {
      guildConfig.counting = { allowFormulas: false, state: {}, achievedNumbers: [], channels: [] };
    }
    
    if (allowFormulas !== undefined) {
      guildConfig.counting.allowFormulas = allowFormulas;
    }
    if (channels !== undefined) {
      guildConfig.counting.channels = channels;
    }
    
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    
    console.log(`✅ Counting config updated: allowFormulas=${allowFormulas}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/counting:', err);
    res.status(500).json({ error: 'Failed to update counting config' });
  }
});

// Add counting channel
app.post('/api/counting/channels', (req, res) => {
  try {
    const { channelId } = req.body;
    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }
    
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    
    if (!guildConfig.counting) {
      guildConfig.counting = { allowFormulas: false, state: {}, achievedNumbers: [], channels: [] };
    }
    if (!guildConfig.counting.channels) {
      guildConfig.counting.channels = [];
    }
    
    if (!guildConfig.counting.channels.includes(channelId)) {
      guildConfig.counting.channels.push(channelId);
    }
    
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    
    console.log(`✅ Counting channel ajouté: ${channelId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/counting/channels:', err);
    res.status(500).json({ error: 'Failed to add channel' });
  }
});

// Delete counting channel
app.delete('/api/counting/channels/:channelId', (req, res) => {
  try {
    const { channelId } = req.params;
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    
    if (!guildConfig.counting || !guildConfig.counting.channels) {
      return res.status(404).json({ error: 'No channels found' });
    }
    
    const index = guildConfig.counting.channels.indexOf(channelId);
    if (index === -1) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    guildConfig.counting.channels.splice(index, 1);
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    
    console.log(`✅ Counting channel supprimé: ${channelId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/counting/channels/:channelId:', err);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

// ============ Inactivity Kick API Routes ============

// Update inactivity kick configuration
app.post('/api/autokick/inactivity', (req, res) => {
  try {
    const { enabled, delayDays, trackActivity, excludedRoleIds } = req.body;
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    
    if (!guildConfig.autokick) {
      guildConfig.autokick = { enabled: false, roleId: '', delayMs: 0, pendingJoiners: {} };
    }
    
    if (!guildConfig.autokick.inactivityKick) {
      guildConfig.autokick.inactivityKick = {};
    }
    
    if (enabled !== undefined) guildConfig.autokick.inactivityKick.enabled = enabled;
    if (delayDays !== undefined) guildConfig.autokick.inactivityKick.delayDays = delayDays;
    if (trackActivity !== undefined) guildConfig.autokick.inactivityKick.trackActivity = trackActivity;
    if (excludedRoleIds !== undefined) guildConfig.autokick.inactivityKick.excludedRoleIds = excludedRoleIds;
    
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    
    console.log(`✅ Inactivity kick config updated`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/autokick/inactivity:', err);
    res.status(500).json({ error: 'Failed to update inactivity kick config' });
  }
});

// Get inactivity kick statistics
app.get('/api/autokick/inactivity/stats', (req, res) => {
  try {
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    const autokick = guildConfig.autokick || {};
    const inactivityKick = autokick.inactivityKick || {};
    const tracking = autokick.inactivityTracking || {};
    
    const now = Date.now();
    const delayMs = (inactivityKick.delayDays || 30) * 24 * 60 * 60 * 1000;
    
    let totalTracked = 0;
    let plannedInactive = 0;
    let atRisk = 0;
    const plannedList = [];
    
    for (const [userId, data] of Object.entries(tracking)) {
      totalTracked++;
      if (data.plannedInactive && data.plannedInactive.until > now) {
        plannedInactive++;
        plannedList.push({
          userId,
          until: data.plannedInactive.until,
          reason: data.plannedInactive.reason
        });
      } else {
        const lastActivity = data.lastActivity || 0;
        const inactiveDuration = now - lastActivity;
        if (inactiveDuration > delayMs * 0.8) {
          atRisk++;
        }
      }
    }
    
    res.json({ 
      success: true, 
      stats: {
        totalTracked,
        plannedInactive,
        atRisk,
        plannedList
      }
    });
  } catch (err) {
    console.error('Error in GET /api/autokick/inactivity/stats:', err);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// ============ Welcome API Routes ============

// Get welcome configuration
app.get('/api/welcome', (req, res) => {
  try {
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    const welcome = guildConfig.welcome || {
      enabled: false,
      channelId: '',
      message: '',
      embedEnabled: false,
      embedTitle: '',
      embedDescription: '',
      embedColor: '',
      embedFooter: '',
      sendEmbedInDM: false
    };
    res.json(welcome);
  } catch (err) {
    console.error('Error in GET /api/welcome:', err);
    res.status(500).json({ error: 'Failed to fetch welcome config' });
  }
});

// Update welcome configuration
app.post('/api/welcome', (req, res) => {
  try {
    const { welcome } = req.body;
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    
    guildConfig.welcome = welcome;
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    
    console.log(`✅ Welcome config updated`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/welcome:', err);
    res.status(500).json({ error: 'Failed to update welcome config' });
  }
});

// ============ Goodbye API Routes ============

// Get goodbye configuration
app.get('/api/goodbye', (req, res) => {
  try {
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    const goodbye = guildConfig.goodbye || {
      enabled: false,
      channelId: '',
      message: '',
      embedEnabled: false,
      embedTitle: '',
      embedDescription: '',
      embedColor: '',
      embedFooter: ''
    };
    res.json(goodbye);
  } catch (err) {
    console.error('Error in GET /api/goodbye:', err);
    res.status(500).json({ error: 'Failed to fetch goodbye config' });
  }
});

// Update goodbye configuration
app.post('/api/goodbye', (req, res) => {
  try {
    const { goodbye } = req.body;
    const config = readConfig();
    const guildConfig = config.guilds[GUILD] || {};
    
    guildConfig.goodbye = goodbye;
    config.guilds[GUILD] = guildConfig;
    writeConfig(config);
    
    console.log(`✅ Goodbye config updated`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/goodbye:', err);
    res.status(500).json({ error: 'Failed to update goodbye config' });
  }
});

// ============ Page Routes ============

// Route pour la page principale avec headers no-cache
app.get(['/', '/index.html'], (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  res.sendFile(path.join(__dirname, 'index-NEW.html'));
});

// Route pour la page musique
app.get('/music', (req, res) => {
  res.sendFile(path.join(__dirname, 'music.html'));
});

// Route pour la page de test
app.get('/test', (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.sendFile(path.join(__dirname, 'test.html'));
});

app.listen(PORT, () => {
  console.log(`✓ Dashboard V2 Server running on port ${PORT}`);
  console.log(`✓ Guild ID: ${GUILD}`);
  console.log(`✓ Config file: ${CONFIG}`);
  console.log(`✓ Access: http://localhost:${PORT}`);
  console.log(`✓ Discord API integration enabled`);
});
