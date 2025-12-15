const fs = require("fs");
const path = require("path");

const backupDir = "/var/data/backups";
const files = fs.readdirSync(backupDir).filter(f => f.endsWith(".json"));

const choices = files.map(f => ({
  name: f.length > 25 ? f.slice(0, 22) + "…" : f,
  value: f
}));

const commandsPath = '/home/bagbot/Bag-bot/commands.json';
const commands = JSON.parse(fs.readFileSync(commandsPath, "utf8"));

const restoreCmd = commands.find(c => c.name === "restore");
if (!restoreCmd) throw new Error("Commande restore non trouvée");

const fichierOption = restoreCmd.options.find(o => o.name === "fichier");
if (!fichierOption) throw new Error("Option 'fichier' non trouvée");

fichierOption.choices = choices;

fs.writeFileSync(commandsPath, JSON.stringify(commands, null, 2));
console.log("✅ commands.json mis à jour avec les choix de backup");
