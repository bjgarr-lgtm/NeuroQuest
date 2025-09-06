
import {S} from '../core/state.js';
export function breathe(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML=`<h2>1‑Minute Breathe</h2>
  <div class="breathe-stage">
    <div id="breathCircle"></div>
    <div id="phase" class="phase">Ready</div>
  </div>`;
  const circle=el.querySelector('#breathCircle'); const phase=el.querySelector('#phase');
  const seq=[['Inhale',4],['Hold',4],['Exhale',4],['Hold',4]];
  let t=null, i=0; function run(){ const [p,d]=seq[i%seq.length]; phase.textContent=p; circle.style.borderColor='rgba(255,255,255,.2)'; circle.style.boxShadow='0 0 0 10px rgba(124,252,255,.1) inset'; t=setTimeout(()=>{i++; run();}, d*1000); }
  circle.onclick=()=>{ if(t){ clearTimeout(t); t=null; phase.textContent='Paused'; } else { i=0; run(); } };
  return el;
}
