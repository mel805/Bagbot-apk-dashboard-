(function(){
  function getKey(){ try{ return localStorage.getItem('dashKey') || new URLSearchParams(location.search).get('key') || ''; }catch(_){ return ''; } }
  function api(path){ var u=new URL(path, location.origin); var k=getKey(); if(k) u.searchParams.set('key', k); return u.toString(); }
  function el(tag, attrs){ var e=document.createElement(tag); if(attrs){ for(var k in attrs){ var v=attrs[k]; if(k==='style' && v && typeof v==='object') Object.assign(e.style,v); else if(k==='class') e.className=v; else e.setAttribute(k,v); } } return e; }
  function renderGrid(root, urls){ root.innerHTML=''; var grid=el('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:'8px'}}); (urls||[]).slice(0,24).forEach(function(u){ var img=el('img',{src:u,style:{width:'100%',height:'90px',objectFit:'cover',border:'1px solid #333',borderRadius:'8px'}}); grid.appendChild(img); }); root.appendChild(grid); }
  async function mount(){
    var container = document.querySelector('[data-subview=economy_gifs]') || document.getElementById('economy_gifs');
    if(document.getElementById('gifPreviewSection')) return;
    var box = el('div',{id:'gifPreviewSection',style:{marginTop:'16px',padding:'12px',border:'1px solid #ffffff1a',borderRadius:'12px',background:'#0f0f1a'}});
    var header = el('div',{style:{display:'flex',gap:'8px',alignItems:'center',marginBottom:'8px'}});
    var title = el('span', {style:{fontWeight:'600'}}); title.textContent = 'Aperçu GIFs';
    var select = el('select',{id:'gifActionSel',style:{background:'#101423',color:'#fff',border:'1px solid #333',borderRadius:'8px',padding:'6px'}});
    header.appendChild(title); header.appendChild(select);
    var succLabel = el('div',{style:{color:'#aee',margin:'6px 0 4px'}}); succLabel.textContent='Succès';
    var succGrid = el('div',{id:'gifSuccGrid'});
    var failLabel = el('div',{style:{color:'#faa',margin:'10px 0 4px'}}); failLabel.textContent='Échec';
    var failGrid = el('div',{id:'gifFailGrid'});
    box.appendChild(header); box.appendChild(succLabel); box.appendChild(succGrid); box.appendChild(failLabel); box.appendChild(failGrid);
    container.appendChild(box);
    try{
      var cfg = await fetchJson('/api/configs');
      var acts = (cfg.economy&&cfg.economy.actions) || {};
      var keys = Array.from(new Set([].concat(Object.keys(acts.config||{}),Object.keys(acts.messages||{})))).sort();
      keys.forEach(function(k){ var o=el('option'); o.value=k; o.textContent=k; select.appendChild(o); });
      async function update(){ var key=select.value; var msg=(acts.messages||{})[key]||{success:[],fail:[]}; renderGrid(succGrid, Array.isArray(msg.success)?msg.success:[]); renderGrid(failGrid, Array.isArray(msg.fail)?msg.fail:[]); }
      select.addEventListener('change', update); await update();
    }catch(e){ var err=el('div',{style:{color:'#f88'}}); err.textContent='Erreur chargement GIFs'; box.appendChild(err); }
  }
  var tries=0, iv=setInterval(function(){ try{ if(++tries>40){ clearInterval(iv); return; } mount(); }catch(_){ } }, 500);
})();
