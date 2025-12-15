const fs = require('fs');
const path = require('path');

const TD_QUEUES_FILE = path.join(__dirname, '..', 'data', 'td-queues.json');

// Queue en mémoire
const memoryQueues = {};
let saveTimeout = null;

// Charger au démarrage
function loadQueues() {
  try {
    if (fs.existsSync(TD_QUEUES_FILE)) {
      const data = fs.readFileSync(TD_QUEUES_FILE, 'utf8');
      const loaded = JSON.parse(data);
      Object.assign(memoryQueues, loaded);
      console.log('[TDQueues] ✅ Chargé:', Object.keys(memoryQueues).length, 'queues');
    }
  } catch (err) {
    console.error('[TDQueues] ❌ Erreur:', err.message);
  }
}

// Sauvegarder (debounced - attend 2s d'inactivité)
function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(TD_QUEUES_FILE, JSON.stringify(memoryQueues, null, 2), 'utf8');
      console.log('[TDQueues] 💾 Sauvegarde:', Object.keys(memoryQueues).length, 'queues');
    } catch (err) {
      console.error('[TDQueues] ❌ Sauvegarde:', err.message);
    }
  }, 2000); // 2 secondes d'inactivité
}

// Get/Set (synchrones)
function getQueue(key) {
  return memoryQueues[key];
}

function setQueue(key, value) {
  memoryQueues[key] = value;
  // Planifier sauvegarde APRÈS (non-bloquant)
  scheduleSave();
}

module.exports = { loadQueues, getQueue, setQueue };
