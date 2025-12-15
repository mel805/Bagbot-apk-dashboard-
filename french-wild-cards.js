const { createCanvas } = require('canvas');
const https = require('https');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID || process.env.CLIENT_ID;

// Fonction pour générer une carte WILD/JOKER
function generateWildCard(type) {
  const canvas = createCanvas(200, 300);
  const ctx = canvas.getContext('2d');
  
  // Fond blanc
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 200, 300);
  
  // Bordure noire
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 190, 290);
  
  // Joker multicolore (4 quarts)
  const segments = [
    { color: '#E3171E', start: 0, end: 0.5 },           // Rouge haut
    { color: '#FED503', start: 0.5, end: 1 },          // Jaune droite
    { color: '#00A651', start: 1, end: 1.5 },          // Vert bas
    { color: '#0063B3', start: 1.5, end: 2 }           // Bleu gauche
  ];
  
  for (const seg of segments) {
    ctx.fillStyle = seg.color;
    ctx.beginPath();
    ctx.moveTo(100, 150);
    ctx.arc(100, 150, 75, seg.start * Math.PI, seg.end * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  
  // Zone blanche centrale
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(100, 150, 55, 0, 2 * Math.PI);
  ctx.fill();
  
  // Texte en français
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (type === 'wild') {
    // Juste "JOKER" ou laisser vide avec les couleurs
    ctx.font = 'bold 28px Arial';
    ctx.fillText('JOKER', 100, 150);
  } else if (type === 'wild_draw4') {
    // "+4" bien visible
    ctx.font = 'bold 60px Arial';
    ctx.fillText('+4', 100, 150);
  }
  
  // Petits symboles dans les coins
  ctx.font = 'bold 24px Arial';
  if (type === 'wild') {
    ctx.fillText('J', 25, 35);
    ctx.save();
    ctx.translate(175, 265);
    ctx.rotate(Math.PI);
    ctx.fillText('J', 0, 0);
    ctx.restore();
  } else {
    ctx.fillText('+4', 25, 35);
    ctx.save();
    ctx.translate(175, 265);
    ctx.rotate(Math.PI);
    ctx.fillText('+4', 0, 0);
    ctx.restore();
  }
  
  return canvas.toBuffer('image/png');
}

// Cartes WILD à mettre en français
const wildCards = [
  { name: 'uno_wild', type: 'wild' },
  { name: 'uno_wildp4', type: 'wild_draw4' }
];

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

async function updateWildCards() {
  console.log('🎨 Mise à jour des cartes JOKER en français...\n');
  
  const response = await discordApiRequest('GET', `/api/v10/applications/${APPLICATION_ID}/emojis`);
  const existingEmojis = response.items || [];
  
  let updated = 0;
  
  for (let i = 0; i < wildCards.length; i++) {
    const card = wildCards[i];
    const progress = `[${i + 1}/${wildCards.length}]`;
    
    try {
      const existingEmoji = existingEmojis.find(e => e.name === card.name);
      
      if (existingEmoji) {
        console.log(`${progress} 🗑️  Suppression de ${card.name}...`);
        await discordApiRequest('DELETE', `/api/v10/applications/${APPLICATION_ID}/emojis/${existingEmoji.id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`${progress} 🎨 Génération: ${card.name} (français)...`);
      const imageBuffer = generateWildCard(card.type);
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      
      console.log(`${progress} 📤 Upload: ${card.name}...`);
      await discordApiRequest('POST', `/api/v10/applications/${APPLICATION_ID}/emojis`, {
        name: card.name,
        image: base64Image
      });
      
      updated++;
      console.log(`${progress} ✅ ${card.name} mis à jour !\n`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`${progress} ❌ Erreur: ${error.message}\n`);
    }
  }
  
  console.log('\n✅ Cartes JOKER mises à jour:', updated);
}

updateWildCards()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  });
