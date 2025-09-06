
import {S, save} from '../core/state.js';
export function coop(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML=`<h2>Co‑Op Mode <small class="tag">${S.toddler?'Toddler Week':'Solo Week'}</small></h2>
  <div class="section"><button id="toggle" class="btn">Toggle Week</button></div>`;
  el.querySelector('#toggle').onclick=()=>{ S.toddler=!S.toddler; save(); location.hash='#home'; };
  return el;
}
