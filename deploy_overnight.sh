#!/bin/bash
cd ~/Bag-bot

# Attendre 4 heures (Discord reset rate limits)
sleep 14400

# Tenter le déploiement
node << 'ENDNODE'
const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const rest = new REST({ version: '10', timeout: 120000 }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const commands = [];
    const files = fs.readdirSync('./src/commands').filter(f => f.endsWith('.js'));
    
    for (const file of files) {
      try {
        delete require.cache[require.resolve(`./src/commands/${file}`)];
        const cmd = require(`./src/commands/${file}`);
        if (cmd.data) commands.push(cmd.data.toJSON());
      } catch (e) {}
    }
    
    console.log(new Date().toLocaleString(), '- Déploiement de', commands.length, 'commandes');
    
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    
    console.log(new Date().toLocaleString(), '- ✅ SUCCÈS !', data.length, 'commandes globales');
    
  } catch (error) {
    console.error(new Date().toLocaleString(), '- ❌', error.message);
  }
})();
ENDNODE
