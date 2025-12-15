/**
 * Fonction de validation anti-corruption
 * Vérifie qu'un config n'est pas vide/corrompu avant de l'écrire
 */
function validateConfigBeforeWrite(configData, guildId) {
  try {
    // 1. Vérifier que c'est un objet valide
    if (!configData || typeof configData !== 'object') {
      console.error('[Protection] ❌ Config invalide: pas un objet');
      return { valid: false, reason: 'invalid_object' };
    }

    // 2. Vérifier la structure guilds
    if (!configData.guilds || typeof configData.guilds !== 'object') {
      console.error('[Protection] ❌ Config invalide: pas de guilds');
      return { valid: false, reason: 'no_guilds' };
    }

    // 3. Si guildId fourni, vérifier ce serveur spécifiquement
    if (guildId) {
      const guild = configData.guilds[guildId];
      if (!guild || typeof guild !== 'object') {
        console.error(`[Protection] ❌ Config invalide: guild ${guildId} manquant`);
        return { valid: false, reason: 'missing_guild' };
      }

      // Vérifier les données d'économie
      if (guild.economy) {
        const balances = guild.economy.balances || {};
        const balanceCount = Object.keys(balances).length;
        
        // Minimum 10 utilisateurs pour un serveur actif
        if (balanceCount < 10) {
          console.error(`[Protection] ⚠️  ALERTE: Seulement ${balanceCount} utilisateurs économie (minimum 10)`);
          return { valid: false, reason: 'too_few_users', count: balanceCount };
        }

        console.log(`[Protection] ✅ Validation OK: ${balanceCount} utilisateurs`);
      }
    }

    // 4. Compter le total d'utilisateurs tous serveurs
    let totalBalances = 0;
    for (const gid in configData.guilds) {
      const g = configData.guilds[gid];
      if (g.economy && g.economy.balances) {
        totalBalances += Object.keys(g.economy.balances).length;
      }
    }

    if (totalBalances < 50) {
      console.error(`[Protection] ❌ CRITIQUE: Seulement ${totalBalances} utilisateurs total (min 50)`);
      return { valid: false, reason: 'total_too_low', total: totalBalances };
    }

    console.log(`[Protection] ✅ Validation globale OK: ${totalBalances} utilisateurs total`);
    return { valid: true, totalUsers: totalBalances };

  } catch (error) {
    console.error('[Protection] ❌ Erreur validation:', error.message);
    return { valid: false, reason: 'validation_error', error: error.message };
  }
}

module.exports = { validateConfigBeforeWrite };
