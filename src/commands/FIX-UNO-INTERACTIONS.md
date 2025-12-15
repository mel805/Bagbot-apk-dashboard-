# Fix UNO - Échec des interactions

## Problème identifié

Les boutons UNO (Ma main, Jouer carte, etc.) génèrent "Échec de l'interaction" car :

1. **Pas de handler global** : bot.js ne gère pas les customId commençant par `uno_`
2. **Collectors locaux insuffisants** : Les collectors dans uno.js peuvent expirer ou ne pas capturer toutes les interactions
3. **Messages éphémères** : Les collectors sur messages éphémères ont des limitations

## Solution recommandée

### Option 1 : Ajouter handler global dans bot.js (RECOMMANDÉ)

Ajouter dans `src/bot.js` ligne ~6500 (après les autres handlers de boutons) :

```javascript
// Handler pour les boutons UNO
if (interaction.isButton() && interaction.customId.startsWith('uno_')) {
  const unoCommand = client.commands.get('uno');
  if (unoCommand && unoCommand.handleButton) {
    try {
      await unoCommand.handleButton(interaction);
      return;
    } catch (error) {
      console.error('[UNO Button Error]:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Erreur lors de l\'interaction.', ephemeral: true }).catch(() => {});
      }
      return;
    }
  }
}
```

### Option 2 : Modifier uno.js pour exporter handleButton

Actuellement uno.js exporte seulement `execute`. Il faut ajouter :

```javascript
module.exports = {
  name: uno,
  data: ...,
  execute: async (interaction) => { ... },
  
  // NOUVEAU : Handler global pour les boutons
  handleButton: async (interaction) => {
    const channelId = interaction.channelId;
    const game = activeGames.get(channelId);
    
    if (!game) {
      return interaction.reply({ content: '❌ Aucune partie en cours !', ephemeral: true });
    }
    
    const player = game.players.find(p => p.id === interaction.user.id);
    if (!player && !interaction.customId.startsWith('uno_join')) {
      return interaction.reply({ content: '❌ Vous n\'êtes pas dans la partie !', ephemeral: true });
    }
    
    // Rediriger vers les fonctions appropriées selon le customId
    // ... (logique de gestion)
  }
};
```

## Actions requises

1. ✅ Backup créé : `uno-backup-before-interaction-fix-XXXXXX.js`
2. ⏳ Implémenter Option 1 (handler dans bot.js)
3. ⏳ Tester après redémarrage du bot (21:40 UTC)

