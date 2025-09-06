
import {S, save, addXP, addGold} from '../core/state.js';
import {confetti, crownDrop} from '../core/fx.js';
export function clean(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML=`<h2>Cleaning Dungeon</h2>
  <div class="grid three">
    <div class="section"><h3>Small Quests</h3><div id="small"></div><div><input id="smalltxt" placeholder="Add…"/><button id="addSmall" class="btn">Add</button></div></div>
    <div class="section"><h3>Weekly Boss</h3>
      <div>Boss: <input id="bossName" value="${S.clean.boss.name}"/></div>
      <div style="margin:6px 0"><div class="xp" style="width:100%"><div id="prog" style="height:8px;background:#f6c;width:${S.clean.boss.progress}%"></div></div></div>
      <button id="tick" class="btn">+10%</button>
    </div>
    <div class="section"><h3>Monthly Raid</h3>
      <div>Week ${S.clean.raid.week} — <input id="raidName" value="${S.clean.raid.name}"/></div>
      <button id="raidWin" class="btn">Complete raid</button>
    </div>
  </div>`;
  const drawSmall=()=>{ const box=el.querySelector('#small'); box.innerHTML=''; (S.clean.small||[]).forEach((t,i)=>{ const r=document.createElement('div'); r.textContent=t; const x=document.createElement('button'); x.textContent='×'; x.className='btn danger'; x.onclick=()=>{S.clean.small.splice(i,1); save(); drawSmall();}; box.appendChild(r); box.appendChild(x); }); };
  drawSmall();
  el.querySelector('#addSmall').onclick=()=>{ const t=el.querySelector('#smalltxt').value.trim(); if(t){ (S.clean.small||=[]).push(t); save(); drawSmall(); el.querySelector('#smalltxt').value=''; } };
  el.querySelector('#bossName').onchange=(e)=>{ S.clean.boss.name=e.target.value; save(); };
  el.querySelector('#raidName').onchange=(e)=>{ S.clean.raid.name=e.target.value; save(); };
  el.querySelector('#tick').onclick=()=>{ S.clean.boss.progress=Math.min(100,(S.clean.boss.progress||0)+10); addXP(5); addGold(1); save(); el.querySelector('#prog').style.width=S.clean.boss.progress+'%'; confetti(); if(S.clean.boss.progress===100) crownDrop(); };
  el.querySelector('#raidWin').onclick=()=>{ S.clean.raid.week=(S.clean.raid.week%4)+1; addGold(3); addXP(20); save(); confetti(); };
  return el;
}
