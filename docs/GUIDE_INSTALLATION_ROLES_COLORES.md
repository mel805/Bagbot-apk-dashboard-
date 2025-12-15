# 🎨 Guide d'Installation - Rôles Discord Colorés (Enhanced v2.0)

## ✨ Ce que fait ce script

Ce script **colore automatiquement** les noms de rôles Discord avec leur couleur configurée **PARTOUT** sur Discord !

### 📍 Fonctionne dans :
- ✅ **Page de gestion des rôles** (Paramètres → Rôles)
- ✅ **Profils des membres** (clic droit → Profil)
- ✅ **Liste des rôles** dans les profils
- ✅ **Mentions de rôles** (@rôle)
- ✅ **Sidebar des membres** (sections de rôles)

**Au lieu de :**
- 🔴 Nom du rôle (petit point coloré)

**Tu auras :**
- **<span style="color: #ff1744;">🔴 Nom du rôle</span>** (texte entier coloré PARTOUT !)

---

## 📋 Prérequis

Tu as besoin d'une extension de navigateur pour exécuter des userscripts. Je recommande **Tampermonkey** (gratuit et sûr).

---

## 🚀 Installation - Étape par étape

### Étape 1 : Installer Tampermonkey

Choisis ton navigateur et clique sur le lien correspondant :

#### Google Chrome / Brave / Edge
👉 https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

#### Firefox
👉 https://addons.mozilla.org/fr/firefox/addon/tampermonkey/

#### Safari
👉 https://apps.apple.com/app/tampermonkey/id1482490089

#### Opera
👉 https://addons.opera.com/extensions/details/tampermonkey-beta/

1. Clique sur **"Ajouter à [Navigateur]"**
2. Confirme l'installation
3. L'icône Tampermonkey apparaît dans ta barre d'extensions

---

### Étape 2 : Installer le script

#### Option A : Installation automatique (RECOMMANDÉ)

1. Clique sur ce lien :
   ```
   https://raw.githubusercontent.com/mel805/Bagbot/main/discord-colored-roles.user.js
   ```

2. Tampermonkey s'ouvre automatiquement avec le script
3. Clique sur **"Installer"**
4. C'est tout ! ✅

#### Option B : Installation manuelle

1. Clique sur l'icône **Tampermonkey** dans ton navigateur
2. Sélectionne **"Créer un nouveau script"**
3. Supprime tout le contenu par défaut
4. Copie-colle le contenu du fichier `discord-colored-roles.user.js`
5. Appuie sur **Ctrl + S** (ou Cmd + S sur Mac) pour sauvegarder
6. Ferme l'onglet de l'éditeur

---

### Étape 3 : Vérifier que ça fonctionne

1. Va sur **Discord** (discord.com)
2. Ouvre les **Paramètres du serveur** → **Rôles**
3. **Recharge la page** (F5 ou Ctrl + R)
4. 🎉 **Les noms de rôles sont maintenant colorés !**

---

## 🔍 Vérification

### Comment savoir si le script fonctionne ?

1. **Ouvre la console du navigateur** :
   - Windows/Linux : `F12` ou `Ctrl + Shift + I`
   - Mac : `Cmd + Option + I`

2. Va dans l'onglet **"Console"**

3. Recharge la page Discord

4. Tu devrais voir ces messages :
   ```
   🎨 Discord Colored Roles - Script chargé !
   ✅ Discord Colored Roles - Actif !
   ✅ Rôle coloré : [Nom du rôle] → [Couleur]
   ```

---

## ⚙️ Fonctionnalités

### ✅ Ce que fait le script :

