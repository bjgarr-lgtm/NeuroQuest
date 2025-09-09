import {load, save} from '../util/storage.js';
import {confetti, crownDrop} from '../ui/fx.js';

import {addGold, addXP} from '../util/game.js';
export default function renderQuests(root){
  const s=load();
  s.quests.main ??= []; s.quests.side ??= []; s.quests.bonus ??= [];
  s.quests.boss ??= {name:'Bathroom', progress:0};
  s.quests.raid ??= {week:1, title:'Deep Clean', progress:0};

  root.innerHTML = `
    <h2>Quest + Clean</h2>
    <section class="grid three">
      <div class="panel">
        <h3>Main Quests</h3>
        <div id="main"></div>
        <div class="row"><input id="addMain" placeholder="Add main quest"><button id="btnMain" class="primary">Add</button></div>
      </div>
      <div class="panel">
        <h3>Side Quests</h3>
        <div id="side"></div>
        <div class="row"><input id="addSide" placeholder="Add side quest"><button id="btnSide" class="primary">Add</button></div>
      </div>
      <div class="panel">
        <h3>Bonus Loot</h3>
        <div id="bonus"></div>
        <div class="row"><input id="addBonus" placeholder="Add bonus quest"><button id="btnBonus" class="primary">Add</button></div>
      </div>
    </section>

    <section class="grid two">
      <div class="panel">
        <h3>Weekly Boss</h3>
        <div class="row"><span>Boss:</span><input id="bossName"></div>
        <div class="row"><span>Progress</span><div class="bar" style="flex:1"><div id="bossProg" class="bar" style="height:8px; background:linear-gradient(90deg,#7cf,#e7a7ff)"></div></div></div>
        <div class="row"><button id="bossTick" class="secondary">+10%</button></div>
      </div>
      <div class="panel">
        <h3>Monthly Raid</h3>
        <div>Week ${s.quests.raid.week} — ${s.quests.raid.title}</div>
      </div>
    </section>
  `;

  const lists=[['main','main'],['side','side'],['bonus','bonus']];
  function draw(){
    lists.forEach(([key,id])=>{
      const el=document.getElementById(id);
      el.innerHTML='';
      (s.quests[key]||[]).forEach((q,i)=>{
        const row=document.createElement('div'); row.className='row';
        const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=!!q.done;
        chk.onchange=()=>{ q.done=chk.checked; if(q.done){ s.xp=(s.xp||0)+10; s.gold=(s.gold||0)+1; confetti(); } save(s); draw(); };
        const t=document.createElement('span'); t.textContent=q.title;
        const rm=document.createElement('button'); rm.className='danger'; rm.textContent='✕'; rm.onclick=()=>{ s.quests[key].splice(i,1); save(s); draw(); };
        row.append(chk,t,rm); el.appendChild(row);
      });
    });
    // boss
    document.getElementById('bossName').value=s.quests.boss.name;
    const p=Math.max(0,Math.min(100, s.quests.boss.progress||0));
    document.getElementById('bossProg').style.width=p+'%';
    // HUD
    document.getElementById('hudGold').textContent='🪙 '+(s.gold||0);
    document.getElementById('hudXp').style.width=((s.xp||0)%100)+'%';
    document.getElementById('hudLevel').textContent='Lv '+(s.level||1);
  }
  draw();

  document.getElementById('btnMain').onclick=()=>{ const v=document.getElementById('addMain').value.trim(); if(!v) return; s.quests.main.push({title:v,done:false}); save(s); draw(); };
  document.getElementById('btnSide').onclick=()=>{ const v=document.getElementById('addSide').value.trim(); if(!v) return; s.quests.side.push({title:v,done:false}); save(s); draw(); };
  document.getElementById('btnBonus').onclick=()=>{ const v=document.getElementById('addBonus').value.trim(); if(!v) return; s.quests.bonus.push({title:v,done:false}); save(s); draw(); };

  document.getElementById('bossName').oninput=(e)=>{ s.quests.boss.name=e.target.value; save(s); };
  document.getElementById('bossTick').onclick=()=>{ s.quests.boss.progress=Math.min(100,(s.quests.boss.progress||0)+10); save(s); draw(); crownDrop(); };
}

// Rewards + progress wiring
(function(){
  // Delegate checkbox clicks for main/side/bonus
  document.addEventListener('click', (e)=>{
    const el = e.target;
    if(!(el instanceof HTMLInputElement)) return;
    if(el.type!=='checkbox') return;
    // classify by container heading
    const col = el.closest('.panel'); if(!col) return;
    const h = (col.querySelector('h3')?.textContent||'').toLowerCase();
    if(!el.checked) return;
    if(h.includes('main')){ addGold(2); addXP(12); }
    else if(h.includes('side')){ addGold(1); addXP(8); }
    else if(h.includes('bonus')){ addGold(1); addXP(6); }
  }, {capture:true});
})(); 

(function(){
  const BOSSES=['Laundry Mountain','Inbox Hydra','Dishes Dragon','Bathroom Behemoth','Paperwork Lich','Floor Goblins','Car Gremlin'];
  const RAIDS=['Whole-House Blitz','Garage Purge','Yard Recon','Pantry Reset','Closet Siege','Deep Fridge Dive','Budget Reforging'];
  function suggestBoss(){ return BOSSES[Math.floor(Math.random()*BOSSES.length)] }
  function suggestRaid(){ return RAIDS[Math.floor(Math.random()*RAIDS.length)] }
  const bossBtn = document.getElementById('bossTick');
  const bossName = document.getElementById('bossName');
  const raidBtn = document.getElementById('raidTick') || document.querySelector('button[data-raid]');
  const raidTitle = document.getElementById('raidTitle') || document.querySelector('#raid input, #raidTitle');
  function fireConfetti(n=4){ import('../ui/fx.js').then(m=>{ for(let i=0;i<n;i++) setTimeout(m.confetti, i*120); }); }
  if(bossBtn){ bossBtn.addEventListener('click',()=>{
    const s = JSON.parse(localStorage.getItem('sb_v26_state')||'{}');
    const cur = (s.quests?.boss?.progress||0);
    const next = Math.min(cur+10,100);
    if(next>=100){
      // reset and celebrate
      s.quests.boss.progress = 0;
      s.quests.boss.name = suggestBoss();
      localStorage.setItem('sb_v26_state', JSON.stringify(s));
      import('../ui/fx.js').then(m=>{ for(let i=0;i<5;i++) setTimeout(m.crownDrop, i*100); });
      fireConfetti(4);
    }
  }, {capture:true}); }
  if(raidBtn){ raidBtn.addEventListener('click',()=>{
    const s = JSON.parse(localStorage.getItem('sb_v26_state')||'{}');
    s.quests = s.quests||{}; const r=s.quests.raid || (s.quests.raid={week:1,title:'Deep Clean',progress:0});
    const next = Math.min((r.progress||0)+10,100);
    if(next>=100){
      r.progress = 0; r.title = suggestRaid();
      localStorage.setItem('sb_v26_state', JSON.stringify(s));
      import('../ui/fx.js').then(m=>{ for(let i=0;i<10;i++) setTimeout(m.crownDrop, i*80); });
      fireConfetti(6);
    }
  }, {capture:true}); }
})();
