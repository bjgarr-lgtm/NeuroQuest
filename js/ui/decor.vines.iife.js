// decor.vines.iife.js — non-module version (no MIME/type headaches)
(function(){
  function cssVar(name, value){ document.documentElement.style.setProperty(name, value); }
  function injectSides(){
    if(document.querySelector('.vine-side.left')) return;
    const l=document.createElement('div'); l.className='vine-side left';
    const r=document.createElement('div'); r.className='vine-side right';
    const tl=document.createElement('div'); tl.className='vine-corner tl';
    const tr=document.createElement('div'); tr.className='vine-corner tr';
    const bl=document.createElement('div'); bl.className='vine-corner bl';
    const br=document.createElement('div'); br.className='vine-corner br';
    document.body.append(l,r,tl,tr,bl,br);
  }
  function tagPanels(){ document.querySelectorAll('.panel').forEach(p=>p.classList.add('vined')); }

  window.enableVines = function enableVines(){
    const b=document.body; if(!b) return;
    b.classList.add('vines-enabled');
    injectSides(); tagPanels();
  };
  window.disableVines = function disableVines(){
    const b=document.body; if(!b) return;
    b.classList.remove('vines-enabled');
    document.querySelectorAll('.vine-side, .vine-corner').forEach(n=>n.remove());
    document.querySelectorAll('.panel.vined').forEach(p=> p.classList.remove('vined'));
  };

  // Optional auto-enable: comment out if you prefer manual call
  // enableVines();
})();