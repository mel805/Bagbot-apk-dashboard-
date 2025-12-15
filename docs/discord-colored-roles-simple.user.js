// ==UserScript==
// @name         Discord - Rôles Colorés (Simple & Testé)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Colore les noms de rôles Discord - VERSION SIMPLE ET TESTÉE
// @author       BagBot Assistant
// @match        https://discord.com/*
// @match        https://canary.discord.com/*
// @match        https://ptb.discord.com/*
// @icon         https://discord.com/assets/icon.png
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('%c🎨 Discord Rôles Colorés v2.1 - DÉMARRÉ', 'color: #ff1744; font-size: 16px; font-weight: bold;');

    // Attendre que Discord soit chargé
    function waitForDiscord() {
        if (document.querySelector('[class*="app-"]') || document.querySelector('[class*="wrapper-"]')) {
            console.log('✅ Discord détecté, démarrage du script...');
            init();
        } else {
            console.log('⏳ Attente de Discord...');
            setTimeout(waitForDiscord, 500);
        }
    }

    function init() {
        // Injecter le CSS
        const style = document.createElement('style');
        style.id = 'discord-colored-roles-css';
        style.textContent = `
            /* Forcer les rôles à être colorés dans les paramètres */
            [class*="role-"] [class*="name"],
            [class*="role"] [class*="Name"],
            div[class*="role"] > div[class*="name"] {
                font-weight: 700 !important;
                filter: brightness(1.2) !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ CSS injecté');

        // Fonction pour colorer un rôle
        function colorerRole(element) {
            if (!element || element.hasAttribute('data-colored')) return;

            // Chercher le nom du rôle
            let nomElement = null;
            const possibleNames = [
                element.querySelector('[class*="roleName"]'),
                element.querySelector('[class*="name"]'),
                element.querySelector('div[class*="name"]')
            ];

            for (let el of possibleNames) {
                if (el && el.textContent.trim()) {
                    nomElement = el;
                    break;
                }
            }

            if (!nomElement) return;

            // Chercher la couleur (cercle coloré)
            let couleur = null;
            const possibleColors = [
                element.querySelector('[class*="roleCircle"]'),
                element.querySelector('circle'),
                element.querySelector('[fill]'),
                element.querySelector('[class*="color"]')
            ];

            for (let el of possibleColors) {
                if (!el) continue;

                // Essayer fill (SVG)
                const fill = el.getAttribute('fill');
                if (fill && fill !== 'currentColor' && fill !== 'none' && fill.startsWith('#')) {
                    couleur = fill;
                    break;
                }

                // Essayer style
                const style = el.getAttribute('style');
                if (style && style.includes('rgb')) {
                    const match = style.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    if (match) {
                        const r = parseInt(match[1]);
                        const g = parseInt(match[2]);
                        const b = parseInt(match[3]);
                        couleur = `rgb(${r}, ${g}, ${b})`;
                        break;
                    }
                }
            }

            // Appliquer la couleur
            if (couleur) {
                const nomTexte = nomElement.textContent.trim();
                nomElement.style.color = couleur;
                nomElement.style.fontWeight = '700';
                nomElement.style.textShadow = `0 0 2px ${couleur}`;
                element.setAttribute('data-colored', 'true');
                
                console.log(`✅ Rôle coloré: "${nomTexte}" → ${couleur}`);
                return true;
            }

            return false;
        }

        // Fonction pour scanner tous les rôles
        function scannerRoles() {
            let count = 0;
            
            // Chercher dans les paramètres de rôles
            const roles = document.querySelectorAll('[class*="role-"], [role="listitem"]');
            
            roles.forEach(role => {
                if (colorerRole(role)) {
                    count++;
                }
            });

            if (count > 0) {
                console.log(`✅ ${count} rôle(s) coloré(s)`);
            }

            return count;
        }

        // Scanner immédiatement
        setTimeout(() => {
            const initial = scannerRoles();
            if (initial === 0) {
                console.log('⚠️ Aucun rôle trouvé. Es-tu sur la page Paramètres → Rôles ?');
            }
        }, 1000);

        // Scanner toutes les 2 secondes
        setInterval(scannerRoles, 2000);

        // Observer les changements
        const observer = new MutationObserver(() => {
            scannerRoles();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ Script actif ! Observer en place.');
    }

    // Démarrer
    waitForDiscord();

    // Message d'aide
    console.log('%c📖 AIDE:', 'color: #ffd700; font-size: 14px; font-weight: bold;');
    console.log('1. Va sur Discord → Paramètres du serveur → Rôles');
    console.log('2. Les rôles devraient être colorés automatiquement');
    console.log('3. Si ça ne marche pas, recharge la page (F5)');
    console.log('4. Vérifie les messages dans cette console');

})();
