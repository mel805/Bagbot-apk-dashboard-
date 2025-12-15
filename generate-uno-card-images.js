const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Créer le dossier de sortie
const outputDir = path.join(__dirname, 'uno-cards');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const CARD_WIDTH = 400;
const CARD_HEIGHT = 600;

function generateCard(type, color, value = null) {
  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Couleurs
  const colors = {
    red: '#E53935',
    blue: '#1E88E5',
    green: '#43A047',
    yellow: '#FDD835',
    black: '#212121'
  };

  // Fond blanc avec bordure arrondie
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 40);
  ctx.fill();

  // Couleur de fond de la carte
  const bgColor = color ? colors[color] : colors.black;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(20, 20, CARD_WIDTH - 40, CARD_HEIGHT - 40, 30);
  ctx.fill();

  // Zone blanche centrale
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(CARD_WIDTH / 2, CARD_HEIGHT / 2, 120, 180, 0, 0, Math.PI * 2);
  ctx.fill();

  // Texte principal
  ctx.fillStyle = bgColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (type === 'number') {
    // Chiffre
    ctx.font = 'bold 180px Arial';
    ctx.fillText(value.toString(), CARD_WIDTH / 2, CARD_HEIGHT / 2);
    
    // Petits chiffres dans les coins
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(value.toString(), 60, 80);
    ctx.fillText(value.toString(), CARD_WIDTH - 60, CARD_HEIGHT - 80);
  } else if (type === 'skip') {
    // Symbole interdit
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(CARD_WIDTH / 2, CARD_HEIGHT / 2, 100, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CARD_WIDTH / 2 - 70, CARD_HEIGHT / 2 - 70);
    ctx.lineTo(CARD_WIDTH / 2 + 70, CARD_HEIGHT / 2 + 70);
    ctx.stroke();
  } else if (type === 'reverse') {
    // Deux flèches opposées
    ctx.fillStyle = bgColor;
    
    // Flèche droite (haut)
    ctx.beginPath();
    ctx.moveTo(CARD_WIDTH / 2 + 60, CARD_HEIGHT / 2 - 50);
    ctx.lineTo(CARD_WIDTH / 2 - 60, CARD_HEIGHT / 2 - 50);
    ctx.lineTo(CARD_WIDTH / 2 - 40, CARD_HEIGHT / 2 - 80);
    ctx.lineTo(CARD_WIDTH / 2 - 60, CARD_HEIGHT / 2 - 50);
    ctx.lineTo(CARD_WIDTH / 2 - 40, CARD_HEIGHT / 2 - 20);
    ctx.fill();
    
    // Flèche gauche (bas)
    ctx.beginPath();
    ctx.moveTo(CARD_WIDTH / 2 - 60, CARD_HEIGHT / 2 + 50);
    ctx.lineTo(CARD_WIDTH / 2 + 60, CARD_HEIGHT / 2 + 50);
    ctx.lineTo(CARD_WIDTH / 2 + 40, CARD_HEIGHT / 2 + 80);
    ctx.lineTo(CARD_WIDTH / 2 + 60, CARD_HEIGHT / 2 + 50);
    ctx.lineTo(CARD_WIDTH / 2 + 40, CARD_HEIGHT / 2 + 20);
    ctx.fill();
  } else if (type === 'draw2') {
    // +2
    ctx.font = 'bold 160px Arial';
    ctx.fillText('+2', CARD_WIDTH / 2, CARD_HEIGHT / 2);
  } else if (type === 'wild') {
    // JOKER
    // Fond multicolore
    ctx.fillStyle = colors.red;
    ctx.fillRect(20, 20, (CARD_WIDTH - 40) / 2, (CARD_HEIGHT - 40) / 2);
    ctx.fillStyle = colors.blue;
    ctx.fillRect(CARD_WIDTH / 2, 20, (CARD_WIDTH - 40) / 2, (CARD_HEIGHT - 40) / 2);
    ctx.fillStyle = colors.green;
    ctx.fillRect(20, CARD_HEIGHT / 2, (CARD_WIDTH - 40) / 2, (CARD_HEIGHT - 40) / 2);
    ctx.fillStyle = colors.yellow;
    ctx.fillRect(CARD_WIDTH / 2, CARD_HEIGHT / 2, (CARD_WIDTH - 40) / 2, (CARD_HEIGHT - 40) / 2);
    
    // Zone centrale noire
    ctx.fillStyle = colors.black;
    ctx.beginPath();
    ctx.ellipse(CARD_WIDTH / 2, CARD_HEIGHT / 2, 120, 180, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 70px Arial';
    ctx.fillText('JOKER', CARD_WIDTH / 2, CARD_HEIGHT / 2);
  } else if (type === 'wild_draw4') {
    // +4 JOKER
    ctx.fillStyle = colors.red;
    ctx.fillRect(20, 20, (CARD_WIDTH - 40) / 2, (CARD_HEIGHT - 40) / 2);
    ctx.fillStyle = colors.blue;
    ctx.fillRect(CARD_WIDTH / 2, 20, (CARD_WIDTH - 40) / 2, (CARD_HEIGHT - 40) / 2);
    ctx.fillStyle = colors.green;
    ctx.fillRect(20, CARD_HEIGHT / 2, (CARD_WIDTH - 40) / 2, (CARD_HEIGHT - 40) / 2);
    ctx.fillStyle = colors.yellow;
    ctx.fillRect(CARD_WIDTH / 2, CARD_HEIGHT / 2, (CARD_WIDTH - 40) / 2, (CARD_HEIGHT - 40) / 2);
    
    ctx.fillStyle = colors.black;
    ctx.beginPath();
    ctx.ellipse(CARD_WIDTH / 2, CARD_HEIGHT / 2, 120, 180, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 120px Arial';
    ctx.fillText('+4', CARD_WIDTH / 2, CARD_HEIGHT / 2);
  }

  return canvas;
}

// Générer toutes les cartes
const colors = ['red', 'blue', 'green', 'yellow'];
const colorCodes = { red: 'r', blue: 'b', green: 'g', yellow: 'y' };

let count = 0;

// Cartes numérotées
for (const color of colors) {
  for (let i = 0; i <= 9; i++) {
    const canvas = generateCard('number', color, i);
    const filename = `uno_${colorCodes[color]}${i}.png`;
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outputDir, filename), buffer);
    count++;
  }
}

// Cartes spéciales colorées
for (const color of colors) {
  // Skip
  let canvas = generateCard('skip', color);
  let filename = `uno_${colorCodes[color]}skip.png`;
  fs.writeFileSync(path.join(outputDir, filename), canvas.toBuffer('image/png'));
  count++;
  
  // Reverse
  canvas = generateCard('reverse', color);
  filename = `uno_${colorCodes[color]}rev.png`;
  fs.writeFileSync(path.join(outputDir, filename), canvas.toBuffer('image/png'));
  count++;
  
  // +2
  canvas = generateCard('draw2', color);
  filename = `uno_${colorCodes[color]}p2.png`;
  fs.writeFileSync(path.join(outputDir, filename), canvas.toBuffer('image/png'));
  count++;
}

// Jokers
let canvas = generateCard('wild');
fs.writeFileSync(path.join(outputDir, 'uno_wild.png'), canvas.toBuffer('image/png'));
count++;

canvas = generateCard('wild_draw4');
fs.writeFileSync(path.join(outputDir, 'uno_wildp4.png'), canvas.toBuffer('image/png'));
count++;

console.log(`✅ ${count} cartes UNO générées dans ${outputDir}`);
