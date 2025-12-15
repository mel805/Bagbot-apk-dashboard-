const { createCanvas } = require('canvas');
const https = require('https');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID || process.env.CLIENT_ID;

// Fonction pour générer une carte REVERSE améliorée
function generateReverseCard(color) {
  const canvas = createCanvas(200, 300);
  const ctx = canvas.getContext('2d');
  
  const colors = {
    red: '#E3171E',
    blue: '#0063B3',
    green: '#00A651',
    yellow: '#FED503'
  };
  
  // Fond blanc
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 200, 300);
  
  // Bordure colorée
  ctx.strokeStyle = colors[color];
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 190, 290);
  
  // Zone colorée centrale (ovale)
  ctx.fillStyle = colors[color];
  ctx.beginPath();
  ctx.ellipse(100, 150, 75, 115, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Zone blanche pour le symbole
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(100, 150, 55, 90, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Dessiner le symbole REVERSE (2 flèches tête-bêche)
  ctx.fillStyle = colors[color];
  ctx.strokeStyle = colors[color];
  ctx.lineWidth = 8;
  
  // Flèche pointant vers la droite (en haut)
  ctx.beginPath();
  // Ligne horizontale
  ctx.moveTo(65, 130);
  ctx.lineTo(120, 130);
  // Pointe de flèche
  ctx.lineTo(110, 120);
  ctx.moveTo(120, 130);
  ctx.lineTo(110, 140);
  ctx.stroke();
  
  // Flèche pointant vers la gauche (en bas)
  ctx.beginPath();
  // Ligne horizontale
  ctx.moveTo(135, 170);
  ctx.lineTo(80, 170);
  // Pointe de flèche
  ctx.lineTo(90, 160);
  ctx.moveTo(80, 170);
  ctx.lineTo(90, 180);
  ctx.stroke();
  
  // Alternative: utiliser des triangles pleins
  ctx.fillStyle = colors[color];
  
  // Flèche droite (triangle plein en haut)
  ctx.beginPath();
  ctx.moveTo(125, 130);
  ctx.lineTo(115, 120);
  ctx.lineTo(115, 140);
  ctx.closePath();
  ctx.fill();
  
  // Rectangle horizontal haut
  ctx.fillRect(70, 125, 50, 10);
  
  // Flèche gauche (triangle plein en bas)
  ctx.beginPath();
  ctx.moveTo(75, 170);
  ctx.lineTo(85, 160);
  ctx.lineTo(85, 180);
  ctx.closePath();
  ctx.fill();
  
  // Rectangle horizontal bas
  ctx.fillRect(80, 165, 50, 10);
  
  // Coins - symbole simplifié
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('↔', 25, 35);
  ctx.save();
  ctx.translate(175, 265);
  ctx.rotate(Math.PI);
  ctx.fillText('↔', 0, 0);
  ctx.restore();
  
  return canvas.toBuffer('image/png');
}

// Cartes REVERSE à régénérer
const reverseCards = [
  { name: 'uno_rrev', color: 'red' },
  { name: 'uno_brev', color: 'blue' },
  { name: 'uno_grev', color: 'green' },
  { name: 'uno_yrev', color: 'yellow' }
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

async function fixReverseCards() {
  console.log('🔄 Correction des cartes REVERSE...\n');
  
  const response = await discordApiRequest('GET', `/api/v10/applications/${APPLICATION_ID}/emojis`);
  const existingEmojis = response.items || [];
  
  let updated = 0;
  
  for (let i = 0; i < reverseCards.length; i++) {
    const card = reverseCards[i];
    const progress = `[${i + 1}/${reverseCards.length}]`;
    
    try {
      const existingEmoji = existingEmojis.find(e => e.name === card.name);
      
      if (existingEmoji) {
        console.log(`${progress} 🗑️  Suppression de ${card.name}...`);
        await discordApiRequest('DELETE', `/api/v10/applications/${APPLICATION_ID}/emojis/${existingEmoji.id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`${progress} 🎨 Génération: ${card.name}...`);
      const imageBuffer = generateReverseCard(card.color);
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      
      console.log(`${progress} 📤 Upload: ${card.name}...`);
      await discordApiRequest('POST', `/api/v10/applications/${APPLICATION_ID}/emojis`, {
        name: card.name,
        image: base64Image
      });
      
      updated++;
      console.log(`${progress} ✅ ${card.name} corrigé !\n`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`${progress} ❌ Erreur: ${error.message}\n`);
    }
  }
  
  console.log('\n✅ Cartes REVERSE mises à jour:', updated);
}

fixReverseCards()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  });
