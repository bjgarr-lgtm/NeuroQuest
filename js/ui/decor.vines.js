
// === decor.vines.js ===
// Call enableVines() once to apply 8-bit vines/moss around the app.
// Call disableVines() to remove.

export function enableVines(){
  const b=document.body;
  if(!b) return;
  b.classList.add('vines-enabled');
  // inject side strips if not present
  if(!document.querySelector('.vine-side.left')){
    const l=document.createElement('div'); l.className='vine-side left';
    const r=document.createElement('div'); r.className='vine-side right';
    const tl=document.createElement('div'); tl.className='vine-corner tl';
    const tr=document.createElement('div'); tr.className='vine-corner tr';
    const bl=document.createElement('div'); bl.className='vine-corner bl';
    const br=document.createElement('div'); br.className='vine-corner br';
    document.body.append(l,r,tl,tr,bl,br);
  }
  // tag existing panels so inner border-image applies
  document.querySelectorAll('.panel').forEach(p=> p.classList.add('vined'));
}

export function disableVines(){
  const b=document.body;
  if(!b) return;
  b.classList.remove('vines-enabled');
  document.querySelectorAll('.vine-side, .vine-corner').forEach(n=>n.remove());
  document.querySelectorAll('.panel.vined').forEach(p=> p.classList.remove('vined'));
}

// Auto-enable once if you want immediate effect
// enableVines();
