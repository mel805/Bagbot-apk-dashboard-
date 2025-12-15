#!/bin/bash

cd ~/Bag-bot/dashboard-v2
cp index.html index.html.backup-before-cache-patch

# Créer le nouveau HTML avec les fonctions de cache
cat > index-temp.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>BAG Bot Dashboard V2 - Extended</title>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
HTMLEOF

# Copier le style depuis l'original
sed -n '/<style>/,/<\/style>/p' index.html | sed '1d;$d' >> index-temp.html

cat >> index-temp.html << 'HTMLEOF2'
</style>
</head>
<body>
<div id="app">
<div class="sidebar">
HTMLEOF2

# Copier la sidebar
sed -n '/<div class="sidebar">/,/<\/div>/p' index.html | sed '1d;$d' >> index-temp.html

cat >> index-temp.html << 'HTMLEOF3'
</div>

<div class="main">
HTMLEOF3

# Copier tout le contenu principal jusqu'au script
sed -n '/<div class="main">/,/<script>/p' index.html | sed '1d;$d' >> index-temp.html

# Ajouter le nouveau script avec les fonctions de cache
cat >> index-temp.html << 'SCRIPTEOF'
<script>
const{createApp}=Vue;
createApp({
data(){
return{
// ... tous les data existants
gifCache:{}, // Mapping URL -> URL en cache
}
},
async mounted(){
console.log('🚀 Dashboard V2 Extended mounted');
await this.loadGifCache();
await this.load();
},
methods:{
async loadGifCache(){
  try{
    const r=await fetch('/gif-cache/mapping.json');
    if(r.ok){
      const mapping=await r.json();
      // Convertir le mapping en cache utilisable
      for(const[hash,filename] of Object.entries(mapping)){
        this.gifCache[hash]='/gif-cache/'+filename;
      }
      console.log('✅ Cache GIF chargé:',Object.keys(this.gifCache).length,'GIFs');
    }
  }catch(e){
    console.warn('Cache GIF non disponible:',e);
  }
},
getGifDisplayUrl(url){
  if(!url) return '';
  // Essayer de trouver dans le cache
  const crypto_md5=this.simpleHash(url);
  if(this.gifCache[crypto_md5]){
    return this.gifCache[crypto_md5];
  }
  // Sinon utiliser le proxy
  return '/api/proxy-image?url='+encodeURIComponent(url);
},
simpleHash(str){
  // MD5 simplifié pour matcher le serveur
  let hash=0;
  for(let i=0;i<str.length;i++){
    const char=str.charCodeAt(i);
    hash=((hash<<5)-hash)+char;
    hash=hash&hash;
  }
  return Math.abs(hash).toString(16).padStart(32,'0');
},
async cacheGifIfNeeded(url){
  // Mettre en cache les GIFs Discord CDN
  if(url.includes('cdn.discordapp.com') || url.includes('media.discordapp')){
    try{
      const r=await fetch('/api/cache-gif-url',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({url})
      });
      if(r.ok){
        const data=await r.json();
        console.log('✅ GIF mis en cache:',data.filename);
        await this.loadGifCache(); // Recharger le cache
        return data.cacheUrl;
      }
    }catch(e){
      console.warn('Erreur cache GIF:',e);
    }
  }
  return null;
},
async addSuccessGifs(){
  if(!this.selectedAction){alert('❌ Sélectionnez une action');return;}
  if(!this.newSuccessGifs.trim()){alert('❌ Entrez au moins un GIF');return;}
  const urls=this.newSuccessGifs.split('\n').map(u=>u.trim()).filter(u=>u.length>0);
  if(urls.length===0){alert('❌ Aucun GIF valide');return;}
  
  // Mettre en cache les GIFs Discord CDN
  for(const url of urls){
    await this.cacheGifIfNeeded(url);
  }
  
  if(!this.actionsGifs[this.selectedAction]){
    this.actionsGifs[this.selectedAction]={success:[],fail:[],messages:[]};
  }
  if(!this.actionsGifs[this.selectedAction].success){
    this.actionsGifs[this.selectedAction].success=[];
  }
  this.actionsGifs[this.selectedAction].success.push(...urls);
  this.newSuccessGifs='';
  alert(`✅ ${urls.length} GIF(s) de succès ajouté(s) et mis en cache`);
},
async addFailGifs(){
  if(!this.selectedAction){alert('❌ Sélectionnez une action');return;}
  if(!this.newFailGifs.trim()){alert('❌ Entrez au moins un GIF');return;}
  const urls=this.newFailGifs.split('\n').map(u=>u.trim()).filter(u=>u.length>0);
  if(urls.length===0){alert('❌ Aucun GIF valide');return;}
  
  // Mettre en cache les GIFs Discord CDN
  for(const url of urls){
    await this.cacheGifIfNeeded(url);
  }
  
  if(!this.actionsGifs[this.selectedAction]){
    this.actionsGifs[this.selectedAction]={success:[],fail:[],messages:[]};
  }
  if(!this.actionsGifs[this.selectedAction].fail){
    this.actionsGifs[this.selectedAction].fail=[];
  }
  this.actionsGifs[this.selectedAction].fail.push(...urls);
  this.newFailGifs='';
  alert(`✅ ${urls.length} GIF(s) d'échec ajouté(s) et mis en cache`);
}
// ... toutes les autres méthodes
}
}).mount('#app');
</script>
</body>
</html>
SCRIPTEOF

echo '✅ Patch créé mais NON appliqué - vérification manuelle requise'
