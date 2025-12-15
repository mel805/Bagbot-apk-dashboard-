#!/bin/bash

# Script pour créer l'APK Release de BagBot Manager

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║           📱 BUILD APK RELEASE - BAGBOT MANAGER 📱                ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  NOTE IMPORTANTE :${NC}"
echo "Pour une vraie application en production, vous devriez utiliser un keystore"
echo "sécurisé. Pour ce build de développement, nous allons créer un keystore local."
echo ""

# Vérifier si gradlew existe
if [ ! -f "gradlew" ]; then
    echo -e "${RED}❌ Erreur : gradlew non trouvé${NC}"
    echo "Assurez-vous d'être dans le répertoire android-app"
    exit 1
fi

# Créer le répertoire keystore si nécessaire
mkdir -p keystore

# Vérifier si le keystore existe déjà
if [ ! -f "keystore/bagbot-release.jks" ]; then
    echo -e "${YELLOW}🔑 Création du keystore...${NC}"
    
    # Créer un keystore avec des valeurs par défaut
    keytool -genkey -v -keystore keystore/bagbot-release.jks \
        -alias bagbot \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass bagbot123 \
        -keypass bagbot123 \
        -dname "CN=BagBot, OU=Mobile, O=BagBot, L=Paris, ST=IDF, C=FR"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Keystore créé avec succès${NC}"
        echo ""
        echo "📝 Informations du keystore :"
        echo "   Fichier : keystore/bagbot-release.jks"
        echo "   Alias : bagbot"
        echo "   Mot de passe store : bagbot123"
        echo "   Mot de passe key : bagbot123"
        echo ""
        echo -e "${YELLOW}⚠️  ATTENTION : Changez ces mots de passe pour la production !${NC}"
        echo ""
    else
        echo -e "${RED}❌ Erreur lors de la création du keystore${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Keystore existant trouvé${NC}"
fi

# Créer le fichier de configuration de signature
echo -e "${YELLOW}📝 Configuration de la signature...${NC}"

cat > keystore.properties << EOF
storeFile=keystore/bagbot-release.jks
storePassword=bagbot123
keyAlias=bagbot
keyPassword=bagbot123
EOF

echo -e "${GREEN}✓ Configuration de signature créée${NC}"
echo ""

# Nettoyer les builds précédents
echo -e "${YELLOW}🧹 Nettoyage des builds précédents...${NC}"
./gradlew clean

# Compiler l'APK release
echo ""
echo -e "${YELLOW}🔨 Compilation de l'APK Release...${NC}"
echo "Cela peut prendre quelques minutes..."
echo ""

./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                   ║${NC}"
    echo -e "${GREEN}║                    ✅ BUILD RÉUSSI ! ✅                            ║${NC}"
    echo -e "${GREEN}║                                                                   ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "📦 APK Release créé avec succès !"
    echo ""
    echo "📁 Emplacement de l'APK :"
    echo "   $(pwd)/app/build/outputs/apk/release/app-release.apk"
    echo ""
    
    # Vérifier la taille de l'APK
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
        echo "📊 Taille de l'APK : $SIZE"
        echo ""
    fi
    
    echo "📱 Installation sur votre appareil :"
    echo "   1. Transférez l'APK sur votre téléphone Android"
    echo "   2. Ouvrez le fichier APK"
    echo "   3. Autorisez l'installation depuis des sources inconnues si demandé"
    echo "   4. Installez l'application"
    echo ""
    echo "🔐 Note sur le keystore :"
    echo "   CONSERVEZ PRÉCIEUSEMENT le fichier keystore/bagbot-release.jks"
    echo "   et les mots de passe si vous voulez publier des mises à jour !"
    echo ""
else
    echo ""
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                   ║${NC}"
    echo -e "${RED}║                    ❌ BUILD ÉCHOUÉ ❌                             ║${NC}"
    echo -e "${RED}║                                                                   ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Vérifiez les erreurs ci-dessus."
    echo ""
    exit 1
fi