- ✨ Colore automatiquement tous les noms de rôles **PARTOUT**
- 🔄 Détecte les nouveaux rôles ajoutés dynamiquement
- 💡 Ajoute un effet de brillance au survol
- 👤 Fonctionne dans les **profils des membres**
- 💬 Améliore les **mentions de rôles**
- 📋 Colore la **liste des membres** (sidebar)
- 🎯 Fonctionne sur toutes les pages Discord (discord.com, canary, ptb)
- ⚡ Léger et rapide
- 🔒 100% sûr (tout le code est visible et ne modifie que l'affichage)

### ❌ Ce que le script ne fait PAS :

- ❌ Ne modifie pas les rôles eux-mêmes
- ❌ Ne change pas les permissions
- ❌ N'envoie aucune donnée
- ❌ Ne ralentit pas Discord

---

## 🎨 Personnalisation

Tu peux modifier le script pour changer l'apparence !

### Exemples de modifications :

#### 1. Changer l'intensité de la brillance au survol

Trouve cette ligne dans le script :
```javascript
text-shadow: 0 0 8px currentColor !important;
```

Change `8px` pour plus ou moins de brillance :
- `4px` = brillance subtile
- `12px` = brillance forte
- `20px` = effet néon !

#### 2. Ajouter un fond coloré aux rôles

Ajoute cette ligne dans la section `style.textContent` :
```css
[class*="role_"]:hover {
    background: linear-gradient(90deg, transparent, currentColor 50%, transparent) !important;
    opacity: 0.2 !important;
}
```

---

## ❓ Problèmes courants

### Le script ne fonctionne pas

1. **Vérifie que Tampermonkey est activé**
   - Clique sur l'icône Tampermonkey
   - L'interrupteur doit être sur ON

2. **Vérifie que le script est activé**
   - Ouvre Tampermonkey → Tableau de bord
   - Le script doit avoir une coche verte ✅

3. **Recharge complètement Discord**
   - Appuie sur `Ctrl + Shift + R` (ou `Cmd + Shift + R` sur Mac)
   - Cela force un rechargement complet

4. **Vide le cache de Discord**
   - Paramètres Discord → Avancés → Vider le cache

### Les rôles ne sont colorés que partiellement

C'est normal ! Discord charge les rôles progressivement. Le script les colore au fur et à mesure.

### Certains rôles ne sont pas colorés

Les rôles sans couleur définie (gris par défaut) ne seront pas colorés - c'est voulu pour garder une hiérarchie visuelle.

---

## 🔄 Mise à jour du script

Le script se met à jour automatiquement via Tampermonkey ! Mais tu peux forcer une mise à jour :

1. Tampermonkey → Tableau de bord
2. Clique sur le script
3. Clique sur "Dernière mise à jour"
4. Attends quelques secondes

---

## 🗑️ Désinstallation

Si tu veux désinstaller le script :

1. Clique sur l'icône **Tampermonkey**
2. Va dans **"Tableau de bord"**
3. Trouve le script **"Discord - Colored Role Names"**
4. Clique sur l'icône **Corbeille** 🗑️
5. Confirme la suppression

---

## 💡 Astuces

### Combiner avec d'autres thèmes

Ce script fonctionne parfaitement avec :
- BetterDiscord
- Powercord
- Vencord
- Thèmes Discord personnalisés

### Capturer un screenshot

Les rôles colorés apparaîtront aussi sur tes screenshots ! Parfait pour montrer ton serveur stylé.

---

## 🎯 Résultat

**AVANT :**
```
🔴 ━━━━━━━━━━━━━━━━━━  (gris avec point rouge)
💎 Admin                 (gris avec point jaune)
🔥 Modérateur            (gris avec point bleu)
```

**APRÈS :**
```
🔴 ━━━━━━━━━━━━━━━━━━  (ROUGE VIF !)
💎 Admin                 (OR BRILLANT !)
🔥 Modérateur            (BLEU ROYAL !)
```

---

## 📞 Support

Si tu as des problèmes :

1. Ouvre la console (F12)
2. Fais un screenshot des erreurs
3. Décris le problème

---

## ⚖️ Légal

Ce script est fourni "tel quel" sans garantie. Il ne viole pas les ToS de Discord car il ne modifie que l'affichage client-side et n'interagit pas avec l'API Discord.

**Utilisation à tes propres risques.**

---

## 🎉 Profite de tes rôles colorés !

Maintenant, ta page de gestion des rôles ressemble exactement à ce que tu voulais ! 🌈🔥

---

**Créé avec 💜 par BagBot Assistant**
