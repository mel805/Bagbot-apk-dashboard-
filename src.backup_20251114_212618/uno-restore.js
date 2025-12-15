const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Représentation visuelle des cartes UNO avec emojis Discord
function getCardVisual(card) {
  const color = card.chosenColor || card.color;
  
  // Emojis de couleur de fond
  const colorEmojis = {
    red: '🟥',
    blue: '🟦',
    green: '🟩',
    yellow: '🟨'
  };
  
  // Emojis de nombres
  const numberEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  
  let cardText = '';
  let cardEmoji = '';
  
  if (card.type === 'number') {
    cardEmoji = colorEmojis[color] || '⬜';
    cardText = numberEmojis[card.value];
    return `${cardEmoji}${cardText}`;
  } else if (card.type === 'skip') {
    cardEmoji = colorEmojis[color] || '⬜';
    return `${cardEmoji}🚫`;
  } else if (card.type === 'reverse') {
    cardEmoji = colorEmojis[color] || '⬜';
    return `${cardEmoji}🔄`;
  } else if (card.type === 'draw2') {
    cardEmoji = colorEmojis[color] || '⬜';
    return `${cardEmoji}➕2️⃣`;
  } else if (card.type === 'wild') {
    if (card.chosenColor) {
      return `${colorEmojis[card.chosenColor]}🌈`;
    }
    return '🌈';
  } else if (card.type === 'wild_draw4') {
    if (card.chosenColor) {
      return `${colorEmojis[card.chosenColor]}🌈➕4️⃣`;
    }
    return '🌈➕4️⃣';
  }
  
  return '❓';
}

// Stockage des parties en cours
const activeGames = new Map();

// Classe pour gérer une partie UNO
class UnoGame {
  constructor(channelId, creatorId) {
    this.channelId = channelId;
    this.creatorId = creatorId;
    this.players = [];
    this.deck = [];
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = 1;
    this.started = false;
    this.drawCount = 0;
  }

  addPlayer(userId, username) {
    if (this.started) return false;
    if (this.players.find(p => p.id === userId)) return false;
    if (this.players.length >= 10) return false;
    
    this.players.push({
      id: userId,
      username: username,
      hand: []
    });
    return true;
  }

  removePlayer(userId) {
    const index = this.players.findIndex(p => p.id === userId);
    if (index === -1) return false;
    
    this.players.splice(index, 1);
    
    if (this.currentPlayerIndex >= this.players.length) {
      this.currentPlayerIndex = 0;
    }
    
    return true;
  }

  createDeck() {
    this.deck = [];
    const colors = ['red', 'blue', 'green', 'yellow'];
    
    for (const color of colors) {
      this.deck.push({ type: 'number', color, value: 0 });
      for (let i = 1; i <= 9; i++) {
        this.deck.push({ type: 'number', color, value: i });
        this.deck.push({ type: 'number', color, value: i });
      }
    }
    
    for (const color of colors) {
      for (let i = 0; i < 2; i++) {
        this.deck.push({ type: 'skip', color });
        this.deck.push({ type: 'reverse', color });
        this.deck.push({ type: 'draw2', color });
      }
    }
    
    for (let i = 0; i < 4; i++) {
      this.deck.push({ type: 'wild', color: null });
      this.deck.push({ type: 'wild_draw4', color: null });
    }
    
    this.shuffle(this.deck);
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  dealCards() {
    for (const player of this.players) {
      player.hand = [];
      for (let i = 0; i < 7; i++) {
        player.hand.push(this.deck.pop());
      }
    }
    
    let startCard;
    do {
      startCard = this.deck.pop();
    } while (startCard.type !== 'number');
    
    this.discardPile.push(startCard);
  }

  drawCard(player) {
    if (this.deck.length === 0) {
      const topCard = this.discardPile.pop();
      this.deck = [...this.discardPile];
      this.shuffle(this.deck);
      this.discardPile = [topCard];
    }
    
    if (this.deck.length > 0) {
      const card = this.deck.pop();
      player.hand.push(card);
      return card;
    }
    return null;
  }

  canPlayCard(card, topCard) {
    if (card.type === 'wild' || card.type === 'wild_draw4') return true;
    if (card.color === topCard.color) return true;
    if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) return true;
    if (card.type === topCard.type && card.type !== 'number') return true;
    return false;
  }

