
import {S, save} from '../core/state.js';
export function checkin(){
  const el=document.createElement('section'); el.className='section';
  const moods=[['awful','😖'],['bad','☹️'],['ok','😐'],['good','🙂'],['great','🤩']];
  el.innerHTML='<h2>Mood Check‑In</h2><div id="m" style="display:flex;gap:8px"></div><div class="section"><input id="tags" placeholder="tags…"><textarea id="notes" rows="3" style="width:100%"></textarea><button id="save" class="btn">Save check‑in</button></div><div id="list"></div>';
  const m=el.querySelector('#m'); moods.forEach(([k,em])=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=em; b.onclick=()=>{ el.dataset.mood=k; }; m.appendChild(b); });
  el.querySelector('#save').onclick=()=>{ const mood=el.dataset.mood||'ok', tags=el.querySelector('#tags').value, notes=el.querySelector('#notes').value; (S.moods||=[]).push({d:Date.now(),mood,tags,notes}); save(); draw(); };
  function draw(){ el.querySelector('#list').innerHTML=(S.moods||[]).slice(-10).reverse().map(x=>`<div>${new Date(x.d).toLocaleString()} — ${x.mood} — ${x.tags}</div>`).join(''); }
  draw(); return el;
}
