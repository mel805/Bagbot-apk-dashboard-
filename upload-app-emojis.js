const https = require('https');
const fs = require('fs');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID || process.env.CLIENT_ID;

if (!TOKEN || !APPLICATION_ID) {
  console.error('❌ DISCORD_TOKEN et APPLICATION_ID requis !');
  process.exit(1);
}

// Cartes UNO à uploader (54 emojis - limite raisonnable)
const cards = [
  // Rouges
  { name: 'uno_r0', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_0.png' },
  { name: 'uno_r1', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_1.png' },
  { name: 'uno_r2', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_2.png' },
  { name: 'uno_r3', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_3.png' },
  { name: 'uno_r4', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_4.png' },
  { name: 'uno_r5', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_5.png' },
  { name: 'uno_r6', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_6.png' },
  { name: 'uno_r7', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_7.png' },
  { name: 'uno_r8', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_8.png' },
  { name: 'uno_r9', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_9.png' },
  { name: 'uno_rskip', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_skip.png' },
  { name: 'uno_rrev', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_reverse.png' },
  { name: 'uno_rp2', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/red/red_picker.png' },
  
  // Bleues
  { name: 'uno_b0', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_0.png' },
  { name: 'uno_b1', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_1.png' },
  { name: 'uno_b2', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_2.png' },
  { name: 'uno_b3', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_3.png' },
  { name: 'uno_b4', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_4.png' },
  { name: 'uno_b5', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_5.png' },
  { name: 'uno_b6', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_6.png' },
  { name: 'uno_b7', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_7.png' },
  { name: 'uno_b8', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_8.png' },
  { name: 'uno_b9', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_9.png' },
  { name: 'uno_bskip', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_skip.png' },
  { name: 'uno_brev', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_reverse.png' },
  { name: 'uno_bp2', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/blue/blue_picker.png' },
  
  // Vertes
  { name: 'uno_g0', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_0.png' },
  { name: 'uno_g1', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_1.png' },
  { name: 'uno_g2', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_2.png' },
  { name: 'uno_g3', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_3.png' },
  { name: 'uno_g4', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_4.png' },
  { name: 'uno_g5', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_5.png' },
  { name: 'uno_g6', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_6.png' },
  { name: 'uno_g7', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_7.png' },
  { name: 'uno_g8', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_8.png' },
  { name: 'uno_g9', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_9.png' },
  { name: 'uno_gskip', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_skip.png' },
  { name: 'uno_grev', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_reverse.png' },
  { name: 'uno_gp2', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/green/green_picker.png' },
  
  // Jaunes
  { name: 'uno_y0', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_0.png' },
  { name: 'uno_y1', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_1.png' },
  { name: 'uno_y2', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_2.png' },
  { name: 'uno_y3', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_3.png' },
  { name: 'uno_y4', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_4.png' },
  { name: 'uno_y5', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_5.png' },
  { name: 'uno_y6', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_6.png' },
  { name: 'uno_y7', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_7.png' },
  { name: 'uno_y8', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_8.png' },
  { name: 'uno_y9', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_9.png' },
  { name: 'uno_yskip', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_skip.png' },
  { name: 'uno_yrev', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_reverse.png' },
  { name: 'uno_yp2', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/yellow/yellow_picker.png' },
  
  // Jokers
  { name: 'uno_wild', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/wild/wild_color_changer.png' },
  { name: 'uno_wildp4', url: 'https://raw.githubusercontent.com/Tomer-Rubinstein/UNO/main/cards/wild/wild_pick_4.png' }
];

function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function discordApiRequest(method, path, body = null) {
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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function uploadEmojis() {
  console.log('🚀 Upload des emojis d\'application UNO...\n');
  console.log(`📦 Cartes à uploader: ${cards.length}\n`);
  
  // Vérifier les emojis existants
  console.log('🔍 Vérification des emojis existants...');
  let existingEmojis = [];
  try {
    const response = await discordApiRequest('GET', `/api/v10/applications/${APPLICATION_ID}/emojis`);
    existingEmojis = response.items || [];
    console.log(`✅ Emojis d'application existants: ${existingEmojis.length}\n`);
    
    const unoEmojis = existingEmojis.filter(e => e.name.startsWith('uno_'));
    if (unoEmojis.length > 0) {
      console.log(`⚠️  ${unoEmojis.length} emojis UNO déjà présents`);
      console.log('   Les emojis existants seront ignorés.\n');
    }
  } catch (error) {
    console.log(`⚠️  Impossible de lister les emojis: ${error.message}\n`);
  }
  
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const progress = `[${i + 1}/${cards.length}]`;
    
    // Vérifier si l'emoji existe déjà
    if (existingEmojis.find(e => e.name === card.name)) {
      console.log(`${progress} ⏭️  ${card.name} (existe déjà)`);
      skipped++;
      continue;
    }
    
    try {
      console.log(`${progress} 📥 Téléchargement: ${card.name}...`);
      const imageBuffer = await fetchImageBuffer(card.url);
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      
      console.log(`${progress} 📤 Upload: ${card.name}...`);
      await discordApiRequest('POST', `/api/v10/applications/${APPLICATION_ID}/emojis`, {
        name: card.name,
        image: base64Image
      });
      
      uploaded++;
      console.log(`${progress} ✅ ${card.name} créé !\n`);
      
      // Pause pour éviter le rate limit (max 5 requêtes par seconde)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      failed++;
      console.log(`${progress} ❌ Erreur pour ${card.name}: ${error.message}\n`);
      
      // Si rate limit, attendre plus longtemps
      if (error.message.includes('429')) {
        console.log('⏸️  Rate limit atteint, pause de 10 secondes...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSULTAT FINAL:');
  console.log(`✅ Uploadés: ${uploaded}`);
  console.log(`⏭️  Ignorés: ${skipped}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log('='.repeat(50));
  
  if (uploaded > 0) {
    console.log('\n✅ Les emojis sont maintenant disponibles pour le bot !');
    console.log('   Utilisez-les avec: <:nom_emoji:id>');
  }
}

uploadEmojis()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ ERREUR FATALE:', error.message);
    process.exit(1);
  });