  playCard(playerId, cardIndex, chosenColor = null) {
    const player = this.players[this.currentPlayerIndex];
    if (player.id !== playerId) return { success: false, error: "Ce n'est pas votre tour !" };
    
    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      return { success: false, error: "Carte invalide !" };
    }
    
    const card = player.hand[cardIndex];
    const topCard = this.discardPile[this.discardPile.length - 1];
    
    if (!this.canPlayCard(card, topCard)) {
      return { success: false, error: "Cette carte ne peut pas être jouée !" };
    }
    
    if ((card.type === 'wild' || card.type === 'wild_draw4') && !chosenColor) {
      return { success: false, error: "Vous devez choisir une couleur !", requireColor: true };
    }
    
    player.hand.splice(cardIndex, 1);
    
    if (chosenColor) {
      card.chosenColor = chosenColor;
    }
    
    this.discardPile.push(card);
    
    if (player.hand.length === 0) {
      return { success: true, winner: player };
    }
    
    let skipNext = false;
    
    switch (card.type) {
      case 'skip':
        skipNext = true;
        break;
      
      case 'reverse':
        if (this.players.length === 2) {
          skipNext = true;
        } else {
          this.direction *= -1;
        }
        break;
      
      case 'draw2':
        this.drawCount += 2;
        skipNext = true;
        break;
      
      case 'wild_draw4':
        this.drawCount += 4;
        skipNext = true;
        break;
    }
    
    this.nextPlayer(skipNext);
    
    return { success: true };
  }

  nextPlayer(skip = false) {
    this.currentPlayerIndex += this.direction;
    
    if (this.currentPlayerIndex >= this.players.length) {
      this.currentPlayerIndex = 0;
    } else if (this.currentPlayerIndex < 0) {
      this.currentPlayerIndex = this.players.length - 1;
    }
    
    if (skip) {
      if (this.drawCount > 0) {
        const player = this.players[this.currentPlayerIndex];
        for (let i = 0; i < this.drawCount; i++) {
          this.drawCard(player);
        }
        this.drawCount = 0;
      }
      
      this.nextPlayer(false);
    }
  }

  getCardDisplay(card) {
    return getCardVisual(card);
  }

  getHandDisplay(player) {
    // Créer un affichage de cartes avec des emojis
    const rows = [];
    for (let i = 0; i < player.hand.length; i++) {
      const card = player.hand[i];
      const cardVisual = this.getCardDisplay(card);
      rows.push(`\`${i + 1}.\` ${cardVisual}`);
    }
    return rows.join(' ');
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getTopCard() {
    return this.discardPile[this.discardPile.length - 1];
  }
}

