const { parentPort } = require('worker_threads');
const fs = require('fs');
const path = require('path');

const TD_FILE = path.join(__dirname, '..', 'data', 'td-queues.json');

// Écouter les messages du thread principal
parentPort.on('message', (data) => {
  if (data.type === 'save') {
    try {
      fs.writeFileSync(TD_FILE, JSON.stringify(data.queues, null, 2), 'utf8');
      parentPort.postMessage({ success: true });
    } catch (err) {
      parentPort.postMessage({ success: false, error: err.message });
    }
  }
});
