// ==UserScript==
// @name         Discord - Colored Role Names (Enhanced)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Affiche les noms de rôles Discord dans leur couleur PARTOUT (paramètres, profils, etc.)
// @author       BagBot Assistant
// @match        https://discord.com/*
// @match        https://canary.discord.com/*
// @match        https://ptb.discord.com/*
// @icon         https://discord.com/assets/icon.png
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log('🎨 Discord Colored Roles Enhanced v2.0 - Script chargé !');

    // Style CSS pour les rôles colorés PARTOUT
    const style = document.createElement('style');
    style.textContent = `
        /* === PAGE PARAMÈTRES RÔLES === */
        [class*="role_"] [class*="roleName_"],
        [class*="roleRow_"] [class*="roleName_"],
        [class*="role-"] [class*="name-"] {
            font-weight: 600 !important;
            text-shadow: 0 0 1px currentColor !important;
        }
        
        /* Animation au survol dans les paramètres */
        [class*="role_"]:hover [class*="roleName_"],
        [class*="roleRow_"]:hover [class*="roleName_"] {
            text-shadow: 0 0 8px currentColor !important;
            transition: text-shadow 0.2s ease !important;
        }
        
        /* === PROFIL DES MEMBRES === */
        [class*="rolesList_"] [class*="rolePill_"],
        [class*="role_"][class*="pill_"],
        [class*="roleTag_"],
        [class*="role"][class*="Tag"] {
            font-weight: 600 !important;
        }
        
        /* Rendre les rôles dans les profils plus visibles */
        [class*="rolesList_"] [class*="rolePill_"]:hover,
        [class*="role_"][class*="pill_"]:hover {
            transform: scale(1.05) !important;
            transition: transform 0.2s ease !important;
        }
        
        /* === MENTIONS DE RÔLES === */
        [class*="mention"][class*="role"],
        [class*="roleMention"] {
            font-weight: 600 !important;
        }
        
        /* === LISTE DES MEMBRES (SIDEBAR) === */
        [class*="role_"][class*="members_"] h2,
        [class*="membersGroup_"] {
            font-weight: 700 !important;
            text-shadow: 0 1px 3px currentColor !important;
        }
    `;
    document.head.appendChild(style);

    // Cache pour stocker les couleurs des rôles
    const roleColorCache = new Map();

    // Fonction pour convertir rgb en hex
    function rgbToHex(rgb) {
        if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return null;
        
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return rgb;
        
        const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);
        return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
    }

    // Fonction pour extraire la couleur d'un élément de rôle
    function getRoleColor(roleElement) {
        // Chercher le point coloré ou tout élément contenant la couleur
        const colorElements = [
            roleElement.querySelector('[class*="roleCircle"]'),
            roleElement.querySelector('[class*="roleDot"]'),
            roleElement.querySelector('[fill]'),
            roleElement.querySelector('circle'),
            roleElement.querySelector('[class*="roleColor"]')
        ].filter(Boolean);
        
        for (const colorEl of colorElements) {
            // Essayer fill (SVG)
            const fillColor = colorEl.getAttribute('fill');
            if (fillColor && fillColor !== 'currentColor' && fillColor !== 'none') {
                return fillColor;
            }
            
            // Essayer background-color
            const bgColor = window.getComputedStyle(colorEl).backgroundColor;
            const hexBg = rgbToHex(bgColor);
            if (hexBg && hexBg !== 'rgb(185, 187, 190)') {
                return hexBg;
            }
            
            // Essayer color
            const color = window.getComputedStyle(colorEl).color;
            const hexColor = rgbToHex(color);
            if (hexColor && hexColor !== 'rgb(185, 187, 190)') {
                return hexColor;
            }
        }
        
        // Chercher dans les styles inline
        const style = roleElement.getAttribute('style');
        if (style) {
            const colorMatch = style.match(/(?:background-color|color):\s*(#[0-9a-fA-F]{6}|rgb\([^)]+\))/);
            if (colorMatch) {
                return rgbToHex(colorMatch[1]) || colorMatch[1];
            }
        }
        
        return null;
    }

    // Fonction pour obtenir la couleur depuis les classes de rôle
    function getRoleColorFromClasses(element) {
        const classes = element.className.split(' ');
        for (const cls of classes) {
            if (cls.startsWith('role-') || cls.includes('role')) {
                // Chercher dans le cache
                if (roleColorCache.has(cls)) {
                    return roleColorCache.get(cls);
                }
            }
        }
        return null;
    }

    // Fonction pour appliquer la couleur au nom du rôle (PAGE PARAMÈTRES)
    function colorizeRoleName(roleElement) {
        const roleNames = [
            roleElement.querySelector('[class*="roleName_"]'),
            roleElement.querySelector('[class*="name-"]'),
            roleElement.querySelector('[class*="roleNameContainer"]')
        ].filter(Boolean);
        
        if (roleNames.length === 0) return;
        
        const roleName = roleNames[0];
        
        // Éviter de recolorer si déjà fait
        if (roleName.hasAttribute('data-colored')) return;
        
        const color = getRoleColor(roleElement) || getRoleColorFromClasses(roleElement);
        
        if (color && color !== 'rgb(185, 187, 190)' && color !== '#b9bbbe') {
            roleName.style.color = color;
            roleName.setAttribute('data-colored', 'true');
            
            // Stocker dans le cache
            const roleText = roleName.textContent.trim();
            roleColorCache.set(roleText, color);
            
            console.log(`✅ Rôle coloré (paramètres) : ${roleText} → ${color}`);
        }
    }

    // Fonction pour colorer les rôles dans les PROFILS des membres
    function colorizeRolePill(pillElement) {
        // Éviter de recolorer
        if (pillElement.hasAttribute('data-colored')) return;
        
        // Chercher la couleur du rôle
        let color = null;
        
        // Méthode 1 : depuis le style background
        const bgColor = window.getComputedStyle(pillElement).backgroundColor;
        const hexBg = rgbToHex(bgColor);
        if (hexBg && hexBg !== 'rgba(0, 0, 0, 0)') {
            // Le background contient déjà la bonne couleur
            // On va l'extraire et l'appliquer au texte aussi
            color = hexBg;
        }
        
        // Méthode 2 : chercher dans le cache par nom de rôle
        const roleText = pillElement.textContent.trim();
        if (roleColorCache.has(roleText)) {
            color = roleColorCache.get(roleText);
        }
        
        // Méthode 3 : chercher un élément de couleur dans le pill
        if (!color) {
            color = getRoleColor(pillElement);
        }
        
        if (color && color !== '#b9bbbe') {
            // Appliquer la couleur au texte
            pillElement.style.color = '#ffffff';
            pillElement.style.fontWeight = '600';
            pillElement.style.textShadow = `0 0 4px ${color}`;
            pillElement.setAttribute('data-colored', 'true');
            
            console.log(`✅ Rôle coloré (profil) : ${roleText} → ${color}`);
        }
    }

    // Fonction pour colorer les mentions de rôles
    function colorizeMention(mentionElement) {
        if (mentionElement.hasAttribute('data-colored')) return;
        
        // Les mentions ont déjà une couleur de fond, on améliore juste
        const bgColor = window.getComputedStyle(mentionElement).backgroundColor;
        const hexBg = rgbToHex(bgColor);
        
        if (hexBg && hexBg !== 'rgba(0, 0, 0, 0)') {
            mentionElement.style.fontWeight = '600';
            mentionElement.style.textShadow = `0 0 2px ${hexBg}`;
            mentionElement.setAttribute('data-colored', 'true');
        }
    }

    // Fonction principale pour colorer tous les types de rôles
    function colorizeAllRoles() {
        // PAGE PARAMÈTRES - Liste des rôles
        const roleElements = document.querySelectorAll('[class*="role_"], [class*="roleRow_"]');
        roleElements.forEach(colorizeRoleName);
        
        // PROFILS - Pills de rôles
        const rolePills = document.querySelectorAll('[class*="rolesList_"] [class*="rolePill_"], [class*="role_"][class*="pill_"], [class*="roleTag_"]');
        rolePills.forEach(colorizeRolePill);
        
        // MENTIONS de rôles
        const mentions = document.querySelectorAll('[class*="mention"][class*="role"], [class*="roleMention"]');
        mentions.forEach(colorizeMention);
    }

    // Observer les changements du DOM
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // Vérifier si c'est un élément de rôle
                        const isRoleElement = 
                            (node.matches && (
                                node.matches('[class*="role"]') ||
                                node.matches('[class*="pill"]') ||
                                node.matches('[class*="mention"]')
                            )) ||
                            node.querySelector('[class*="role"]') ||
                            node.querySelector('[class*="pill"]') ||
                            node.querySelector('[class*="mention"]');
                        
                        if (isRoleElement) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            setTimeout(colorizeAllRoles, 100);
        }
    });

    // Initialisation
    function init() {
        if (document.body) {
            // Colorer tous les rôles existants
            colorizeAllRoles();
            
            // Observer les changements
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            console.log('✅ Discord Colored Roles Enhanced - Actif PARTOUT !');
            console.log('📍 Fonctionne dans : Paramètres, Profils, Mentions, etc.');
        } else {
            setTimeout(init, 100);
        }
    }

    // Démarrer
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Recolorer périodiquement
    setInterval(colorizeAllRoles, 3000);

})();
