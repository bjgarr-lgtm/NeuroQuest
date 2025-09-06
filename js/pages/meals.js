
import {S, save} from '../core/state.js';
export function meals(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML='<h2>Meal Planner</h2>';
  const grid=document.createElement('div'); grid.className='grid three';
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  days.forEach((d,i)=>{
    const card=document.createElement('div'); card.className='section';
    card.innerHTML='<h3>'+d+'</h3>';
    ['breakfast','lunch','dinner'].forEach(meal=>{
      const ta=document.createElement('textarea'); ta.value=S.meals.grid[i][meal]||meal; ta.onchange=()=>{ S.meals.grid[i][meal]=ta.value; save(); };
      ta.rows=2; ta.style.width='100%'; card.appendChild(ta);
    });
    grid.appendChild(card);
  });
  el.appendChild(grid); return el;
}
