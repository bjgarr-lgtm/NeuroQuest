'use strict';
/* SootheBirb — Toddler Mode + Minigames Pack (drop-in for v2.5.0)
   - Persistent toddler profile (level/xp/coins) and per‑game stats
   - Toddler UI badge & theme (body.toddler), top‑nav .toddler-only visibility
   - Minigames Hub (route "#minigames"): Bubble Pop, Memory Match, Star Catch
   - Co‑Op page integrates toddler week quests + "Open Minigames Hub"
   - Cleaning boss/monthly raid clicks give gold/xp + confetti + audio
   - Meals grid is editable & persisted
   NOTE: This file is careful to not change templates/structure from your base build.
*/

const KEY='sb.v2.5.0.state';
const defaults=()=>({settings:{toddler:false,music:false},party:{companions:[]},economy:{gold:0,ownedAcc:[]},equip:{head:null,face:null,back:null,hand:null},user:{character:null},
  pet:{level:1,xp:0},
  toddler:{profile:{level:1,xp:0,coins:0},games:{pop:{best:0,plays:0},match:{best:0,plays:0},catch:{best:0,plays:0}},lastWeek:null,collected:[],questsDone:[]},
  log:{tasks:[{id:1,text:'Drink water',xp:5,gold:1,done:false},{id:2,text:'3‑min stretch',xp:5,gold:1,done:false}]},
  meals:Array.from({length:7},()=>({breakfast:'',lunch:'',dinner:''})),
  cleaning:{weeklyBoss:{name:'Bathroom',progress:0},monthly:{title:'Deep clean',week:2,progress:0}},
  coop:{solo:{sidekicks:[]},toddler:{quests:[
    {id:'draw',text:'Draw with crayons',xp:5,gold:2},
    {id:'bake',text:'Help with baking',xp:5,gold:2},
    {id:'walk',text:'Nature walk',xp:5,gold:2},
    {id:'story',text:'Story time pile',xp:5,gold:2}
  ],collect:['Sticker Star','Sticker Rainbow','Sticker Paw']}}
});
function deep(a,b){ if(Array.isArray(a)) return Array.isArray(b)?b.slice():a.slice(); if(a&&typeof a==='object'){const o={...a}; for(const k of Object.keys(b||{})) o[k]=deep(a[k],b[k]); return o;} return b===undefined?a:b; }
let S; try{S=deep(defaults(), JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{S=defaults()}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch{} }

// small utils
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const on=(el,ev,fn)=>el&&el.addEventListener(ev,fn,{passive:true});
const uniq=(a)=>Array.from(new Set(a||[]));

// audio helpers (graceful if asset missing)
const audio={ ding:new Audio('assets/sfx/ding.wav'), coin:new Audio('assets/sfx/coin.wav'), level:new Audio('assets/sfx/level.wav') };
function play(a){ if(!a||!a.play) return; try{ a.currentTime=0; a.play(); }catch{} }

// XP math
const xpNeed = l => l*l*10;
const toddlerNeed = l => 15+Math.round(l*l*6);

// Confetti
function confettiBurst(x,y,count=120){
  const fx=$('#fxLayer'); if(!fx) return;
  const colors=['#00e5ff','#7cfb9a','#ffd166','#ff77e9','#9aa4ff','#ffadad','#caffbf'];
  for(let i=0;i<count;i++){
    const p=document.createElement('div'); p.style.position='fixed'; p.style.left=x+'px'; p.style.top=y+'px';
    const size=4+Math.random()*6; p.style.width=p.style.height=size+'px';
    p.style.background=colors[(Math.random()*colors.length)|0]; p.style.borderRadius='2px';
    const ang=Math.random()*2*Math.PI, speed=2+Math.random()*8, dur=600+Math.random()*800;
    const dx=Math.cos(ang)*speed, dy=Math.sin(ang)*speed;
    p.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx*40}px,${dy*40}px)`,opacity:0}],{duration:dur,easing:'ease-out'});
    setTimeout(()=>p.remove(), dur+60); fx.appendChild(p);
  }
}

// CSS tiny patch set (keeps your look)
(function(){
  const st=document.createElement('style'); st.textContent=`
    .sprite img{width:100%;height:100%;object-fit:contain;image-rendering:auto}
    .sprite{width:96px;height:96px}
    @media (max-width:700px){ .sprite{width:80px;height:80px} }
    .hud .avatars{display:flex;gap:6px;align-items:center;margin-right:12px}
    .hud .avatars .hud-ava{width:28px;height:28px;border-radius:6px;image-rendering:pixelated;box-shadow:0 0 0 2px rgba(255,255,255,.1) inset,0 0 6px rgba(0,255,255,.25)}
    .hud .avatars .hud-ava.you{box-shadow:0 0 0 2px rgba(255,215,0,.5) inset,0 0 8px rgba(255,215,0,.3)}
    /* Toddler theme */
    body.toddler .app-header{box-shadow:0 0 0 2px rgba(255,255,255,.05) inset, 0 0 24px #ff9de6}
    body.toddler .top-nav .nav-btn{animation: tod-bob 2s ease-in-out infinite alternate}
    #todBadge{margin-left:10px;padding:6px 10px;border-radius:999px;background:linear-gradient(90deg,#ff9de6,#9ad7ff,#b9ff9c); color:#111; font-weight:800; box-shadow:0 2px 10px rgba(0,0,0,.3)}
    .tod-xp{height:8px;background:#0006;border-radius:8px;overflow:hidden}
    .tod-xp>div{height:100%;background:linear-gradient(90deg,#8ef3ff,#ffd166,#ffa3ff)}
    @keyframes tod-bob{from{transform:translateY(0)}to{transform:translateY(-2px)}}
    /* meals */
    .meal-grid{display:grid;grid-template-columns:repeat(7,minmax(160px,1fr));gap:16px}
    .meal-day{display:grid;grid-template-rows:auto 1fr 1fr 1fr;gap:10px}
    .meal-head{display:flex;align-items:center;justify-content:center;padding:8px;border-radius:12px;background:rgba(255,255,255,.05)}
    .meal-slot{border-radius:12px;overflow:hidden}
    .meal-slot textarea{width:100%;min-height:90px;border:none;background:transparent;color:inherit;padding:12px;resize:vertical}
    /* minigame hub */
    .mg-menu{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
    .mg-card{border-radius:14px;padding:16px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);display:grid;gap:8px}
    canvas.game{touch-action:none;background:rgba(255,255,255,.02);border-radius:12px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
    .match-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:420px}
    .mm-card{height:88px;display:grid;place-items:center;border-radius:10px;background:rgba(255,255,255,.06);font-size:34px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);cursor:pointer}
    .mm-card.on{background:rgba(255,255,255,.12)}
  `; document.head.appendChild(st);
})();

// HUD + avatars
function CAT(){ return { molly:{name:'Molly',img:'assets/heroes/comp-molly.png'}, odin:{name:'Odin',img:'assets/heroes/hero-odin.png'}, ash:{name:'Ash',img:'assets/heroes/hero-ash.png'}, fox:{name:'Fox',img:'assets/heroes/hero-fox.png'} }; }
function hudAvatars(){
  const hud=$('#hudStrip'); if(!hud) return;
  let wrap=$('#hudAvatars'); if(!wrap){ wrap=document.createElement('div'); wrap.className='avatars'; wrap.id='hudAvatars'; hud.insertBefore(wrap, hud.firstChild); }
  wrap.innerHTML='';
  function add(img,cls,title){ const im=new Image(); im.src=img; im.alt=title||''; im.className='hud-ava '+(cls||''); wrap.appendChild(im); }
  if(S.user?.character?.img) add(S.user.character.img,'you','You');
  for(const id of (S.party.companions||[])){ const c=CAT()[id]; if(c) add(c.img,'',c.name); }
  wrap.title='Click to edit party'; wrap.style.cursor='pointer'; wrap.onclick=()=>{ location.hash='#companion'; };
}
function hud(){
  hudAvatars();
  const gold=$('#hudGold'); if(gold) gold.textContent=`🪙 ${S.economy.gold||0}`;
  const lvl=$('#hudLevel'), bar=$('#hudXp'); if(lvl&&bar){ const L=S.pet.level,X=S.pet.xp; const prev=xpNeed(L), need=xpNeed(L+1); const pct=Math.max(0,Math.min(100,Math.round(((X-prev)/(need-prev))*100))); bar.style.width=pct+'%'; lvl.textContent=`Lv ${L}`; }
}
function levelCheck(){ const need=xpNeed(S.pet.level+1); if(S.pet.xp>=need){ S.pet.level++; play(audio.level); save(); hud(); } }

// Toddler UI
function toddlerHud(){
  const brand=$('.brand'); if(!brand) return;
  let b=$('#todBadge');
  if(S.settings.toddler){
    if(!b){ b=document.createElement('div'); b.id='todBadge'; brand.appendChild(b); }
    const P=S.toddler.profile; const prev=toddlerNeed(P.level), need=toddlerNeed(P.level+1);
    const pct=Math.max(0,Math.min(100,Math.round(((P.xp-prev)/(need-prev))*100)));
    b.innerHTML=`🧸 Toddler Week • Lv ${P.level} • Coins ${P.coins}<div class="tod-xp" style="width:160px"><div style="width:${pct}%"></div></div>`;
  }else if(b){ b.remove(); }
}
function applyToddler(){
  document.body.classList.toggle('toddler', !!S.settings.toddler);
  $$('.toddler-only').forEach(el=> el.style.display= S.settings.toddler? '' : 'none');
  const tag=$('#coopWeek'); if(tag) tag.textContent = S.settings.toddler ? 'Toddler Week' : 'Solo Week';
  toddlerHud();
}
function toddlerReward(xp=3,coins=1,at=null){
  const P=S.toddler.profile; P.xp+=xp; P.coins+=coins; play(audio.ding); play(audio.coin); save(); const need=toddlerNeed(P.level+1), prev=toddlerNeed(P.level); if(P.xp>=need){ P.level++; play(audio.level); }
  toddlerHud();
  if(at){ const r=at.getBoundingClientRect(); confettiBurst(r.left+r.width/2, r.top, 120); }
}

// Banner & party
function partyBanner(){
  const wrap=$('#partyBanner'); if(!wrap) return;
  wrap.innerHTML='';
  function tile(img, name){ const d=document.createElement('div'); d.className='card'; const s=document.createElement('div'); s.className='sprite'; const im=new Image(); im.src=img; s.appendChild(im); const n=document.createElement('div'); n.className='name'; n.textContent=name; d.append(s,n); return d; }
  if(S.user?.character?.img) wrap.appendChild(tile(S.user.character.img, 'You'));
  for(const id of (S.party.companions||[])){ const c=CAT()[id]; if(c) wrap.appendChild(tile(c.img,c.name)); }
}

// Characters / Companions
function char(){
  const grid=$('#charGrid'); if(!grid) return;
  const choices=[
    {id:'bambi',img:'assets/heroes/hero-bambi.png',name:'Bambi'},
    {id:'ash',img:'assets/heroes/hero-ash.png',name:'Ash'},
    {id:'odin',img:'assets/heroes/hero-odin.png',name:'Odin'},
    {id:'fox',img:'assets/heroes/hero-fox.png',name:'Fox'},
  ];
  grid.innerHTML='';
  choices.forEach(c=>{
    const card=document.createElement('div'); card.className='char-card';
    card.innerHTML=`<div class="sprite"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`;
    card.onclick=()=>{ S.user.character={id:c.id,img:c.img,anim:'walk'}; save(); partyBanner(); hud(); location.hash='#companion'; };
    grid.appendChild(card);
  });
  on($('#uploadChar'),'click',()=> $('#charFile')?.click());
  on($('#charFile'),'change',e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ S.user.character={id:'custom',img:r.result,anim:'walk'}; save(); partyBanner(); hud(); location.hash='#companion'; }; r.readAsDataURL(f); });
}
function companion(){
  const grid=$('#compGrid'); if(!grid) return; const host=grid.parentElement;
  let bar=host.querySelector('.party-toolbar'); if(!bar){ bar=document.createElement('div'); bar.className='party-toolbar'; bar.innerHTML=`
    <div><strong id="partyCount"></strong></div>
    <div style="display:flex;gap:8px"><button id="btnDone" class="primary">Done</button><button id="btnClear" class="secondary">Clear</button><button id="btnAll" class="secondary">Select All</button></div>`;
    host.insertBefore(bar, grid);
  }
  const refresh=()=>{ const c=$('#partyCount'); if(c) c.textContent='Party: '+(S.party.companions?.length||0); };
  grid.innerHTML=''; const C=CAT();
  Object.keys(C).forEach(id=>{ const c=C[id]; const card=document.createElement('div'); card.className='party-card'+(S.party.companions.includes(id)?' selected':''); card.innerHTML=`<div class="sprite"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`;
    card.onclick=()=>{ const i=S.party.companions.indexOf(id); if(i>=0) S.party.companions.splice(i,1); else S.party.companions.push(id); S.party.companions=uniq(S.party.companions); save(); companion(); partyBanner(); hud(); };
    grid.appendChild(card);
  });
  on($('#btnDone'),'click',()=>{ save(); partyBanner(); hud(); location.hash='#home'; });
  on($('#btnClear'),'click',()=>{ S.party.companions=[]; save(); companion(); partyBanner(); hud(); });
  on($('#btnAll'),'click',()=>{ S.party.companions=uniq(Object.keys(C)); save(); companion(); partyBanner(); hud(); });
  refresh();
}

// Tasks
function tasks(){ const main=$('#panelMain'), side=$('#panelSide'), bonus=$('#panelBonus'); if(!main||!side||!bonus) return;
  const all=S.log.tasks||[]; const fill=(wrap,arr)=>{ wrap.innerHTML=''; arr.forEach(t=>{ const row=document.createElement('div'); row.className='row task-row';
    const box=document.createElement('button'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
    box.onclick=()=>{ t.done=!t.done; if(t.done){ S.economy.gold+=(t.gold||1); S.pet.xp+=(t.xp||5); play(audio.ding); play(audio.coin); levelCheck(); hud();
      const r=box.getBoundingClientRect(); confettiBurst(r.left+10,r.top); } save(); tasks(); };
    const label=document.createElement('div'); label.textContent=t.text; row.append(box,label); wrap.appendChild(row);
  }); };
  fill(main, all.filter((_,i)=>i<2)); fill(side, all.filter((_,i)=>i>=2 && i%3!==0)); fill(bonus, all.filter((_,i)=>i>=2 && i%3===0));
  on($('#addTaskBtn'),'click',()=>{ const title=$('#newTaskTitle')?.value.trim(); if(!title) return; S.log.tasks.push({id:Date.now(),text:title,xp:5,gold:1,done:false}); save(); tasks(); });
}

// Meals
function meals(){ const grid=$('#mealGrid'); if(!grid) return;
  if(!Array.isArray(S.meals)||S.meals.length!==7) S.meals=Array.from({length:7},()=>({breakfast:'',lunch:'',dinner:''}));
  grid.innerHTML='';
  const make=(d,slot)=>{ const wrap=document.createElement('div'); wrap.className='meal-slot cardish'; const ta=document.createElement('textarea'); ta.placeholder=slot; ta.value=S.meals[d]?.[slot]||''; ta.oninput=()=>{ if(!S.meals[d]) S.meals[d]={breakfast:'',lunch:'',dinner:''}; S.meals[d][slot]=ta.value; save(); }; wrap.appendChild(ta); return wrap; };
  ['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach((name,idx)=>{ const col=document.createElement('div'); col.className='meal-day';
    const head=document.createElement('div'); head.className='meal-head'; head.textContent=name; col.appendChild(head);
    col.appendChild(make(idx,'breakfast')); col.appendChild(make(idx,'lunch')); col.appendChild(make(idx,'dinner')); grid.appendChild(col);
  });
}

// Cleaning
function cleaning(){
  const prog=$('#bossProg'); if(!prog) return;
  const list=$('#bossList'); const nameIn=$('#bossName'); const plus=$('#bossTick'); const set=$('#bossNew');
  const render=()=>{ prog.style.width=Math.min(100,Math.max(0,Math.round(S.cleaning.weeklyBoss.progress||0)))+'%'; if(list) list.textContent='Boss: '+(S.cleaning.weeklyBoss.name||'—'); };
  const reward=(amt=10)=>{ S.economy.gold+=amt; S.pet.xp+=amt; play(audio.ding); play(audio.coin); levelCheck(); hud(); const r=prog.getBoundingClientRect(); confettiBurst(r.left+r.width/2, r.top-8); save(); };
  const bump=d=>{ S.cleaning.weeklyBoss.progress=Math.min(100,(S.cleaning.weeklyBoss.progress||0)+d); reward(S.cleaning.weeklyBoss.progress>=100?30:5); render(); };
  on(plus,'click',()=>bump(10)); on(prog.parentElement,'click',()=>bump(5)); on(set,'click',()=>{ const v=(nameIn?.value||'').trim(); if(v){ S.cleaning.weeklyBoss.name=v; save(); render(); } }); render();

  const wrap=$('#raidInfo'); if(wrap){ wrap.innerHTML=''; const t=document.createElement('input'); t.placeholder='Raid title'; t.value=S.cleaning.monthly.title||'';
    const w=document.createElement('input'); w.type='number'; w.min='1'; w.max='5'; w.style.width='90px'; w.value=S.cleaning.monthly.week||1;
    const barOut=document.createElement('div'); barOut.className='xp-bar'; const barIn=document.createElement('div'); barIn.style.width=(S.cleaning.monthly.progress||0)+'%'; barOut.appendChild(barIn);
    const plus=document.createElement('button'); plus.className='secondary'; plus.textContent='+10%';
    const saveBtn=document.createElement('button'); saveBtn.className='primary'; saveBtn.textContent='Save';
    const r1=document.createElement('div'); r1.className='row'; r1.append('Title:',t);
    const r2=document.createElement('div'); r2.className='row'; r2.append('Week:',w);
    const r3=document.createElement('div'); r3.className='row'; r3.append('Progress',barOut,plus,saveBtn);
    wrap.append(r1,r2,r3);
    const renderM=()=> barIn.style.width=(S.cleaning.monthly.progress||0)+'%';
    on(plus,'click',()=>{ S.cleaning.monthly.progress=Math.min(100,(S.cleaning.monthly.progress||0)+10); S.economy.gold+=8; S.pet.xp+=8; play(audio.ding); play(audio.coin); levelCheck(); save(); renderM(); });
    on(barOut,'click',()=>{ S.cleaning.monthly.progress=Math.min(100,(S.cleaning.monthly.progress||0)+5); S.economy.gold+=4; S.pet.xp+=4; play(audio.ding); play(audio.coin); levelCheck(); save(); renderM(); });
    on(saveBtn,'click',()=>{ S.cleaning.monthly.title=t.value; S.cleaning.monthly.week=parseInt(w.value||'1',10); save(); play(audio.ding); });
  }
}

// Co‑Op & toddler toggle/minigames entry
function coop(){
  applyToddler();
  const list=$('#sidekickList'); const col=$('#coopCollect'); if(!list||!col) return;
  list.innerHTML=''; col.innerHTML='';
  if(!S.settings.toddler){
    (S.coop.solo.sidekicks||[]).forEach((t,i)=>{
      const row=document.createElement('div'); row.className='row task-row';
      const box=document.createElement('button'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
      box.onclick=()=>{ t.done=!t.done; if(t.done){ S.economy.gold+=(t.gold||1); S.pet.xp+=(t.xp||5); play(audio.ding); play(audio.coin); levelCheck(); hud(); const r=box.getBoundingClientRect(); confettiBurst(r.left+10,r.top); } save(); coop(); };
      const label=document.createElement('div'); label.textContent=t.text;
      const del=document.createElement('button'); del.className='secondary'; del.textContent='×'; del.onclick=()=>{ S.coop.solo.sidekicks.splice(i,1); save(); coop(); };
      row.append(box,label,del); list.appendChild(row);
    });
    on($('#addSidekick'),'click',()=>{ const i=$('#newSidekick'); const v=i?.value.trim(); if(!v) return; (S.coop.solo.sidekicks||[]).push({id:Date.now(),text:v,done:false,xp:5,gold:1}); i.value=''; save(); coop(); });
  }else{
    (S.coop.toddler.quests||[]).forEach(q=>{
      const row=document.createElement('div'); row.className='row task-row';
      const done=(S.toddler.questsDone||[]).includes(q.id);
      const box=document.createElement('button'); box.className='checkbox'+(done?' checked':''); box.textContent=done?'✓':'';
      box.onclick=()=>{ const arr=S.toddler.questsDone||[]; const i=arr.indexOf(q.id); if(i>=0){arr.splice(i,1);} else {arr.push(q.id); toddlerReward(q.xp||5,q.gold||2,box);} S.toddler.questsDone=arr; save(); coop(); };
      const label=document.createElement('div'); label.textContent=q.text; row.append(box,label); list.appendChild(row);
    });
    const row=document.createElement('div'); row.className='row'; const mg=document.createElement('button'); mg.className='primary'; mg.textContent='Open Minigames Hub'; mg.onclick=()=>{ location.hash='#minigames'; };
    const reset=document.createElement('button'); reset.className='secondary'; reset.textContent='Reset Toddler Quests'; reset.onclick=()=>{ S.toddler.questsDone=[]; save(); coop(); };
    row.append(mg,reset); list.appendChild(row);

    const items=S.coop.toddler.collect||[]; items.forEach(name=>{
      const on=(S.toddler.collected||[]).includes(name);
      const b=document.createElement('div'); b.className='badge'+(on?' on':''); const cb=document.createElement('button'); cb.className='checkbox'+(on?' checked':''); cb.textContent=on?'✓':'';
      cb.onclick=()=>{ const arr=S.toddler.collected||[]; const i=arr.indexOf(name); if(i>=0){arr.splice(i,1);} else {arr.push(name); toddlerReward(2,1,cb);} S.toddler.collected=arr; save(); coop(); };
      const label=document.createElement('span'); label.textContent=name; b.append(cb,label); col.appendChild(b);
    });
  }
  on($('#toggleWeek'),'click',()=>{ S.settings.toddler=!S.settings.toddler; save(); applyToddler(); coop(); });
}

// Minigames hub
function minigames(){
  applyToddler();
  const view=$('#view'); if(!view) return;
  view.innerHTML='';
  const sec=document.createElement('section'); sec.className='cardish'; sec.innerHTML='<h2 class=\"dash\">Toddler Minigames</h2>'; view.appendChild(sec);
  const P=S.toddler.profile; const prev=toddlerNeed(P.level), need=toddlerNeed(P.level+1); const pct=Math.max(0,Math.min(100,Math.round(((P.xp-prev)/(need-prev))*100)));
  const hdr=document.createElement('div'); hdr.innerHTML=`<strong>🧸 Player</strong> Lv ${P.level} • Coins: ${P.coins}<div class="tod-xp" style="width:200px"><div style="width:${pct}%"></div></div>`; sec.appendChild(hdr);
  const menu=document.createElement('section'); menu.className='mg-menu'; view.appendChild(menu);
  const cards=[
    {key:'pop',   title:'Bubble Pop',  desc:'Tap floating bubbles before they disappear (30s).',   play:gamePop},
    {key:'match', title:'Memory Match',desc:'Flip cards to find all pairs.',                         play:gameMatch},
    {key:'catch', title:'Star Catch',  desc:'Move to catch falling stars. Avoid clouds!',           play:gameCatch},
  ];
  cards.forEach(c=>{
    const card=document.createElement('div'); card.className='mg-card';
    const best=S.toddler.games?.[c.key]?.best||0, plays=S.toddler.games?.[c.key]?.plays||0;
    card.innerHTML=`<div><strong>${c.title}</strong></div><div>${c.desc}</div><small>Best: ${best} • Plays: ${plays}</small>`;
    const btn=document.createElement('button'); btn.className='primary'; btn.textContent='Play'; btn.onclick=()=>c.play(); card.appendChild(btn);
    menu.appendChild(card);
  });
  function back(){ const b=document.createElement('button'); b.className='secondary'; b.textContent='← Back to games'; b.onclick=()=>minigames(); return b; }

  // --- Bubble Pop ---
  function gamePop(){
    view.innerHTML=''; const s=document.createElement('section'); s.className='cardish'; s.innerHTML='<h2 class="dash">Bubble Pop</h2>'; view.appendChild(s);
    const c=document.createElement('canvas'); c.width=420; c.height=260; c.className='game'; s.appendChild(c); s.appendChild(back());
    const ctx=c.getContext('2d'); let bubbles=[], score=0, running=true; const end=Date.now()+30000;
    function spawn(){ bubbles.push({x:Math.random()*c.width,y:c.height+20,r:10+Math.random()*18,vy:-0.6-Math.random()*0.8,ttl:4+Math.random()*2}); }
    for(let i=0;i<24;i++) spawn();
    function draw(){ ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle='rgba(255,255,255,.03)'; ctx.fillRect(0,0,c.width,c.height);
      bubbles.forEach(b=>{ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle='rgba(173,216,230,.6)'; ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.lineWidth=2; ctx.stroke(); });
      ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18); const left=Math.max(0,Math.ceil((end-Date.now())/1000)); ctx.fillText('Time: '+left+'s',c.width-70,18); }
    function tick(){ if(!running) return; bubbles.forEach(b=>{ b.y+=b.vy*6; b.ttl-=1/60; }); bubbles=bubbles.filter(b=>b.y+b.r>-10 && b.ttl>0); if(bubbles.length<28) spawn(); draw(); if(Date.now()>=end){ running=false; finish(); return; } requestAnimationFrame(tick); }
    function boom(x,y){ score++; toddlerReward(1,1,c); play(audio.ding); confettiBurst(x,y,30); }
    c.addEventListener('pointerdown', e=>{ const r=c.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; bubbles.forEach(b=>{ const dx=b.x-x,dy=b.y-y; if(dx*dx+dy*dy<b.r*b.r){ b.ttl=0; boom(b.x+r.left,b.y+r.top); } }); });
    function finish(){ const g=S.toddler.games.pop; g.best=Math.max(g.best||0,score); g.plays=(g.plays||0)+1; save();
      const m=document.createElement('div'); m.style.marginTop='8px'; m.innerHTML=`Round over! Score ${score}. (+${score} XP / +${Math.ceil(score/2)} coins)`; s.appendChild(m); toddlerReward(score,Math.ceil(score/2),c); }
    tick();
  }

  // --- Memory Match ---
  function gameMatch(){
    view.innerHTML=''; const s=document.createElement('section'); s.className='cardish'; s.innerHTML='<h2 class="dash">Memory Match</h2>'; view.appendChild(s);
    const em=['🦊','🐶','🐱','🐯','🐼','🐰','🐹','🦄']; const deck=shuffle([...em.slice(0,4),...em.slice(0,4)]);
    const grid=document.createElement('div'); grid.className='match-grid'; s.appendChild(grid); s.appendChild(back());
    let first=null, lock=false, matched=0, moves=0, start=Date.now();
    deck.forEach(v=>{ const d=document.createElement('div'); d.className='mm-card'; d.dataset.v=v; d.textContent='?'; d.onclick=()=>{
      if(lock||d.classList.contains('on')) return; d.classList.add('on'); d.textContent=v; if(!first){first=d; return;}
      moves++; if(first.dataset.v===v){ matched+=2; toddlerReward(2,1,d); first=null; if(matched===deck.length) done(); }
      else{ lock=true; setTimeout(()=>{ d.classList.remove('on'); d.textContent='?'; first.classList.remove('on'); first.textContent='?'; first=null; lock=false; },600); }
    }; grid.appendChild(d); });
    function done(){ const secTime=Math.round((Date.now()-start)/1000); const score=Math.max(1, 100-(secTime+moves*5));
      const g=S.toddler.games.match; g.best=Math.max(g.best||0,score); g.plays=(g.plays||0)+1; save();
      const m=document.createElement('div'); m.style.marginTop='8px'; m.innerHTML=`Nice! Time ${secTime}s, Moves ${moves}. Score ${score}. (+10 XP / +5 coins)`; s.appendChild(m); toddlerReward(10,5,grid); }
    function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }
  }

  // --- Star Catch ---
  function gameCatch(){
    view.innerHTML=''; const s=document.createElement('section'); s.className='cardish'; s.innerHTML='<h2 class="dash">Star Catch</h2>'; view.appendChild(s);
    const c=document.createElement('canvas'); c.width=420; c.height=260; c.className='game'; s.appendChild(c); s.appendChild(back());
    const ctx=c.getContext('2d'); let x=c.width/2, score=0, t=0, running=true; const stars=[], clouds=[];
    function addStar(){ stars.push({x:Math.random()*c.width,y:-10,vy:1.2+Math.random()*1.6}); }
    function addCloud(){ clouds.push({x:Math.random()*c.width,y:-20,vy:1.5+Math.random()*1.4}); }
    for(let i=0;i<6;i++) addStar(); for(let j=0;j<2;j++) addCloud();
    function draw(){ ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle='rgba(255,255,255,.03)'; ctx.fillRect(0,0,c.width,c.height);
      ctx.fillStyle='#ffdd57'; ctx.fillRect(x-12,c.height-20,24,10); ctx.fillStyle='#fff'; ctx.fillRect(x-8,c.height-28,16,8);
      ctx.fillStyle='#ffe680'; stars.forEach(s=>{ ctx.beginPath(); ctx.arc(s.x,s.y,4,0,Math.PI*2); ctx.fill(); });
      ctx.fillStyle='rgba(200,200,255,.6)'; clouds.forEach(cl=>{ ctx.beginPath(); ctx.arc(cl.x,cl.y,8,0,Math.PI*2); ctx.fill(); });
      ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18); }
    function tick(){ if(!running) return; t++; stars.forEach(s=>{ s.y+=s.vy; if(s.y>c.height+10){ s.y=-10; s.x=Math.random()*c.width; } if(Math.abs(s.x-x)<12 && s.y>c.height-28){ s.y=-10; s.x=Math.random()*c.width; score++; toddlerReward(1,1,c); } });
      clouds.forEach(cl=>{ cl.y+=cl.vy; if(cl.y>c.height+10){ cl.y=-10; cl.x=Math.random()*c.width; } if(Math.abs(cl.x-x)<12 && cl.y>c.height-28){ running=false; finish(); } });
      if(t%40===0) addStar(); if(t%120===0) addCloud(); draw(); requestAnimationFrame(tick); }
    function finish(){ const g=S.toddler.games.catch; g.best=Math.max(g.best||0,score); g.plays=(g.plays||0)+1; save();
      const m=document.createElement('div'); m.style.marginTop='8px'; m.innerHTML=`Game over • Score ${score}. (+${score} XP / +${Math.ceil(score/2)} coins)`; s.appendChild(m); toddlerReward(score,Math.ceil(score/2),c); }
    function move(e){ const r=c.getBoundingClientRect(); x=e.clientX-r.left; }
    c.addEventListener('pointerdown',move); c.addEventListener('pointermove',move); tick();
  }
}

// Router
const map={home:'tpl-home',tasks:'tpl-tasks',clean:'tpl-clean',coop:'tpl-coop',budget:'tpl-budget',meals:'tpl-meals',calendar:'tpl-calendar',shop:'tpl-shop',characters:'tpl-characters',companion:'tpl-companion',breathe:'tpl-breathe',minigames:'tpl-minigames',journal:'tpl-journal',checkin:'tpl-checkin',rewards:'tpl-rewards',settings:'tpl-settings',pet:'tpl-pet'};
const alias={quests:'tasks',cleaning:'clean'};
let LAST='';
function rname(){ const raw=(location.hash||'#home').slice(1)||'home'; return alias[raw]||raw; }
function render(){
  const name=rname(); if(name===LAST) return; LAST=name;
  const tpl=document.getElementById(map[name]); const view=$('#view'); if(!tpl||!view){ hud(); partyBanner(); return; }
  view.innerHTML=''; view.appendChild(tpl.content.cloneNode(true));
  hud(); partyBanner(); applyToddler();
  if(name==='home'){ $$('.tile[data-route]',view).forEach(t=> t.addEventListener('click',()=>{ location.hash='#'+t.getAttribute('data-route'); })); }
  if(name==='characters') char();
  if(name==='companion') companion();
  if(name==='tasks') tasks();
  if(name==='meals') meals();
  if(name==='clean') cleaning();
  if(name==='coop') coop();
  if(name==='minigames') minigames();
  window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange',()=>requestAnimationFrame(render));
$('.top-nav')?.addEventListener('click',e=>{ const b=e.target.closest('[data-route]'); if(!b) return; e.preventDefault(); location.hash='#'+b.dataset.route; });

// boot
hud(); toddlerHud(); render();
console.log('SootheBirb Toddler Mode pack loaded');