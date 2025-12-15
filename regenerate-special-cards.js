const { createCanvas } = require('canvas');
const https = require('https');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID || process.env.CLIENT_ID;

if (!TOKEN || !APPLICATION_ID) {
  console.error('❌ DISCORD_TOKEN et APPLICATION_ID requis !');
  process.exit(1);
}

// Fonction pour générer une carte UNO améliorée
function generateCard(color, value, type) {
  const canvas = createCanvas(200, 300);
  const ctx = canvas.getContext('2d');
  
  // Couleurs
  const colors = {
    red: '#E3171E',
    blue: '#0063B3',
    green: '#00A651',
    yellow: '#FED503',
    wild: '#000000'
  };
  
  // Fond blanc
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 200, 300);
  
  // Bordure colorée
  ctx.strokeStyle = colors[color] || '#000000';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 190, 290);
  
  // Zone colorée centrale (ovale plus large)
  ctx.fillStyle = colors[color] || '#000000';
  ctx.beginPath();
  ctx.ellipse(100, 150, 75, 115, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Zone blanche pour le symbole
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(100, 150, 55, 90, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Dessiner les symboles
  ctx.fillStyle = colors[color] || '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (type === 'number') {
    // Numéros - plus gros et gras
    ctx.font = 'bold 100px Arial';
    ctx.fillText(value.toString(), 100, 150);
    
    // Petits numéros dans les coins
    ctx.font = 'bold 28px Arial';
    ctx.fillText(value.toString(), 25, 35);
    ctx.save();
    ctx.translate(175, 265);
    ctx.rotate(Math.PI);
    ctx.fillText(value.toString(), 0, 0);
    ctx.restore();
    
  } else if (type === 'skip') {
    // Symbole INTERDIT plus visible (cercle barré)
    ctx.strokeStyle = colors[color];
    ctx.lineWidth = 15;
    
    // Cercle
    ctx.beginPath();
    ctx.arc(100, 150, 45, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Barre diagonale
    ctx.beginPath();
    ctx.moveTo(65, 115);
    ctx.lineTo(135, 185);
    ctx.stroke();
    
    // Coins
    ctx.font = 'bold 24px Arial';
    ctx.fillText('⊘', 25, 35);
    ctx.save();
    ctx.translate(175, 265);
    ctx.rotate(Math.PI);
    ctx.fillText('⊘', 0, 0);
    ctx.restore();
    
  } else if (type === 'reverse') {
    // Flèches circulaires REVERSE
    ctx.strokeStyle = colors[color];
    ctx.fillStyle = colors[color];
    ctx.lineWidth = 12;
    
    // Flèche gauche (haut)
    ctx.beginPath();
    ctx.arc(100, 135, 35, Math.PI * 0.7, Math.PI * 0.3, true);
    ctx.stroke();
    
    // Pointe flèche gauche
    ctx.beginPath();
    ctx.moveTo(70, 125);
    ctx.lineTo(60, 115);
    ctx.lineTo(65, 140);
    ctx.closePath();
    ctx.fill();
    
    // Flèche droite (bas)
    ctx.beginPath();
    ctx.arc(100, 165, 35, Math.PI * 1.7, Math.PI * 1.3, false);
    ctx.stroke();
    
    // Pointe flèche droite
    ctx.beginPath();
    ctx.moveTo(130, 175);
    ctx.lineTo(140, 185);
    ctx.lineTo(135, 160);
    ctx.closePath();
    ctx.fill();
    
    // Coins
    ctx.font = 'bold 24px Arial';
    ctx.fillText('⇄', 25, 35);
    ctx.save();
    ctx.translate(175, 265);
    ctx.rotate(Math.PI);
    ctx.fillText('⇄', 0, 0);
    ctx.restore();
    
  } else if (type === 'draw2') {
    // Symbole +2 bien visible
    ctx.font = 'bold 70px Arial';
    ctx.fillText('+2', 100, 150);
    
    // Coins
    ctx.font = 'bold 24px Arial';
    ctx.fillText('+2', 25, 35);
    ctx.save();
    ctx.translate(175, 265);
    ctx.rotate(Math.PI);
    ctx.fillText('+2', 0, 0);
    ctx.restore();
    
  } else if (type === 'wild') {
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
    
    // Texte WILD
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('WILD', 100, 150);
    
  } else if (type === 'wild_draw4') {
    // Joker +4 multicolore
    const segments = [
      { color: '#E3171E', start: 0, end: 0.5 },
      { color: '#FED503', start: 0.5, end: 1 },
      { color: '#00A651', start: 1, end: 1.5 },
      { color: '#0063B3', start: 1.5, end: 2 }
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
    
    // Texte +4
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 60px Arial';
    ctx.fillText('+4', 100, 150);
  }
  
  return canvas.toBuffer('image/png');
}

// Cartes spéciales à regénérer
const specialCards = [];
const colors = ['red', 'blue', 'green', 'yellow'];

for (const color of colors) {
  specialCards.push({ name: `uno_${color[0]}skip`, color, type: 'skip' });
  specialCards.push({ name: `uno_${color[0]}rev`, color, type: 'reverse' });
  specialCards.push({ name: `uno_${color[0]}p2`, color, type: 'draw2' });
}

specialCards.push({ name: 'uno_wild', color: 'wild', type: 'wild' });
specialCards.push({ name: 'uno_wildp4', color: 'wild', type: 'wild_draw4' });

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

async function regenerateSpecialCards() {
  console.log('🎨 Régénération des cartes spéciales UNO...\n');
  console.log(`📦 Cartes à régénérer: ${specialCards.length}\n`);
  
  // Récupérer les emojis existants
  console.log('🔍 Récupération des emojis existants...');
  const response = await discordApiRequest('GET', `/api/v10/applications/${APPLICATION_ID}/emojis`);
  const existingEmojis = response.items || [];
  console.log(`✅ Emojis existants: ${existingEmojis.length}\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (let i = 0; i < specialCards.length; i++) {
    const card = specialCards[i];
    const progress = `[${i + 1}/${specialCards.length}]`;
    
    try {
      // Trouver l'emoji existant
      const existingEmoji = existingEmojis.find(e => e.name === card.name);
      
      if (!existingEmoji) {
        console.log(`${progress} ⚠️  ${card.name} n'existe pas, création...`);
      } else {
        console.log(`${progress} 🗑️  Suppression de l'ancien ${card.name}...`);
        await discordApiRequest('DELETE', `/api/v10/applications/${APPLICATION_ID}/emojis/${existingEmoji.id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`${progress} 🎨 Génération: ${card.name}...`);
      const imageBuffer = generateCard(card.color, card.value, card.type);
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
      failed++;
      console.log(`${progress} ❌ Erreur pour ${card.name}: ${error.message}\n`);
      
      if (error.message.includes('429')) {
        console.log('⏸️  Rate limit, pause de 10 secondes...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSULTAT FINAL:');
  console.log(`✅ Mis à jour: ${updated}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log('='.repeat(50));
  
  if (updated > 0) {
    console.log('\n✅ Les cartes spéciales ont été améliorées !');
  }
}

regenerateSpecialCards()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
  });
