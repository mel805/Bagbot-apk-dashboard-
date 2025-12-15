const { Worker } = require('worker_threads');
const fs = require('fs');
const path = require('path');

const TD_FILE = path.join(__dirname, '..', 'data', 'td-queues.json');
const memoryQueues = {};
let worker = null;
let saveScheduled = false;

// Charger au démarrage
function loadQueues() {
  try {
    if (fs.existsSync(TD_FILE)) {
      const data = fs.readFileSync(TD_FILE, 'utf8');
      const loaded = JSON.parse(data);
      Object.assign(memoryQueues, loaded);
      console.log('[TDQueues] ✅ Chargé:', Object.keys(memoryQueues).length, 'queues');
    }
  } catch (err) {
    console.error('[TDQueues] ❌ Erreur:', err.message);
  }
  
  // Démarrer le worker
  try {
    worker = new Worker(path.join(__dirname, 'td-saver-worker.js'));
    console.log('[TDQueues] ✅ Worker thread démarré');
  } catch (err) {
    console.error('[TDQueues] ❌ Worker:', err.message);
  }
}

// Planifier sauvegarde (debounced)
function scheduleSave() {
  if (saveScheduled || !worker) return;
  
  saveScheduled = true;
  setTimeout(() => {
    if (worker) {
      worker.postMessage({ type: 'save', queues: memoryQueues });
      console.log('[TDQueues] 💾 Sauvegarde envoyée au worker');
    }
    saveScheduled = false;
  }, 2000);
}

function getQueue(key) {
  return memoryQueues[key];
}

function setQueue(key, value) {
  memoryQueues[key] = value;
  scheduleSave(); // Non-bloquant
}

module.exports = { loadQueues, getQueue, setQueue };
