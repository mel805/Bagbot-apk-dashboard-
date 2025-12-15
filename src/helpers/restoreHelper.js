/**
 * Helper pour extraire les données propres depuis n'importe quel format de sauvegarde
 */

function extractCleanData(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return null;
  }
  
  // Cas 1: Structure directe {guilds: {...}}
  if (rawData.guilds) {
    console.log('[RestoreHelper] Structure directe détectée');
    return rawData;
  }
  
  // Cas 2: Structure avec data: {guilds: {...}}
  if (rawData.data && rawData.data.guilds) {
    console.log('[RestoreHelper] Structure {data: {guilds}} détectée');
    return rawData.data;
  }
  
  // Cas 3: Structure imbriquée {metadata, data: {metadata, data: {guilds}}}
  if (rawData.data && rawData.data.data) {
    console.log('[RestoreHelper] Structure imbriquée détectée, extraction...');
    let current = rawData.data;
    
    // Descendre jusqu'à trouver guilds
    while (current.data && !current.guilds) {
      current = current.data;
    }
    
    if (current.guilds) {
      console.log('[RestoreHelper] Guilds trouvés après extraction');
      return current;
    }
  }
  
  console.error('[RestoreHelper] Structure inconnue:', Object.keys(rawData));
  return null;
}

module.exports = { extractCleanData };
