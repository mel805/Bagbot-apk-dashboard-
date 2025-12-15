#!/bin/bash
cd ~/Bag-bot

node << 'ENDNODE'
const { REST, Routes } = require('discord.js');
require('dotenv').config();
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  const g = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
  console.log('\n================================================');
  console.log('  📊 COMMANDES GLOBALES EN DM');
  console.log('================================================\n');
  console.log('Total:', g.length, 'commandes\n');
  
  if (g.length >= 30) {
    console.log('✅ Actions déployées ! Attendez 30min pour cache Discord\n');
  } else if (g.length > 5) {
    console.log('⏳ Déploiement en cours (' + g.length + '/36 actions)\n');
  } else if (g.length > 1) {
    console.log('⏳ Début du déploiement...\n');
  }
  
  console.log('Commandes actuelles :');
  g.forEach(cmd => console.log('   -', cmd.name));
  console.log('\n================================================');
})();
ENDNODE
