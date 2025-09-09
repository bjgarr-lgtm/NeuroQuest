export function confetti(){
  const layer=document.getElementById('fxLayer');
  for(let i=0;i<40;i++){
    const s=document.createElement('div'); s.className='spark';
    s.style.left=(Math.random()*100)+'vw'; s.style.top='-10px';
    layer.appendChild(s);
    const dy= (60+Math.random()*60) + 'vh';
    s.animate([{transform:'translateY(0)'},{transform:'translateY('+dy+')'}], {duration:1400+Math.random()*600, easing:'cubic-bezier(.2,.8,.2,1)'})
      .onfinish=()=>s.remove();
  }
}

export function crownDrop(){
  const layer=document.getElementById('fxLayer');
  const c=document.createElement('div'); c.className='crown';
  c.textContent='👑';
  layer.appendChild(c);
  const cleanup=()=>{ c.remove(); };
  c.addEventListener('animationend', cleanup, {once:true});
  // safety
  setTimeout(cleanup, 1600);
}

export function cursorTrail(){
  const layer=document.getElementById('fxLayer');
  let last=0;
  window.addEventListener('pointermove', (e)=>{
    const now=performance.now(); if(now-last<20) return; last=now;
    const dot=document.createElement('div'); dot.className='spark';
    dot.style.left=e.clientX+'px'; dot.style.top=e.clientY+'px'; dot.style.opacity='.8';
    layer.appendChild(dot);
    dot.animate([{transform:'scale(1)'},{transform:'scale(0.1)', opacity:0}], {duration:500}).onfinish=()=>dot.remove();
  }, {passive:true});
}