module.exports = {
  name: 'uno',
  data: new SlashCommandBuilder()
    .setName('uno')
    .setDescription('Jouer au UNO !')
    .addSubcommand(subcommand =>
      subcommand
        .setName('commencer')
        .setDescription('Créer une nouvelle partie de UNO'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('demarrer')
        .setDescription('Démarrer la partie (minimum 2 joueurs)'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('rejoindre')
        .setDescription('Rejoindre la partie en cours'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('jouer')
        .setDescription('Jouer une carte')
        .addIntegerOption(option =>
          option
            .setName('carte')
            .setDescription('Numéro de la carte à jouer')
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('couleur')
            .setDescription('Couleur pour les jokers')
            .addChoices(
              { name: '🔴 Rouge', value: 'red' },
              { name: '🔵 Bleu', value: 'blue' },
              { name: '🟢 Vert', value: 'green' },
              { name: '🟡 Jaune', value: 'yellow' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('piocher')
        .setDescription('Piocher une carte'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('main')
        .setDescription('Voir votre main'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('quitter')
        .setDescription('Quitter la partie en cours'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('terminer')
        .setDescription('Terminer la partie (créateur uniquement)'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('statut')
        .setDescription('Voir l\'état de la partie')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channelId = interaction.channelId;
    
    if (subcommand === 'commencer') {
      if (activeGames.has(channelId)) {
        return interaction.reply({ content: '❌ Une partie est déjà en cours dans ce salon !', ephemeral: true });
      }
      
      const game = new UnoGame(channelId, interaction.user.id);
      game.addPlayer(interaction.user.id, interaction.user.username);
      activeGames.set(channelId, game);
      
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎮 Partie de UNO créée !')
        .setDescription(`${interaction.user.username} a créé une partie de UNO !\n\n**Rejoignez avec** \`/uno rejoindre\`\n**Démarrez avec** \`/uno demarrer\` (minimum 2 joueurs)`)
        .addFields({ name: 'Joueurs', value: '1️⃣ ' + interaction.user.username })
        .setFooter({ text: 'Maximum 10 joueurs' });
      
      return interaction.reply({ embeds: [embed] });
    }
    
    const game = activeGames.get(channelId);
    if (!game) {
      return interaction.reply({ content: '❌ Aucune partie en cours dans ce salon ! Utilisez `/uno commencer` pour en créer une.', ephemeral: true });
    }
    
    if (subcommand === 'demarrer') {
      if (game.started) {
        return interaction.reply({ content: '❌ La partie a déjà commencé !', ephemeral: true });
      }
      
      if (game.creatorId !== interaction.user.id) {
        return interaction.reply({ content: '❌ Seul le créateur peut démarrer la partie !', ephemeral: true });
      }
      
      if (game.players.length < 2) {
        return interaction.reply({ content: '❌ Il faut au moins 2 joueurs pour commencer !', ephemeral: true });
      }
      
      game.started = true;
      game.createDeck();
      game.dealCards();
      game.currentPlayerIndex = 0;
      
      const topCard = game.getTopCard();
      const currentPlayer = game.getCurrentPlayer();
      
      const numbers = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
      const playerList = game.players.map((p, i) => numbers[i] + ' ' + p.username).join('\n');
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎮 PARTIE COMMENCÉE !')
        .setDescription(`La partie de UNO commence !\n\n**Première carte:** ${game.getCardDisplay(topCard)}\n**Tour de:** <@${currentPlayer.id}>`)
        .addFields(
          { name: `Joueurs (${game.players.length})`, value: playerList },
          { name: 'Commandes', value: '`/uno jouer <numéro>` - Jouer une carte\n`/uno piocher` - Piocher\n`/uno main` - Voir votre main\n`/uno statut` - État de la partie' }
        )
        .setFooter({ text: 'Utilisez /uno main pour voir votre main (message privé)' });
      
      return interaction.reply({ embeds: [embed] });
    }
    
    if (subcommand === 'rejoindre') {
      const success = game.addPlayer(interaction.user.id, interaction.user.username);
      
      if (!success) {
        if (game.started) {
          return interaction.reply({ content: '❌ La partie a déjà commencé !', ephemeral: true });
        }
        if (game.players.find(p => p.id === interaction.user.id)) {
          return interaction.reply({ content: '❌ Vous êtes déjà dans la partie !', ephemeral: true });
        }
        return interaction.reply({ content: '❌ La partie est pleine !', ephemeral: true });
      }
      
      const numbers = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
      const playerList = game.players.map((p, i) => numbers[i] + ' ' + p.username).join('\n');
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Joueur ajouté !')
        .setDescription(interaction.user.username + ' a rejoint la partie !')
        .addFields({ name: `Joueurs (${game.players.length}/10)`, value: playerList });
      
      return interaction.reply({ embeds: [embed] });
    }
    
    if (subcommand === 'quitter') {
      const success = game.removePlayer(interaction.user.id);
      
      if (!success) {
        return interaction.reply({ content: '❌ Vous n\'êtes pas dans cette partie !', ephemeral: true });
      }
      
      if (game.players.length === 0) {
        activeGames.delete(channelId);
        return interaction.reply({ content: '🛑 La partie a été annulée (plus de joueurs).' });
      }
      
      return interaction.reply({ content: `✅ ${interaction.user.username} a quitté la partie.` });
    }
    
    if (subcommand === 'terminer') {
      if (game.creatorId !== interaction.user.id) {
        return interaction.reply({ content: '❌ Seul le créateur de la partie peut la terminer !', ephemeral: true });
      }
      
      activeGames.delete(channelId);
      return interaction.reply({ content: '🛑 La partie a été terminée.' });
    }
    
    if (!game.started) {
      return interaction.reply({ content: '❌ La partie n\'a pas encore commencé !', ephemeral: true });
    }
    
    if (subcommand === 'main') {
      const player = game.players.find(p => p.id === interaction.user.id);
      if (!player) {
        return interaction.reply({ content: '❌ Vous n\'êtes pas dans cette partie !', ephemeral: true });
      }
      
      // Afficher toutes les cartes avec leurs emojis
      const handDisplay = game.getHandDisplay(player);
      
      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🃏 Votre main UNO')
        .setDescription(handDisplay)
        .setFooter({ text: `${player.hand.length} carte(s) • Utilisez /uno jouer <numéro> pour jouer` });
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (subcommand === 'piocher') {
      const player = game.players.find(p => p.id === interaction.user.id);
      if (!player) {
        return interaction.reply({ content: '❌ Vous n\'êtes pas dans cette partie !', ephemeral: true });
      }
      
      if (game.getCurrentPlayer().id !== interaction.user.id) {
        return interaction.reply({ content: '❌ Ce n\'est pas votre tour !', ephemeral: true });
      }
      
      const card = game.drawCard(player);
      game.nextPlayer();
      
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🎴 Carte piochée !')
        .setDescription(`Vous avez pioché : ${game.getCardDisplay(card)}\n\n**Tour suivant:** <@${game.getCurrentPlayer().id}>`)
        .setFooter({ text: `Vous avez maintenant ${player.hand.length} carte(s)` });
      
      return interaction.reply({ embeds: [embed] });
    }
    
    if (subcommand === 'jouer') {
      const cardIndex = interaction.options.getInteger('carte') - 1;
      const chosenColor = interaction.options.getString('couleur');
      
      const result = game.playCard(interaction.user.id, cardIndex, chosenColor);
      
      if (!result.success) {
        return interaction.reply({ content: '❌ ' + result.error, ephemeral: true });
      }
      
      if (result.winner) {
        activeGames.delete(channelId);
        
        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🎉 VICTOIRE !')
          .setDescription(`${result.winner.username} a gagné la partie !\n\n🏆 Félicitations !`)
          .setThumbnail(interaction.user.displayAvatarURL());
        
        return interaction.reply({ embeds: [embed] });
      }
      
      const topCard = game.getTopCard();
      const currentPlayer = game.getCurrentPlayer();
      const playedBy = game.players.find(p => p.id === interaction.user.id);
      
      const embed = new EmbedBuilder()
        .setColor('#FF5500')
        .setTitle('🎴 Carte jouée !')
        .setDescription(`${interaction.user.username} a joué :\n\n${game.getCardDisplay(topCard)}`)
        .addFields(
          { name: 'Tour de', value: `<@${currentPlayer.id}>`, inline: true },
          { name: 'Cartes restantes', value: `${playedBy.hand.length}`, inline: true }
        );
      
      return interaction.reply({ embeds: [embed] });
    }
    
    if (subcommand === 'statut') {
      const topCard = game.getTopCard();
      const currentPlayer = game.getCurrentPlayer();
      
      const playerList = game.players.map(p => {
        const prefix = p.id === currentPlayer.id ? '👉' : '  ';
        return prefix + ' ' + p.username + ': ' + p.hand.length + ' carte(s)';
      }).join('\n');
      
      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📊 État de la partie')
        .setDescription(`**Carte actuelle:** ${game.getCardDisplay(topCard)}\n**Direction:** ${game.direction === 1 ? '🔽' : '🔼'}`)
        .addFields(
          { name: 'Tour de', value: `<@${currentPlayer.id}>` },
          { name: 'Joueurs', value: playerList }
        );
      
      return interaction.reply({ embeds: [embed] });
    }
  }
};
