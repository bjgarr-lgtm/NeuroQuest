
import {S, save} from '../core/state.js';
export function shop(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML=`<h2>Shopping List</h2>
    <div class="section"><input id="txt" placeholder="Add item…"/><button id="add" class="btn">Add</button></div>
    <div id="list"></div>`;
  const draw=()=>{ const list=el.querySelector('#list'); list.innerHTML=''; (S.shop||[]).forEach((it,i)=>{ const r=document.createElement('div'); const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=it.done; chk.onchange=()=>{ it.done=chk.checked; save(); }; const s=document.createElement('span'); s.textContent=it.title; const x=document.createElement('button'); x.textContent='×'; x.className='btn danger'; x.onclick=()=>{ S.shop.splice(i,1); save(); draw(); }; r.append(chk,s,x); list.appendChild(r); }); };
  el.querySelector('#add').onclick=()=>{ const t=el.querySelector('#txt').value.trim(); if(t){ S.shop.push({title:t,done:false}); save(); draw(); el.querySelector('#txt').value=''; } };
  draw(); return el;
}
