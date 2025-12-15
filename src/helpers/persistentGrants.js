/**
 * Système de grants persistant
 * Garantit qu'un grant n'est donné qu'UNE SEULE fois par utilisateur
 */

const fs = require('fs');
const fsp = fs.promises;

class PersistentGrants {
  constructor() {
    this.filepath = '/home/bagbot/Bag-bot/data/grants_given.json';
    this.cache = null;
  }

  async load() {
    try {
      if (!this.cache) {
        if (fs.existsSync(this.filepath)) {
          this.cache = JSON.parse(await fsp.readFile(this.filepath, 'utf8'));
        } else {
          this.cache = {};
        }
      }
      return this.cache;
    } catch (error) {
      console.error('[PersistentGrants] Erreur chargement:', error.message);
      this.cache = {};
      return this.cache;
    }
  }

  async save() {
    try {
      await fsp.writeFile(this.filepath, JSON.stringify(this.cache, null, 2), 'utf8');
    } catch (error) {
      console.error('[PersistentGrants] Erreur sauvegarde:', error.message);
    }
  }

  async hasGrant(guildId, userId, grantIndex) {
    await this.load();
    const key = `${guildId}:${userId}:grant:${grantIndex}`;
    return this.cache[key] === true;
  }

  async markGrantGiven(guildId, userId, grantIndex) {
    await this.load();
    const key = `${guildId}:${userId}:grant:${grantIndex}`;
    this.cache[key] = true;
    await this.save();
    console.log(`[PersistentGrants] Grant ${grantIndex} marqué pour ${userId} dans ${guildId}`);
  }

  async resetGrants(guildId, userId) {
    await this.load();
    const prefix = `${guildId}:${userId}:grant:`;
    let count = 0;
    
    for (const key in this.cache) {
      if (key.startsWith(prefix)) {
        delete this.cache[key];
        count++;
      }
    }
    
    if (count > 0) {
      await this.save();
      console.log(`[PersistentGrants] ${count} grants réinitialisés pour ${userId}`);
    }
    
    return count;
  }

  async getStats(guildId, userId) {
    await this.load();
    const prefix = `${guildId}:${userId}:grant:`;
    const grants = [];
    
    for (const key in this.cache) {
      if (key.startsWith(prefix)) {
        const grantIndex = key.split(':grant:')[1];
        grants.push(parseInt(grantIndex, 10));
      }
    }
    
    return grants.sort((a, b) => a - b);
  }
}

module.exports = new PersistentGrants();
