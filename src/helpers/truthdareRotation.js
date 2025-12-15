/**
 * Système de rotation persistante pour Action/Vérité
 * Garantit que toutes les questions sortent une fois avant de se répéter
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

class TruthDareRotation {
  constructor() {
    this.statePath = '/home/bagbot/Bag-bot/data/truthdare_rotation.json';
    this.state = null;
  }

  /**
   * Charger l'état de rotation
   */
  async loadState() {
    try {
      if (!this.state) {
        if (fs.existsSync(this.statePath)) {
          this.state = JSON.parse(await fsp.readFile(this.statePath, 'utf8'));
        } else {
          this.state = { guilds: {}, dms: {} };
        }
      }
      return this.state;
    } catch (error) {
      console.error('[TruthDareRotation] Erreur chargement:', error.message);
      this.state = { guilds: {}, dms: {} };
      return this.state;
    }
  }

  /**
   * Sauvegarder l'état de rotation
   */
  async saveState() {
    try {
      await fsp.mkdir(path.dirname(this.statePath), { recursive: true });
      await fsp.writeFile(this.statePath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (error) {
      console.error('[TruthDareRotation] Erreur sauvegarde:', error.message);
    }
  }

  /**
   * Initialiser la rotation pour un contexte (guild ou DM)
   */
  initRotation(contextId, mode, type, totalPrompts) {
    const key = `${mode}_${type}`; // ex: sfw_action, nsfw_verite
    
    return {
      available: Array.from({ length: totalPrompts }, (_, i) => i),
      used: []
    };
  }

  /**
   * Obtenir un prompt avec rotation
   */
  async getPrompt(contextId, isDM, mode, type, prompts) {
    await this.loadState();
    
    const contextType = isDM ? 'dms' : 'guilds';
    const key = `${mode}_${type}`; // sfw_action, nsfw_verite, etc.
    
    // Initialiser le contexte si nécessaire
    if (!this.state[contextType][contextId]) {
      this.state[contextType][contextId] = {};
    }
    
    const ctx = this.state[contextType][contextId];
    
    // Initialiser la rotation si nécessaire ou si terminée
    if (!ctx[key] || ctx[key].available.length === 0) {
      ctx[key] = this.initRotation(contextId, mode, type, prompts.length);
    }
    
    const rotation = ctx[key];
    
    // Si plus de prompts disponibles, réinitialiser
    if (rotation.available.length === 0) {
      console.log(`[TruthDareRotation] Rotation complète pour ${contextId} ${key}, réinitialisation`);
      rotation.available = Array.from({ length: prompts.length }, (_, i) => i);
      rotation.used = [];
    }
    
    // Choisir un index aléatoire parmi les disponibles
    const randomIdx = Math.floor(Math.random() * rotation.available.length);
    const promptIndex = rotation.available[randomIdx];
    
    // Retirer cet index des disponibles
    rotation.available.splice(randomIdx, 1);
    rotation.used.push(promptIndex);
    
    // Sauvegarder l'état
    await this.saveState();
    
    const prompt = prompts[promptIndex];
    
    console.log(`[TruthDareRotation] ${contextId} ${key}: ${rotation.used.length}/${prompts.length} utilisés, ${rotation.available.length} restants`);
    
    return {
      prompt,
      index: promptIndex,
      used: rotation.used.length,
      total: prompts.length,
      remaining: rotation.available.length
    };
  }

  /**
   * Réinitialiser la rotation pour un contexte
   */
  async resetRotation(contextId, isDM, mode, type) {
    await this.loadState();
    
    const contextType = isDM ? 'dms' : 'guilds';
    const key = `${mode}_${type}`;
    
    if (this.state[contextType][contextId] && this.state[contextType][contextId][key]) {
      delete this.state[contextType][contextId][key];
      await this.saveState();
      console.log(`[TruthDareRotation] Rotation réinitialisée pour ${contextId} ${key}`);
    }
  }

  /**
   * Obtenir les statistiques de rotation
   */
  async getStats(contextId, isDM) {
    await this.loadState();
    
    const contextType = isDM ? 'dms' : 'guilds';
    const ctx = this.state[contextType][contextId];
    
    if (!ctx) return null;
    
    const stats = {};
    for (const [key, rotation] of Object.entries(ctx)) {
      stats[key] = {
        used: rotation.used.length,
        total: rotation.used.length + rotation.available.length,
        remaining: rotation.available.length,
        progress: `${rotation.used.length}/${rotation.used.length + rotation.available.length}`
      };
    }
    
    return stats;
  }
}

// Export singleton
module.exports = new TruthDareRotation();
