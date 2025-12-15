const fs = require('fs');
const path = require('path');

const TD_QUEUES_FILE = path.join(__dirname, '..', 'data', 'td-queues.json');

// Queue en mémoire (partagée globalement)
let memoryQueues = null;
let saveInterval = null;
let loaded = false;

// Charger les queues depuis le fichier (lazy loading)
function ensureLoaded() {
  if (loaded) return;
  
  try {
    if (fs.existsSync(TD_QUEUES_FILE)) {
      const data = fs.readFileSync(TD_QUEUES_FILE, 'utf8');
      memoryQueues = JSON.parse(data);
      console.log('[TDQueues] ✅ Chargé:', Object.keys(memoryQueues).length, 'queues');
    } else {
      memoryQueues = {};
      console.log('[TDQueues] ✅ Nouveau fichier créé');
    }
  } catch (err) {
    console.error('[TDQueues] ❌ Erreur chargement:', err.message);
    memoryQueues = {};
  }
  
  loaded = true;
  startPeriodicSave();
}

// Obtenir la queue en mémoire
function getQueue(queueKey) {
  ensureLoaded();
  return memoryQueues[queueKey];
}

// Mettre à jour la queue en mémoire
function setQueue(queueKey, queue) {
  ensureLoaded();
  memoryQueues[queueKey] = queue;
}

// Sauvegarder toutes les queues sur disque
function saveQueues() {
  if (!loaded || !memoryQueues) return;
  
  try {
    fs.writeFileSync(TD_QUEUES_FILE, JSON.stringify(memoryQueues, null, 2), 'utf8');
    const count = Object.keys(memoryQueues).length;
    if (count > 0) {
      console.log('[TDQueues] 💾 Sauvegarde:', count, 'queues');
    }
  } catch (err) {
    console.error('[TDQueues] ❌ Erreur sauvegarde:', err.message);
  }
}

// Démarrer la sauvegarde périodique
function startPeriodicSave() {
  if (saveInterval) return;
  
  saveInterval = setInterval(() => {
    saveQueues();
  }, 10000); // 10 secondes
  
  console.log('[TDQueues] ⏱️  Sauvegarde périodique démarrée (10s)');
}

module.exports = { getQueue, setQueue };
