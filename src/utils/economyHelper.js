/**
 * Ce fichier exporte la fonction handleEconomyAction depuis bot.js
 * pour permettre aux commandes modulaires de l'utiliser
 * 
 * IMPORTANT: Cette fonction est définie dans bot.js ligne ~964
 * Nous créons ici une référence qui sera remplie au runtime
 */

let handleEconomyActionRef = null;

/**
 * Initialise la référence à handleEconomyAction depuis bot.js
 */
function initHandleEconomyAction(fn) {
  handleEconomyActionRef = fn;
}

/**
 * Wrapper pour appeler handleEconomyAction
 */
async function handleEconomyAction(interaction, actionKey) {
  if (!handleEconomyActionRef) {
    throw new Error('handleEconomyAction not initialized. Call initHandleEconomyAction first.');
  }
  return handleEconomyActionRef(interaction, actionKey);
}

module.exports = {
  initHandleEconomyAction,
  handleEconomyAction
};