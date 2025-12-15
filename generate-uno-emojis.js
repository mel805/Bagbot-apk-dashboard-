const { createCanvas } = require('canvas');
const https = require('https');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID || process.env.CLIENT_ID;

if (!TOKEN || !APPLICATION_ID) {
  console.error('❌ DISCORD_TOKEN et APPLICATION_ID requis !');
  process.exit(1);
}

// Fonction pour générer une carte UNO
function generateCard(color, value, type) {
  const canvas = createCanvas(200, 300);
  const ctx = canvas.getContext('2d');
  
  // Couleurs
  const colors = {
    red: '#FF0000',
    blue: '#0000FF',
    green: '#00AA00',
    yellow: '#FFAA00',
    wild: '#000000'
  };
  
  // Fond blanc avec bord arrondi
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 200, 300);
  
  // Bordure colorée
  ctx.strokeStyle = colors[color] || '#000000';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 192, 292);
  
  // Zone colorée centrale (ovale)
  ctx.fillStyle = colors[color] || '#000000';
  ctx.beginPath();
  ctx.ellipse(100, 150, 70, 110, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Zone blanche pour le texte/symbole
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(100, 150, 50, 80, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Texte/Symbole
  ctx.fillStyle = colors[color] || '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (type === 'number') {
    ctx.font = 'bold 80px Arial';
    ctx.fillText(value.toString(), 100, 150);
  } else if (type === 'skip') {
    ctx.font = 'bold 60px Arial';
    ctx.fillText('🚫', 100, 150);
  } else if (type === 'reverse') {
    ctx.font = 'bold 60px Arial';
    ctx.fillText('🔄', 100, 150);
  } else if (type === 'draw2') {
    ctx.font = 'bold 50px Arial';
    ctx.fillText('+2', 100, 150);
  } else if (type === 'wild') {
    // Joker multicolore
    const segments = ['#FF0000', '#0000FF', '#00AA00', '#FFAA00'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = segments[i];
      ctx.beginPath();
      ctx.moveTo(100, 150);
      ctx.arc(100, 150, 70, (i * Math.PI / 2) - Math.PI / 2, ((i + 1) * Math.PI / 2) - Math.PI / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(100, 150, 50, 80, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('W', 100, 150);
  } else if (type === 'wild_draw4') {
    // Joker +4 multicolore
    const segments = ['#FF0000', '#0000FF', '#00AA00', '#FFAA00'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = segments[i];
      ctx.beginPath();
      ctx.moveTo(100, 150);
      ctx.arc(100, 150, 70, (i * Math.PI / 2) - Math.PI / 2, ((i + 1) * Math.PI / 2) - Math.PI / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(100, 150, 50, 80, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('+4', 100, 150);
  }
  
  // Coins (petit symbole en haut à gauche et bas à droite)
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = colors[color] || '#000000';
  
  if (type === 'number') {
    ctx.fillText(value.toString(), 20, 30);
    ctx.fillText(value.toString(), 180, 270);
  } else if (type === 'skip') {
    ctx.fillText('S', 20, 30);
    ctx.fillText('S', 180, 270);
  } else if (type === 'reverse') {
    ctx.fillText('R', 20, 30);
    ctx.fillText('R', 180, 270);
  } else if (type === 'draw2') {
    ctx.fillText('+2', 20, 30);
    ctx.fillText('+2', 180, 270);
  }
  
  return canvas.toBuffer('image/png');
}

// Liste des cartes à générer
const cards = [];
const colors = ['red', 'blue', 'green', 'yellow'];

// Cartes numérotées
for (const color of colors) {
  for (let i = 0; i <= 9; i++) {
    cards.push({ name: `uno_${color[0]}${i}`, color, value: i, type: 'number' });
  }
  // Cartes spéciales
  cards.push({ name: `uno_${color[0]}skip`, color, type: 'skip' });
  cards.push({ name: `uno_${color[0]}rev`, color, type: 'reverse' });
  cards.push({ name: `uno_${color[0]}p2`, color, type: 'draw2' });
}

// Jokers
cards.push({ name: 'uno_wild', color: 'wild', type: 'wild' });
cards.push({ name: 'uno_wildp4', color: 'wild', type: 'wild_draw4' });

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
  console.log('🎨 Génération et upload des emojis UNO...\n');
  console.log(`📦 Cartes à créer: ${cards.length}\n`);
  
  // Vérifier les emojis existants
  console.log('🔍 Vérification des emojis existants...');
  let existingEmojis = [];
  try {
    const response = await discordApiRequest('GET', `/api/v10/applications/${APPLICATION_ID}/emojis`);
    existingEmojis = response.items || [];
    console.log(`✅ Emojis d'application existants: ${existingEmojis.length}\n`);
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
      console.log(`${progress} 🎨 Génération: ${card.name}...`);
      const imageBuffer = generateCard(card.color, card.value, card.type);
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      
      console.log(`${progress} 📤 Upload: ${card.name}...`);
      await discordApiRequest('POST', `/api/v10/applications/${APPLICATION_ID}/emojis`, {
        name: card.name,
        image: base64Image
      });
      
      uploaded++;
      console.log(`${progress} ✅ ${card.name} créé !\n`);
      
      // Pause pour éviter le rate limit
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      failed++;
      console.log(`${progress} ❌ Erreur pour ${card.name}: ${error.message}\n`);
      
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
    console.log('\n✅ Les emojis UNO sont maintenant disponibles !');
    console.log('   Ce sont des Application Emojis du bot.');
  }
}

uploadEmojis()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ ERREUR FATALE:', error.message);
    process.exit(1);
  });
