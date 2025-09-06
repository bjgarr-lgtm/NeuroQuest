
import {S, save} from '../core/state.js';
const heroes=['hero-ash.png','hero-odin.png','hero-bambi.png','hero-fox.png'];
export function companion(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML='<h2>Choose Companions</h2>';
  const grid=document.createElement('div'); grid.className='grid two'; el.appendChild(grid);
  heroes.forEach(h=>{
    const b=document.createElement('button'); b.className='btn'; b.innerHTML='<img src="assets/'+h+'" style="height:80px">';
    b.onclick=()=>{
      const i=S.party.companions.indexOf(h);
      if(i>=0) S.party.companions.splice(i,1); else S.party.companions.push(h);
      save(); };
    grid.appendChild(b);
  });
  return el;
}
