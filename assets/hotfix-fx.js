/* FX helpers (confetti, crown drop, cursor trail) */
(function(){
  const FX = {};
  FX.confetti = (parent=document.body, n=120) => {
    const box = document.createElement('div');
    box.style.position='fixed'; box.style.left='0'; box.style.top='0'; box.style.width='100%'; box.style.height='100%'; box.style.pointerEvents='none'; box.style.overflow='hidden'; box.style.zIndex='9999';
    parent.appendChild(box);
    for(let i=0;i<n;i++){
      const s = document.createElement('div');
      const size = 4 + Math.random()*6;
      s.style.position='absolute';
      s.style.left = (Math.random()*100)+'%';
      s.style.top = (-10 - Math.random()*20)+'px';
      s.style.width = size+'px'; s.style.height=size+'px';
      s.style.background = `hsl(${Math.random()*360},100%,60%)`;
      s.style.opacity='0.9';
      s.style.transform = `rotate(${Math.random()*360}deg)`;
      s.style.borderRadius = (Math.random()<0.3?'50%':'2px');
      box.appendChild(s);
      const dur = 1200 + Math.random()*1400;
      const dx = (Math.random()*2-1)*80;
      const rot = (Math.random()*720-360);
      s.animate([
        {transform:`translate(0,0) rotate(0deg)`},
        {transform:`translate(${dx}px, 110vh) rotate(${rot}deg)`}
      ], {duration: dur, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards'});
      setTimeout(()=>s.remove(), dur+100);
    }
    setTimeout(()=>box.remove(), 2800);
  };
  FX.crown = (parent=document.body) => {
    const el = document.createElement('div');
    el.textContent='👑'; el.style.position='fixed'; el.style.left='50%'; el.style.top='-80px';
    el.style.fontSize='64px'; el.style.transform='translateX(-50%)';
    el.style.zIndex='9999'; el.style.pointerEvents='none';
    parent.appendChild(el);
    el.animate([{transform:'translate(-50%,-80px)'},{transform:'translate(-50%,40vh)'}],{duration:900, easing:'ease-out'});
    setTimeout(()=>{ el.animate([{opacity:1},{opacity:0}],{duration:500}); setTimeout(()=>el.remove(),520); }, 1000);
  };
  // cursor trail
  let trailOn = false; let last = 0;
  FX.cursorTrail = (on=true) => {
    trailOn = on;
  };
  window.addEventListener('pointermove', (e)=>{
    if (!trailOn) return;
    const now = performance.now(); if (now - last < 18) return; last = now;
    const dot = document.createElement('div');
    dot.style.position='fixed'; dot.style.left=(e.clientX-2)+'px'; dot.style.top=(e.clientY-2)+'px';
    dot.style.width='6px'; dot.style.height='6px'; dot.style.borderRadius='50%';
    dot.style.background=`hsl(${(e.clientX+e.clientY)%360},100%,70%)`; dot.style.pointerEvents='none';
    dot.style.zIndex='9998'; document.body.appendChild(dot);
    dot.animate([{transform:'scale(1)', opacity:1},{transform:'scale(0)', opacity:0}],{duration:500, easing:'ease-out'});
    setTimeout(()=>dot.remove(),520);
  });
  window.SB_FX = FX;
  // enable by default
  FX.cursorTrail(true);
})();