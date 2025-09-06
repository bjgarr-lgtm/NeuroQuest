
import {S, save} from '../core/state.js';
export function journal(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML=`<h2>Journal</h2>
  <div class="section"><label>Prompt <select id="p"></select></label></div>
  <textarea id="t" rows="6" style="width:100%" placeholder="Let it out…"></textarea>
  <div><button id="save" class="btn">Save</button></div>
  <h3>Recent</h3><div id="list"></div>`;
  const p=el.querySelector('#p'); S.journal.prompts.forEach(x=>{ const o=document.createElement('option'); o.textContent=x; p.appendChild(o); });
  const draw=()=>{ el.querySelector('#list').innerHTML = (S.journal.entries||[]).slice(-8).reverse().map(e=>`<div>${new Date(e.d).toLocaleString()} — ${e.t}</div>`).join(''); };
  el.querySelector('#save').onclick=()=>{ const t=el.querySelector('#t').value.trim(); if(t){ (S.journal.entries||=[]).push({d:Date.now(),t}); save(); el.querySelector('#t').value=''; draw(); } };
  draw(); return el;
}
