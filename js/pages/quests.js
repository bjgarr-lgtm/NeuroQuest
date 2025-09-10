import {load, save} from '../util/storage.js';
import {logAction} from '../util/game.js';
import {confetti, crownDrop} from '../ui/fx.js';


function award(s, {xp=0,gold=0}={}){ s.xp=(s.xp||0)+xp; s.gold=(s.gold||0)+gold; }

function ensureAch(s){ s.ach = s.ach || {}; return s.ach; }

function checkMetaAchievements(s){
  const ach = ensureAch(s);
  // First quest complete
  if(!ach.firstQuest){
    const anyDone = [...(s.quests.main||[]),(s.quests.side||[]),(s.quests.bonus||[])].flat().some(q=>q && q.done);
    if(anyDone){ ach.firstQuest = dt(); award(s,{xp:25,gold:5}); toast('🏅 First quest complete! +25xp +5g'); }
  }
  // Three journal entries
  if(!ach.journal3 && (s.journal?.entries?.length||0) >= 3){
    ach.journal3 = dt(); award(s,{xp:30,gold:5}); toast('📓 Journals x3! +30xp +5g');
  }
  // Hydrate streak (example)
  if(!ach.hydrate5 && (s.tokens||[]).filter(t=>t.type==='hydrate').length>=5){
    ach.hydrate5 = dt(); award(s,{xp:15,gold:3}); toast('💧 Hydrate x5! +15xp +3g');
  }
}

function dt(){ try{ return new Date().toISOString(); }catch(e){ return '' } }

