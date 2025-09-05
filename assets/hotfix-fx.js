/* FX helpers (confetti, crown drop, cursor trail) — v4 */
(function(){
  const FX = {};
  FX.confetti = (parent=document.body, n=150) => {
    const box = document.createElement('div');
    Object.assign(box.style, {position:'fixed',left:0,top:0,width:'100%',height:'100%',pointerEvents:'none',overflow:'hidden',zIndex:9999});
    parent.appendChild(box);
    for(let i=0;i<n;i++){
      const s = document.createElement('div');
      const size = 4 + Math.random()*6;
      Object.assign(s.style, {position:'absolute',left:(Math.random()*100)+'%', top:(-10 - Math.random()*20)+'px',
        width:size+'px',height:size+'px',background:`hsl(${Math.random()*360},100%,60%)`,opacity:.9,borderRadius:(Math.random()<.3?'50%':'2px')});
      box.appendChild(s);
      const dur = 1200 + Math.random()*1400;
      const dx = (Math.random()*2-1)*80;
      const rot = (Math.random()*720-360);
      s.animate([{transform:`translate(0,0) rotate(0deg)`},{transform:`translate(${dx}px, 110vh) rotate(${rot}deg)`}], {duration: dur, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards'});
      setTimeout(()=>s.remove(), dur+120);
    }
    setTimeout(()=>box.remove(), 3000);
  };
  FX.crown = (parent=document.body, emoji='👑', ms=1400) => {
    const el = document.createElement('div');
    el.textContent=emoji;
    Object.assign(el.style, {position:'fixed', left:'50%', top:'-80px', fontSize:'64px', transform:'translateX(-50%)', zIndex:9999, pointerEvents:'none'});
    parent.appendChild(el);
    el.animate([{transform:'translate(-50%,-80px)'},{transform:'translate(-50%,35vh)'}],{duration:ms*0.6,easing:'ease-out'});
    setTimeout(()=>{ el.animate([{opacity:1},{opacity:0}],{duration:ms*0.3}); setTimeout(()=>el.remove(),ms*0.35); }, ms*0.65);
  };
  // cursor trail (enabled by default)
  let trailOn = true, last = 0;
  FX.cursorTrail = (on=true)=>{ trailOn = on; };
  window.addEventListener('pointermove', (e)=>{
    if (!trailOn) return;
    const now = performance.now(); if (now - last < 18) return; last = now;
    const dot = document.createElement('div');
    Object.assign(dot.style, {position:'fixed', left:(e.clientX-2)+'px', top:(e.clientY-2)+'px', width:'6px', height:'6px',
      borderRadius:'50%', background:`hsl(${(e.clientX+e.clientY)%360},100%,70%)`, pointerEvents:'none', zIndex:9998});
    document.body.appendChild(dot);
    dot.animate([{transform:'scale(1)', opacity:1},{transform:'scale(0)', opacity:0}],{duration:500,easing:'ease-out'});
    setTimeout(()=>dot.remove(),520);
  });
  window.SB_FX = FX;
})();