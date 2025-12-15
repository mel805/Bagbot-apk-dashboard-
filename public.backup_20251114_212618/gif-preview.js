(function(){
  function byId(id){ return document.getElementById(id); }
  function getKey(){
    try{
      return byId(key)?.value || new URLSearchParams(location.search).get(key) || localStorage.getItem(DASHBOARD_KEY) || ;
    }catch(e){ return ; }
  }
  function api(path){ var k=getKey(); return k ? (path + (path.indexOf(?)>-1?
