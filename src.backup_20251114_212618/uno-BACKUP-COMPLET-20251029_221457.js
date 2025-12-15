const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


// Mapping des emojis custom de cartes UNO (Application Emojis)
const EMOJI_MAP = {
  'uno_r0': '<:uno_r0:1433191075945779401>',
  'uno_r1': '<:uno_r1:1433191080567767062>',
  'uno_r2': '<:uno_r2:1433191085030641879>',
  'uno_r3': '<:uno_r3:1433191089107505315>',
  'uno_r4': '<:uno_r4:1433191093520040113>',
  'uno_r5': '<:uno_r5:1433191105091997696>',
  'uno_r6': '<:uno_r6:1433191109672177737>',
  'uno_r7': '<:uno_r7:1433191114504146945>',
  'uno_r8': '<:uno_r8:1433191118698319934>',
  'uno_r9': '<:uno_r9:1433191123299471443>',
  'uno_rskip': '<:uno_rskip:1433193235043319878>',
  'uno_rrev': '<:uno_rrev:1433194079927406663>',
  'uno_rp2': '<:uno_rp2:1433193252194095286>',
  'uno_b0': '<:uno_b0:1433191141376786577>',
  'uno_b1': '<:uno_b1:1433191146179264542>',
  'uno_b2': '<:uno_b2:1433191150436749439>',
  'uno_b3': '<:uno_b3:1433191154857279632>',
  'uno_b4': '<:uno_b4:1433191160167534774>',
  'uno_b5': '<:uno_b5:1433191165036859483>',
  'uno_b6': '<:uno_b6:1433191169285685362>',
  'uno_b7': '<:uno_b7:1433191174054613195>',
  'uno_b8': '<:uno_b8:1433191178676867124>',
  'uno_b9': '<:uno_b9:1433191183470825655>',
  'uno_bskip': '<:uno_bskip:1433193260691493085>',
  'uno_brev': '<:uno_brev:1433194088252838060>',
  'uno_bp2': '<:uno_bp2:1433193277284159651>',
  'uno_g0': '<:uno_g0:1433191202160640152>',
  'uno_g1': '<:uno_g1:1433191206363598939>',
  'uno_g2': '<:uno_g2:1433191211040116897>',
  'uno_g3': '<:uno_g3:1433191215565639830>',
  'uno_g4': '<:uno_g4:1433191220284493864>',
  'uno_g5': '<:uno_g5:1433191224751427595>',
  'uno_g6': '<:uno_g6:1433191229537124372>',
  'uno_g7': '<:uno_g7:1433191234104590518>',
  'uno_g8': '<:uno_g8:1433191238617534596>',
  'uno_g9': '<:uno_g9:1433191243822665749>',
  'uno_gskip': '<:uno_gskip:1433193285450465494>',
  'uno_grev': '<:uno_grev:1433194096327000167>',
  'uno_gp2': '<:uno_gp2:1433193303997808764>',
  'uno_y0': '<:uno_y0:1433191262227267696>',
  'uno_y1': '<:uno_y1:1433191266744664185>',
  'uno_y2': '<:uno_y2:1433191271219990598>',
  'uno_y3': '<:uno_y3:1433191275602907136>',
  'uno_y4': '<:uno_y4:1433191279696675040>',
  'uno_y5': '<:uno_y5:1433191284335575133>',
  'uno_y6': '<:uno_y6:1433191289620402267>',
  'uno_y7': '<:uno_y7:1433191294188126300>',
  'uno_y8': '<:uno_y8:1433191298747072644>',
  'uno_y9': '<:uno_y9:1433191303348359271>',
  'uno_yskip': '<:uno_yskip:1433193312336089108>',
  'uno_yrev': '<:uno_yrev:1433194105017733150>',
  'uno_yp2': '<:uno_yp2:1433193328903458937>',
  'uno_wild': '<:uno_wild:1433194845153005568>',
  'uno_wildp4': '<:uno_wildp4:1433194853495345263>',
};

// Fonction pour obtenir l'emoji custom de carte UNO
function getCardVisual(card) {
  const color = card.chosenColor || card.color;
  const colorPrefix = { red: 'r', blue: 'b', green: 'g', yellow: 'y' };
  
  let emojiKey = '';
  
  if (card.type === 'number') {
    emojiKey = `uno_${colorPrefix[color]}${card.value}`;
  } else if (card.type === 'skip') {
    emojiKey = `uno_${colorPrefix[color]}skip`;
  } else if (card.type === 'reverse') {
    emojiKey = `uno_${colorPrefix[color]}rev`;
  } else if (card.type === 'draw2') {
    emojiKey = `uno_${colorPrefix[color]}p2`;
  } else if (card.type === 'wild') {
    emojiKey = 'uno_wild';
  } else if (card.type === 'wild_draw4') {
    emojiKey = 'uno_wildp4';
  }
  
  return EMOJI_MAP[emojiKey] || '❓';
}
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
