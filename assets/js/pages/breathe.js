export async function init(root,S,update){
  root.innerHTML=`<section class="cardish"><h2 class="dash">1‑Minute Breathe</h2>
    <div class="breathe-stage">
      <div class="b-circle" id="circle"><div class="inner"></div></div>
      <div class="phase" id="phase">Ready</div>
    </div></section>`;
  const c=root.querySelector('#circle'), phase=root.querySelector('#phase'); let t=null, step=0;
  function setPhase(i){ const names=['Inhale','Hold','Exhale','Hold']; phase.textContent=names[i%4]; }
  function animate(){
    step=(step+1)%360; c.style.background=`conic-gradient(hsl(${step},90%,60%), hsl(${(step+180)%360},90%,60%))`; 
    t=requestAnimationFrame(animate);
  }
  c.onclick=()=>{ if(t){cancelAnimationFrame(t);t=null;phase.textContent='Ready';} else { setPhase(0); animate(); let k=0; const timer=setInterval(()=>{k++; setPhase(k); if(!t){clearInterval(timer);} },4000); } };
}
