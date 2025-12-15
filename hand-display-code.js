// Fonction à ajouter dans uno.js pour créer un affichage en éventail des cartes

const handDisplayCode = `
  // Fonction pour créer une image en éventail des cartes (pour la main)
  async createHandImage(cards) {
    const { createCanvas, loadImage } = require('canvas');
    const https = require('https');
    
    const cardWidth = 200;
    const cardHeight = 300;
    const maxCards = cards.length;
    const totalWidth = Math.max(1200, (maxCards - 1) * 100 + cardWidth);
    const totalHeight = 400;
    
    const canvas = createCanvas(totalWidth, totalHeight);
    const ctx = canvas.getContext('2d');
    
    // Fond transparent
    ctx.clearRect(0, 0, totalWidth, totalHeight);
    
    // Angle max pour l'éventail
    const maxAngle = Math.min(30, maxCards * 3);
    const angleStep = maxCards > 1 ? (maxAngle * 2) / (maxCards - 1) : 0;
    const startAngle = -maxAngle;
    
    // Position centrale en bas
    const centerX = totalWidth / 2;
    const centerY = totalHeight + 100;
    
    // Dessiner chaque carte
    for (let i = 0; i < maxCards; i++) {
      const card = cards[i];
      const angle = (startAngle + i * angleStep) * Math.PI / 180;
      
      // Position de la carte
      const distance = 250;
      const x = centerX + Math.sin(angle) * distance - cardWidth / 2;
      const y = centerY - Math.cos(angle) * distance - cardHeight;
      
      ctx.save();
      ctx.translate(x + cardWidth / 2, y + cardHeight);
      ctx.rotate(angle);
      ctx.translate(-(cardWidth / 2), -(cardHeight));
      
      // Dessiner la carte (version simplifiée - générer l'image de la carte)
      const cardImage = await this.generateCardImage(card);
      ctx.drawImage(cardImage, 0, 0, cardWidth, cardHeight);
      
      // Numéro de la carte
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText((i + 1).toString(), cardWidth / 2, -10);
      ctx.fillText((i + 1).toString(), cardWidth / 2, -10);
      
      ctx.restore();
    }
    
    return canvas.toBuffer('image/png');
  }

  // Fonction pour générer l'image d'une carte
  async generateCardImage(card) {
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(200, 300);
    const ctx = canvas.getContext('2d');
    
    const color = card.chosenColor || card.color;
    
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
    
    // Zone colorée centrale
    ctx.fillStyle = colors[color] || '#000000';
    ctx.beginPath();
    ctx.ellipse(100, 150, 75, 115, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Zone blanche pour le symbole
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(100, 150, 55, 90, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Dessiner le contenu
    ctx.fillStyle = colors[color] || '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (card.type === 'number') {
      ctx.font = 'bold 100px Arial';
      ctx.fillText(card.value.toString(), 100, 150);
    } else if (card.type === 'skip') {
      ctx.strokeStyle = colors[color];
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.arc(100, 150, 45, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(65, 115);
      ctx.lineTo(135, 185);
      ctx.stroke();
    } else if (card.type === 'reverse') {
      ctx.fillStyle = colors[color];
      ctx.fillRect(70, 125, 50, 10);
      ctx.beginPath();
      ctx.moveTo(125, 130);
      ctx.lineTo(115, 120);
      ctx.lineTo(115, 140);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(80, 165, 50, 10);
      ctx.beginPath();
      ctx.moveTo(75, 170);
      ctx.lineTo(85, 160);
      ctx.lineTo(85, 180);
      ctx.closePath();
      ctx.fill();
    } else if (card.type === 'draw2') {
      ctx.font = 'bold 70px Arial';
      ctx.fillText('+2', 100, 150);
    } else if (card.type === 'wild' || card.type === 'wild_draw4') {
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
      
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(100, 150, 55, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      if (card.type === 'wild') {
        ctx.font = 'bold 28px Arial';
        ctx.fillText('JOKER', 100, 150);
      } else {
        ctx.font = 'bold 60px Arial';
        ctx.fillText('+4', 100, 150);
      }
    }
    
    return canvas;
  }
`;

console.log('Code pour l\\'affichage en éventail créé');
console.log('');
console.log('À ajouter dans la classe UnoGame de uno.js');
