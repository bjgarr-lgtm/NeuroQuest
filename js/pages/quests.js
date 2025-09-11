import {load, save} from '../util/storage.js';
import {logAction} from '../util/game.js';
import {confetti, crownDrop} from '../ui/fx.js';

export default function renderQuests(root){
  // ===== Tunables =====
  const CROWN_DELAY = 450;        // ms between crown drops (boss/raid) – tweak if too fast/slow
  const CROWN_SCALE_MULT = 4;     // 4× larger crowns
  const MAIN_GOLD = 2;            // main quest reward
  const SIDE_GOLD = 1;            // side/bonus reward
  const QUEST_XP = 10;            // per-quest XP

  // ===== Suggestions =====
  const bossIdeas=['Fridge scrub','Car wash','Paper declutter','Laundry mountain','Closet reset','Desk zen','Windows shine','Bathroom reset','Yard sweep'];
  const raidIdeas=['Whole-house reset','Garage purge','Paperwork marathon','Kitchen deep-clean month','Laundry overhaul','Toy rotation & donate','Digital declutter month'];
  const suggest=(arr)=>arr[Math.floor(Math.random()*arr.length)];

  // Make the most recent crowns bigger without assuming fx.js signature
  const scaleRecentCrowns=(mult=CROWN_SCALE_MULT)=>{
    try{ [...document.querySelectorAll('.crown')].slice(-40).forEach(n=>n.style.fontSize=(36*mult)+'px'); }catch(e){}
  };

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
        <div class="row"><button id="bossSuggest" class="tiny">Suggest</button></div>
        <div class="row">
          <span>Progress</span>
          <div class="bar" style="flex:1"><div id="bossProg" style="height:10px;background:linear-gradient(90deg,#7cf,#e7a7ff)"></div></div>
        </div>
        <div class="row"><button id="bossTick" class="secondary">+10%</button></div>
      </div>
      <div class="panel">
        <h3>Monthly Raid</h3>
        <div class="row"><span>Week</span><input id="raidWeek" type="number" min="1" style="width:80px"></div>
        <div class="row"><span>Title</span><input id="raidTitle"></div>
        <div class="row"><button id="raidSuggest" class="tiny">Suggest</button></div>
        <div class="row">
          <span>Progress</span>
          <div class="bar" style="flex:1"><div id="raidProg" style="height:10px;background:linear-gradient(90deg,#fc7,#ff7)"></div></div>
        </div>
        <div class="row"><button id="raidTick" class="secondary">+10%</button></div>
      </div>
    </section>
  `;

  const lists=[['main','main'],['side','side'],['bonus','bonus']];

  function draw(){
    // render quest lists
    lists.forEach(([key,id])=>{
      const el=document.getElementById(id);
      el.innerHTML='';
      (s.quests[key]||[]).forEach((q,i)=>{
        const row=document.createElement('div'); row.className='row';
        const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=!!q.done;
        chk.onchange=()=>{
          q.done=chk.checked;
          if(q.done){
            // award: 2g main, 1g side/bonus (+10xp)
            try{
              if (window.NQ){
                window.NQ.addGold(key==='main'?MAIN_GOLD:SIDE_GOLD);
                window.NQ.addXP(QUEST_XP);
              }else{
                s.gold=(s.gold||0)+(key==='main'?MAIN_GOLD:SIDE_GOLD);
                s.xp=(s.xp||0)+QUEST_XP;
              }
            }catch(e){}
            confetti();
          }
          save(s); draw();
        };
        const t=document.createElement('span'); t.textContent=q.title;
        const rm=document.createElement('button'); rm.className='danger'; rm.textContent='✕';
        rm.onclick=()=>{ s.quests[key].splice(i,1); save(s); draw(); };
        row.append(chk,t,rm); el.appendChild(row);
      });
    });

    // weekly boss
    document.getElementById('bossName').value=s.quests.boss.name;
    const p=Math.max(0,Math.min(100, s.quests.boss.progress||0));
    document.getElementById('bossProg').style.width=p+'%';

    // monthly raid
    document.getElementById('raidWeek').value = s.quests.raid.week||1;
    document.getElementById('raidTitle').value = s.quests.raid.title||'';
    const rp = Math.max(0,Math.min(100, s.quests.raid.progress||0));
    document.getElementById('raidProg').style.width=rp+'%';

    // HUD
    const g=document.getElementById('hudGold'); if(g) g.textContent='🪙 '+(s.gold||0);
    const xp=document.getElementById('hudXp'); if(xp) xp.style.width=((s.xp||0)%100)+'%';
    const lvl=document.getElementById('hudLevel'); if(lvl) lvl.textContent='Lv '+(s.level||1);
  }
  draw();

  // add quest buttons
  document.getElementById('btnMain').onclick=()=>{
    const v=document.getElementById('addMain').value.trim(); if(!v) return;
    s.quests.main.push({title:v,done:false}); save(s); draw();
  };
  document.getElementById('btnSide').onclick=()=>{
    const v=document.getElementById('addSide').value.trim(); if(!v) return;
    s.quests.side.push({title:v,done:false}); save(s); draw();
  };
  document.getElementById('btnBonus').onclick=()=>{
    const v=document.getElementById('addBonus').value.trim(); if(!v) return;
    s.quests.bonus.push({title:v,done:false}); save(s); draw();
  };

  // weekly boss handlers
  document.getElementById('bossName').oninput=(e)=>{ s.quests.boss.name=e.target.value; save(s); };
  document.getElementById('bossSuggest').onclick=()=>{ s.quests.boss.name=suggest(bossIdeas); save(s); draw(); };
  document.getElementById('bossTick').onclick=()=>{
    s.quests.boss.progress=Math.min(100,(s.quests.boss.progress||0)+10);
    save(s); draw();
    crownDrop(); scaleRecentCrowns(CROWN_SCALE_MULT);
    if(s.quests.boss.progress>=100){
      // 5 crowns + 4 confetti, then roll a new boss and reset progress
      for(let i=0;i<5;i++) setTimeout(()=>{ crownDrop(); scaleRecentCrowns(CROWN_SCALE_MULT); }, i*CROWN_DELAY);
      for(let k=0;k<4;k++) setTimeout(()=>confetti(), k*200);
      s.quests.boss={name:suggest(bossIdeas), progress:0}; save(s); draw();
    }
  };

  // monthly raid handlers
  document.getElementById('raidWeek').oninput=(e)=>{ s.quests.raid.week=Math.max(1, parseInt(e.target.value||'1')); save(s); };
  document.getElementById('raidTitle').oninput=(e)=>{ s.quests.raid.title=e.target.value; save(s); };
  document.getElementById('raidSuggest').onclick=()=>{ s.quests.raid.title=suggest(raidIdeas); save(s); draw(); };
  document.getElementById('raidTick').onclick=()=>{
    s.quests.raid.progress=Math.min(100,(s.quests.raid.progress||0)+10);
    save(s); draw();
    // 3 crowns per click
    for(let i=0;i<3;i++) setTimeout(()=>{ crownDrop(); scaleRecentCrowns(CROWN_SCALE_MULT); }, i*CROWN_DELAY);
    if(s.quests.raid.progress>=100){
      // 10 crowns + 4 confetti, then recommend a new raid, reset to week 1
      for(let i=0;i<10;i++) setTimeout(()=>{ crownDrop(); scaleRecentCrowns(CROWN_SCALE_MULT); }, i*CROWN_DELAY);
      for(let k=0;k<4;k++) setTimeout(()=>confetti(), k*200);
      s.quests.raid={week:1, title:suggest(raidIdeas), progress:0}; save(s); draw();
    }
  };
}
