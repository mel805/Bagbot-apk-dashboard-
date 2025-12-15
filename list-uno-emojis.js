const https = require('https');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID || process.env.CLIENT_ID;

function discordApiRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'discord.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bot ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data || '{}'));
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function listEmojis() {
  const response = await discordApiRequest('GET', `/api/v10/applications/${APPLICATION_ID}/emojis`);
  const emojis = response.items || [];
  
  console.log(`\n📊 Application Emojis: ${emojis.length}\n`);
  
  const emojiMap = {};
  emojis.forEach(emoji => {
    emojiMap[emoji.name] = emoji.id;
    console.log(`<:${emoji.name}:${emoji.id}>`);
  });
  
  console.log('\n// Mapping pour uno.js:');
  console.log('const EMOJI_MAP = {');
  Object.entries(emojiMap).forEach(([name, id]) => {
    console.log(`  '${name}': '<:${name}:${id}>',`);
  });
  console.log('};');
}

listEmojis()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  });