function toast(msg){
  try{
    let t=document.getElementById('nq-toast'); if(!t){ t=document.createElement('div'); t.id='nq-toast'; t.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#111a;border:1px solid #fff3;padding:8px 12px;border-radius:12px;backdrop-filter: blur(6px);z-index:9999;font-size:14px'; document.body.appendChild(t); }
    t.textContent=msg; t.style.opacity='1'; setTimeout(()=>t.style.opacity='0', 1800);
  }catch(e){}
}

// === PATCH v1: Auto-claim + meta trackers + quick-add templates ===
export default function renderQuests(root){
  const bossIdeas=['Fridge scrub','Car wash','Paper declutter','Laundry mountain','Closet reset','Desk zen','Windows shine','Bathroom reset','Yard sweep'];
  const raidIdeas=['Whole-house reset','Garage purge','Paperwork marathon','Kitchen deep-clean month','Laundry overhaul','Toy rotation & donate','Digital declutter month'];
  const suggest=(arr)=>arr[Math.floor(Math.random()*arr.length)];
  function scaleRecentCrowns(mult=4){ const nodes=[...document.querySelectorAll('.crown')]; nodes.slice(-12).forEach(n=>{ n.style.fontSize=''+(36*mult)+'px'; }); }

  const s=load();
  s.quests.main ??= []; s.quests.side ??= []; s.quests.bonus ??= [];
  s.quests.boss ??= {name:'Bathroom', progress:0};
  s.quests.raid ??= {week:1, title:'Deep Clean', progress:0};

  root.innerHTML = `
    <h2>Quest + Clean</h2>
    <section class="grid three">
      <div class="panel">
        <h3>Main Quests</h3><div class='mini-tools'><button class='tiny' id='addDailySet'>+ Daily set</button><button class='tiny' id='addWeeklySet'>+ Weekly set</button></div>
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
        <div class="row"><span>Progress</span><div class="bar" style="flex:1"><div id="bossProg" style="height:10px;background:linear-gradient(90deg,#7cf,#e7a7ff)"></div></div></div>
        <div class="row"><button id="bossTick" class="secondary">+10%</button></div>
      </div>
      <div class="panel">
        <h3>Monthly Raid</h3>
        <div class="row"><span>Week</span><input id="raidWeek" type="number" min="1" style="width:80px"></div>
        <div class="row"><span>Title</span><input id="raidTitle"></div>
        <div class="row"><button id="raidSuggest" class="tiny">Suggest</button></div>
        <div class="row"><span>Progress</span><div class="bar" style="flex:1"><div id="raidProg" style="height:10px;background:linear-gradient(90deg,#7cf,#e7a7ff)"></div></div></div>
        <div class="row"><button id="raidTick" class="secondary">+10%</button></div>
      </div>
    </section>
  
        <h3>Monthly Raid</h3>
        <div class='row'><span>Week</span><input id='raidWeek' type='number' style='width:50px'></div><div class='row'><span>Title</span><input id='raidTitle'></div><div class='row'><span>Progress</span><div class='bar' style='flex:1'><div id='raidProg' class='bar' style='height:8px; background:linear-gradient(90deg,#fc7,#ff7)'></div></div></div><div class='row'><button id='raidTick' class='secondary'>+10%</button></div>
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
        chk.onchange=()=>{ q.done=chk.checked; if(q.done){ s.xp=(s.xp||0)+10; s.gold=(s.gold||0)+2; // main default confetti(); } save(s); draw(); };
        const t=document.createElement('span'); t.textContent=q.title;
        const rm=document.createElement('button'); rm.className='danger'; rm.textContent='✕'; rm.onclick=()=>{ s.quests[key].splice(i,1); save(s); draw(); };
        row.append(chk,t,rm); el.appendChild(row);
      });
    });
        // boss
    document.getElementById('bossName').value=s.quests.boss.name;
    const p=Math.max(0,Math.min(100, s.quests.boss.progress||0));
    document.getElementById('bossProg').style.width=p+'%';
    // raid
    document.getElementById('raidWeek').value = s.quests.raid.week||1;
    document.getElementById('raidTitle').value = s.quests.raid.title||'';
    const rp = Math.max(0,Math.min(100, s.quests.raid.progress||0));
    document.getElementById('raidProg').style.width=rp+'%';
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
document.getElementById('bossSuggest').onclick=()=>{ s.quests.boss.name=suggest(bossIdeas); save(s); draw(); };
document.getElementById('bossTick').onclick=()=>{
  s.quests.boss.progress=Math.min(100,(s.quests.boss.progress||0)+10);
  save(s); draw(); crownDrop(); scaleRecentCrowns(4);
  if(s.quests.boss.progress>=100){
    for(let i=0;i<5;i++) setTimeout(()=>{ crownDrop(); scaleRecentCrowns(4); }, i*120);
    for(let k=0;k<4;k++) setTimeout(()=>confetti(), k*200);
    s.quests.boss={name:suggest(bossIdeas), progress:0}; save(s); draw();
  }
};
 save(s); draw();
  }

  // Quick templates
  document.getElementById('addDailySet').onclick=()=>{
    const set=[
      {title:'Hydrate x8 cups',done:false},
      {title:'15-min tidy sweep',done:false},
      {title:'Inbox zero (5 emails)',done:false},
      {title:'Move body 10 min',done:false}
    ];
    s.quests.main = [...(s.quests.main||[]), ...set]; save(s); draw(); toast('Added daily set');
  };
  document.getElementById('addWeeklySet').onclick=()=>{
    const set=[
      {title:'Laundry cycle + fold',done:false},
      {title:'Fridge scan + wipe',done:false},
      {title:'Floors sweep/mop',done:false},
      {title:'Plan meals 3x',done:false}
    ];
    s.quests.side = [...(s.quests.side||[]), ...set]; save(s); draw(); toast('Added weekly set');
  
  document.getElementById('raidWeek').oninput=(e)=>{ s.quests.raid.week=parseInt(e.target.value)||1; save(s); };
  document.getElementById('raidTitle').oninput=(e)=>{ s.quests.raid.title=e.target.value; save(s); };
  document.getElementById('raidTick').onclick=()=>{
    s.quests.raid.progress=Math.min(100,(s.quests.raid.progress||0)+10);
    save(s); draw();
    for(let i=0;i<3;i++) setTimeout(()=>crownDrop(4.0), i*100); // 3 crowns bigger scale
    if(s.quests.raid.progress>=100){
      for(let i=0;i<10;i++) setTimeout(()=>crownDrop(4.0), i*120);
      for(let k=0;k<4;k++) setTimeout(()=>confetti(), k*200);
      const raidIdeas=['Basement purge','Yard overhaul','Garage reset','Attic sort','Garden prep'];
      s.quests.raid={week:1,title:raidIdeas[Math.floor(Math.random()*raidIdeas.length)],progress:0}; save(s); draw();
    }
    document.getElementById('raidWeek').oninput=(e)=>{ s.quests.raid.week=Math.max(1, parseInt(e.target.value||'1')); save(s); };
  document.getElementById('raidTitle').oninput=(e)=>{ s.quests.raid.title=e.target.value; save(s); };
  document.getElementById('raidSuggest').onclick=()=>{ s.quests.raid.title=suggest(raidIdeas); save(s); draw(); };
  document.getElementById('raidTick').onclick=()=>{
    s.quests.raid.progress=Math.min(100,(s.quests.raid.progress||0)+10);
    save(s); draw();
    for(let i=0;i<3;i++) setTimeout(()=>{ crownDrop(); scaleRecentCrowns(4); }, i*80);
    if(s.quests.raid.progress>=100){
      for(let i=0;i<10;i++) setTimeout(()=>{ crownDrop(); scaleRecentCrowns(4); }, i*90);
      for(let k=0;k<4;k++) setTimeout(()=>confetti(), k*200);
      s.quests.raid={week:1, title:suggest(raidIdeas), progress:0}; save(s); draw();
    }
  };
};
;
  document.getElementById('raidWeek').oninput=(e)=>{ s.quests.raid.week=Math.max(1, parseInt(e.target.value||'1')); save(s); };
  document.getElementById('raidTitle').oninput=(e)=>{ s.quests.raid.title=e.target.value; save(s); };
  document.getElementById('raidSuggest').onclick=()=>{ s.quests.raid.title=suggest(raidIdeas); save(s); draw(); };
  document.getElementById('raidTick').onclick=()=>{
    s.quests.raid.progress=Math.min(100,(s.quests.raid.progress||0)+10);
    save(s); draw();
    for(let i=0;i<3;i++) setTimeout(()=>{ crownDrop(); scaleRecentCrowns(4); }, i*80);
    if(s.quests.raid.progress>=100){
      for(let i=0;i<10;i++) setTimeout(()=>{ crownDrop(); scaleRecentCrowns(4); }, i*90);
      for(let k=0;k<4;k++) setTimeout(()=>confetti(), k*200);
      s.quests.raid={week:1, title:suggest(raidIdeas), progress:0}; save(s); draw();
    }
  };
};

