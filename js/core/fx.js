
export function confetti(x=window.innerWidth/2, y=80, n=80){
  for(let i=0;i<n;i++){
    const d=document.createElement('div'); d.className='confetti';
    d.style.left=(x+ (Math.random()*200-100))+'px';
    d.style.top=(y+ (Math.random()*30-15))+'px';
    d.style.background = `hsl(${Math.random()*360},90%,60%)`;
    document.body.appendChild(d);
    const vy = - (Math.random()*3+2), vx = Math.random()*4-2, rot = Math.random()*360;
    let t=0; (function step(){
      t+=1; const el=d;
      const top = parseFloat(el.style.top); const left=parseFloat(el.style.left);
      el.style.top = (top - vy*2 + t*0.25)+'px';
      el.style.left = (left + vx*2)+'px'; el.style.transform='rotate('+((rot+t*12)%360)+'deg)';
      if(top<window.innerHeight) requestAnimationFrame(step); else el.remove();
    })();
  }
}
export function crownDrop(x=window.innerWidth/2){
  const img = document.createElement('img'); img.src='assets/crown.svg'; img.style.position='fixed';
  img.style.width='120px'; img.style.left=(x-60)+'px'; img.style.top='-140px'; img.style.zIndex='1000';
  document.body.appendChild(img); let y=-140, vy=4; (function step(){ y+=vy; vy+=0.5; if(y>120){ vy*=-0.6; y=120; } img.style.top=y+'px'; if(vy>1||y<window.innerHeight-200) requestAnimationFrame(step); else setTimeout(()=>img.remove(),900); })();
}
export function cursorTrail(){
  document.addEventListener('mousemove', (e)=>{
    const d=document.createElement('div'); d.className='trail-dot'; d.style.left=e.clientX+'px'; d.style.top=e.clientY+'px'; document.body.appendChild(d);
    setTimeout(()=>d.remove(), 600);
  });
}
