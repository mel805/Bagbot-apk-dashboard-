#!/bin/bash
# Script pour pousser la sauvegarde vers GitHub
# Exécutez ce script après avoir configuré l authentification GitHub

echo "=== Push vers GitHub ==="
echo ""
echo "Le commit est prêt localement avec 513 fichiers"
echo "Commit: 🔄 Sauvegarde complète du bot - 10 Octobre 2025"
echo ""
echo "Options pour pousser vers GitHub:"
echo ""
echo "Option 1: Avec token GitHub (RECOMMANDÉ)"
echo "  git remote set-url origin https://VOTRE_TOKEN@github.com/mel805/Bag-bot.git"
echo "  git push --force origin main"
echo ""
echo "Option 2: Avec SSH"
echo "  git remote set-url origin git@github.com:mel805/Bag-bot.git"
echo "  git push --force origin main"
echo ""
echo "Option 3: Pousser maintenant (si GitHub CLI est configuré)"
read -p "Voulez-vous pousser maintenant? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git push --force origin main
fi
