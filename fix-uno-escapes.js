const fs = require('fs');
let content = fs.readFileSync('./src/commands/uno.js', 'utf8');

// Remplacer tous les backslashes inutiles
content = content.replace(/n\\\\/g, "n");
content = content.replace(/l\\\\/g, "l");
content = content.replace(/d\\\\/g, "d");
content = content.replace(/c\\\\/g, "c");
content = content.replace(/s\\\\/g, "s");

fs.writeFileSync('./src/commands/uno.js', content, 'utf8');
console.log('✅ Fichier corrigé');
