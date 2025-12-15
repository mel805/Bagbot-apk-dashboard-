const fs = require('fs');

// Lire le fichier uno.js
const unoPath = process.argv[2] || './src/commands/uno.js';
let content = fs.readFileSync(unoPath, 'utf8');

// Nouveaux IDs (les plus récents depuis les régénérations)
const updates = {
  'uno_rskip:1433191127971790908': 'uno_rskip:1433193235043319878',
  'uno_rrev:1433191132548042852': 'uno_rrev:1433194079927406663',
  'uno_rp2:1433191137178423316': 'uno_rp2:1433193252194095286',
  'uno_bskip:1433191188411846686': 'uno_bskip:1433193260691493085',
  'uno_brev:1433191193004736655': 'uno_brev:1433194088252838060',
  'uno_bp2:1433191197530259657': 'uno_bp2:1433193277284159651',
  'uno_gskip:1433191248264695968': 'uno_gskip:1433193285450465494',
  'uno_grev:1433191252722974842': 'uno_grev:1433194096327000167',
  'uno_gp2:1433191257101959293': 'uno_gp2:1433193303997808764',
  'uno_yskip:1433191308142448750': 'uno_yskip:1433193312336089108',
  'uno_yrev:1433191312886206504': 'uno_yrev:1433194105017733150',
  'uno_yp2:1433191317344747550': 'uno_yp2:1433193328903458937',
  'uno_wild:1433191321799102595': 'uno_wild:1433194845153005568',
  'uno_wild:1433191321799102595': 'uno_wild:1433194845153005568',
  'uno_wildp4:1433191326828204174': 'uno_wildp4:1433194853495345263'
};

// Remplacer tous les anciens IDs par les nouveaux
for (const [old, newId] of Object.entries(updates)) {
  content = content.replace(new RegExp(old, 'g'), newId);
}

// Écrire le fichier
fs.writeFileSync(unoPath, content, 'utf8');
console.log('✅ IDs mis à jour dans', unoPath);
console.log('✅', Object.keys(updates).length, 'remplacements effectués');
