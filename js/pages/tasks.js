
import {S, save, addXP, addGold} from '../core/state.js';
import {confetti} from '../core/fx.js';

export function tasks(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML=`<h2>Daily Quest Board</h2>
  <div class="grid three">
    <div><h3>Main</h3><div id="main"></div></div>
    <div><h3>Side</h3><div id="side"></div></div>
    <div><h3>Bonus</h3><div id="bonus"></div></div>
  </div>
  <div class="section"><input id="title" placeholder="Add a quest…"/><select id="tier"><option>main</option><option>side</option><option>bonus</option></select>
  <button id="add" class="btn">Add</button></div>`;
  const draw=()=>['main','side','bonus'].forEach(k=>{
    const box=el.querySelector('#'+k); box.innerHTML='';
    (S.tasks[k]||[]).forEach((t,i)=>{
      const r=document.createElement('div'); r.style.display='flex'; r.style.gap='8px'; r.style.alignItems='center';
      const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=!!t.done; chk.onchange=()=>{ t.done=chk.checked; if(t.done){ addXP(10); addGold(1); confetti(); } save(); draw(); };
      const span=document.createElement('span'); span.textContent=t.title;
      const del=document.createElement('button'); del.textContent='×'; del.className='btn danger'; del.onclick=()=>{ S.tasks[k].splice(i,1); save(); draw(); };
      r.append(chk,span,del); box.appendChild(r);
    });
  });
  el.querySelector('#add').onclick=()=>{
    const title=el.querySelector('#title').value.trim(); const tier=el.querySelector('#tier').value;
    if(title){ (S.tasks[tier] ||= []).push({title,done:false}); save(); el.querySelector('#title').value=''; draw(); }
  };
  draw(); return el;
}
