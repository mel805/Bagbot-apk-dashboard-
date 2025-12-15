# 🔗 Lien Direct pour Télécharger l'APK

## 📱 Une fois le build terminé

### Lien Direct vers Actions :
```
https://github.com/mel805/Bagbot-apk-dashboard-/actions
```

### Comment télécharger l'APK :

1. **Allez sur le lien ci-dessus**

2. **Cliquez sur le workflow le plus récent** (en haut de la liste)
   - Il devrait avoir un ✅ vert si la compilation a réussi
   - Ou être en cours (⚪ orange)

3. **Scrollez vers le bas de la page**

4. **Section "Artifacts"**
   - Vous verrez : `bagbot-manager-release`

5. **Cliquez dessus** pour télécharger

6. **Décompressez le fichier ZIP**

7. **Vous avez app-release.apk !** 🎉

---

## 🕐 Temps d'Attente

- **Push du code** : Instantané
- **Démarrage du build** : 10-30 secondes
- **Compilation de l'APK** : 5-10 minutes
- **Total** : ~10 minutes maximum

---

## 📊 Suivi en Temps Réel

Pour voir la progression du build en direct :

1. https://github.com/mel805/Bagbot-apk-dashboard-/actions
2. Cliquez sur le workflow en cours
3. Vous verrez chaque étape se compléter :
   - Set up JDK 17
   - Setup Android SDK  
   - Grant execute permission for gradlew
   - Create keystore directory
   - Create keystore
   - Create keystore.properties
   - Build Release APK ← La plus longue (5 min)
   - Upload APK

---

## 🎯 Liens Rapides

| Description | Lien |
|-------------|------|
| **Actions GitHub** | https://github.com/mel805/Bagbot-apk-dashboard-/actions |
| **Repo GitHub** | https://github.com/mel805/Bagbot-apk-dashboard- |
| **Dernier workflow** | https://github.com/mel805/Bagbot-apk-dashboard-/actions/workflows/build-apk.yml |

---

## ✅ Vérifier que le Build a Réussi

Sur la page Actions, vous verrez :

- ✅ **Vert** = Build réussi ! Téléchargez l'APK
- 🟡 **Jaune** = Build en cours, patientez...
- ❌ **Rouge** = Build échoué, consultez les logs

---

## 📥 Téléchargement de l'APK

Une fois le build ✅ :

```
https://github.com/mel805/Bagbot-apk-dashboard-/actions
→ Dernier workflow (en haut)
→ Scroll vers le bas
→ Artifacts : bagbot-manager-release
→ Cliquez pour télécharger (ZIP)
→ Décompressez
→ app-release.apk est là ! 🎊
```

---

## 📱 Installation sur Android

1. **Transférez l'APK** sur votre téléphone
   - Via USB
   - Via Google Drive / Dropbox
   - Par email

2. **Sur votre téléphone** :
   - Ouvrez le fichier `app-release.apk`
   - Autorisez l'installation depuis des sources inconnues
   - Installez

3. **Premier lancement** :
   - Configurez l'URL : `http://VOTRE_IP:3001`
   - Connectez-vous avec Discord
   - Profitez ! 🎉

---

## 🔄 Mettre à Jour l'APK

Pour une nouvelle version :

1. Modifiez le code
2. Commitez et poussez :
   ```bash
   git add .
   git commit -m "Update: description"
   git push
   ```
3. GitHub Actions recompile automatiquement
4. Téléchargez le nouvel APK

---

## 🆘 Problèmes Courants

### Build échoué (❌ rouge)

1. Cliquez sur le workflow
2. Cliquez sur l'étape en erreur
3. Lisez les logs
4. Corrigez le problème
5. Poussez à nouveau

### Pas d'artifacts

Si vous ne voyez pas "bagbot-manager-release" :
- Le build n'est pas encore terminé
- Ou le build a échoué

Vérifiez que toutes les étapes sont ✅

### Download ne démarre pas

- Vérifiez que vous êtes connecté à GitHub
- Essayez un autre navigateur
- Téléchargez depuis un PC plutôt que mobile

---

## 📞 Support

En cas de problème avec le build GitHub Actions :
- Consultez les logs du workflow
- Vérifiez le fichier `.github/workflows/build-apk.yml`
- Le workflow est configuré pour Android API 34

---

**Votre APK sera prêt dans ~10 minutes ! 🚀**

Surveillez : https://github.com/mel805/Bagbot-apk-dashboard-/actions
