#!/bin/bash
pm2 flush bag-bot
echo "=== MONITORING ACTIF ==="
echo "Faites /calin @quelquun MAINTENANT sur Discord"
echo ""
sleep 3
pm2 logs bag-bot --lines 0 &
PID=$!
sleep 10
kill $PID 2>/dev/null
echo ""
echo "=== FIN MONITORING ==="
pm2 logs bag-bot --lines 50 --nostream
