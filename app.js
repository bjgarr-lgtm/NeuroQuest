'use strict';
// SootheBirb app merge: Party/HUD + Meals + Cleaning + Co‑Op Toddler Mode

const KEY='sb.v2.5.0.stable';
const defaults=()=>({settings:{toddler:false,music:false},party:{companions:[]},economy:{gold:0,ownedAcc:[]},equip:{head:null,face:null,back:null,hand:null},user:{character:null},pet:{level:1,xp:0},
  log:{tasks:[]},
  meals:Array.from({length:7},()=>({breakfast:'',lunch:'',dinner:''})),
  cleaning:{weeklyBoss:{name:'Bathroom',progress:0},monthly:{title:'Deep clean',week:2,progress:0}},
  coop:{solo:{sidekicks:[]},toddler:{quests:[
    {id:'draw',text:'Draw with crayons',done:false,xp:5,gold:2},
    {id:'bake',text:'Help with baking',done:false,xp:5,gold:2},
    {id:'walk',text:'Nature walk',done:false,xp:5,gold:2},
    {id:'story',text:'Make a story pile',done:false,xp:5,gold:2},
  ],collect:['Sticker Star','Sticker Rainbow','Sticker Paw']}}
});
function deep(a,b){ if(Array.isArray(a)) return Array.isArray(b)?b.slice():a.slice(); if(a&&typeof a==='object'){const o={...a}; for(const k of Object.keys(b||{})) o[k]=deep(a[k],b[k]); return o;} return b===undefined?a:b; }
let S; try{S=deep(defaults(), JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{S=defaults()}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch{} }

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const uniq=(arr)=>Array.from(new Set(arr||[]));
function on(el,ev,fn){ if(el) el.addEventListener(ev,fn); }

// audio
const audio={ding:new Audio('assets/sfx/ding.wav'),coin:new Audio('assets/sfx/coin.wav'),level:new Audio('assets/sfx/level.wav')};
function play(a){ if(a&&a.play){ try{a.currentTime=0;a.play();}catch{} } }
function xpFor(l){ return l*l*10 }
function levelCheck(){ const need=xpFor(S.pet.level+1); if(S.pet.xp>=need){ S.pet.level++; play(audio.level); save(); hud(); } }

// Confetti burst
function confettiBurst(x,y,count=140){
  const fx=$('#fxLayer'); if(!fx) return;
  const colors=['#00e5ff','#7cfb9a','#ffd166','#ff77e9','#9aa4ff'];
  for(let i=0;i<count;i++){
    const p=document.createElement('div'); p.style.position='fixed';
    p.style.left=x+'px'; p.style.top=y+'px';
    const size=4+Math.random()*6; p.style.width=p.style.height=size+'px';
    p.style.background=colors[(Math.random()*colors.length)|0]; p.style.borderRadius='2px';
    const ang=Math.random()*2*Math.PI, speed=2+Math.random()*8, dur=600+Math.random()*600;
    const dx=Math.cos(ang)*speed, dy=Math.sin(ang)*speed;
    p.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx*30}px,${dy*30}px)`,opacity:0}],{duration:dur,easing:'ease-out'});
    setTimeout(()=>p.remove(), dur+50);
    fx.appendChild(p);
  }
}

// CSS overrides / fallbacks
(function(){ const st=document.createElement('style'); st.textContent=`
  .char-grid, .comp-grid { display:grid !important; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)) !important; gap:16px !important; }
  .char-card, .party-card { display:grid; place-items:center; padding:8px; }
  .sprite, .char-card .sprite, .party-card .sprite, .party-members .card .sprite { width:96px !important; height:96px !important; }
  .sprite img, .char-card .sprite img, .party-card .sprite img, .party-members .card .sprite img { width:100% !important; height:100% !important; object-fit:contain !important; image-rendering:auto !important; }
  @media (max-width:700px){ .sprite, .char-card .sprite, .party-card .sprite, .party-members .card .sprite { width:80px !important; height:80px !important; } }
  .hud .avatars{display:flex;gap:6px;align-items:center;margin-right:12px}
  .hud .avatars .hud-ava{width:28px;height:28px;border-radius:6px;image-rendering:pixelated;box-shadow:0 0 0 2px rgba(255,255,255,.08) inset, 0 0 6px rgba(0,255,255,.25)}
  .hud .avatars .hud-ava.you{box-shadow:0 0 0 2px rgba(255,215,0,.45) inset, 0 0 8px rgba(255,215,0,.25)}
  .party-card.selected::after{content:"✓";position:absolute;right:6px;top:6px;background:#0f0;color:#000;font-weight:700;border-radius:50%;width:18px;height:18px;display:grid;place-items:center;box-shadow:0 0 6px #0f0}
  .party-card{position:relative;cursor:pointer}
  .party-banner,.party-banner .party-label,.party-members .name{color:#111 !important;text-shadow:none !important}
  /* meals grid */
  .meal-grid{display:grid;grid-template-columns:repeat(7,minmax(160px,1fr));gap:16px}
  .meal-day{display:grid;grid-template-rows:auto 1fr 1fr 1fr;gap:10px}
  .meal-head{font-weight:800;letter-spacing:.08em;display:flex;align-items:center;justify-content:center;padding:8px;border-radius:12px;background:rgba(255,255,255,.05)}
  .meal-slot{border-radius:12px;padding:0;overflow:hidden}
  .meal-slot textarea{width:100%;min-height:90px;background:transparent;border:none;color:inherit;padding:14px;resize:vertical}
  /* co‑op styles */
  .panel-list .task-row{display:flex;gap:10px;align-items:center;padding:8px 0}
  .checkbox{width:24px;height:24px;border-radius:6px;border:2px solid rgba(255,255,255,.4);display:grid;place-items:center}
  .checkbox.checked{background:#00ffaa33;border-color:#00ffaa}
  .collect-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
  .badge{display:flex;align-items:center;gap:8px;padding:10px;border-radius:10px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
  .badge.on{background:rgba(255,215,0,.1);box-shadow:inset 0 0 0 1px rgba(255,215,0,.45)}
`; document.head.appendChild(st); })();

function CAT(){ return {
  molly:{name:'Molly',img:'assets/heroes/comp-molly.png'},
  odin:{name:'Odin',img:'assets/heroes/hero-odin.png'},
  ash:{name:'Ash',img:'assets/heroes/hero-ash.png'},
  fox:{name:'Fox',img:'assets/heroes/hero-fox.png'}
};}

function hudAvatars(){
  const wrap=$('#hudAvatars') || (function(){
    const hud=$('#hudStrip'); if(!hud) return null;
    const d=document.createElement('div'); d.className='avatars'; d.id='hudAvatars';
    hud.insertBefore(d, hud.firstChild);
    return d;
  })();
  if(!wrap) return;
  wrap.innerHTML='';
  function add(img, cls, title){
    const i=new Image(); i.src=img; i.alt=title||''; i.className='hud-ava '+(cls||''); wrap.appendChild(i);
  }
  if(S.user?.character?.img) add(S.user.character.img,'you','You');
  for(const id of (S.party.companions||[])){ const c=CAT()[id]; if(c) add(c.img,'',c.name); }
  wrap.title='Click to edit party'; wrap.style.cursor='pointer';
  wrap.onclick=()=>{ location.hash='#companion'; };
}

function hud(){
  hudAvatars();
  const gold=$('#hudGold'); if(gold) gold.textContent=`🪙 ${S.economy.gold||0}`;
  const lvl=$('#hudLevel'), bar=$('#hudXp'); if(lvl && bar){ const L=S.pet.level,X=S.pet.xp,N=xpFor(L+1),P=xpFor(L); lvl.textContent=`Lv ${L}`; bar.style.width=Math.max(0,Math.min(100,Math.round(((X-P)/(N-P))*100)))+'%'; }
}

function equipLayers(container){ const e=S.equip||{}; const ACC={crown:'assets/acc/crown.svg',glasses:'assets/acc/glasses.svg',cape:'assets/acc/cape.svg',torch:'assets/acc/torch.svg'};
  ['back','head','face','hand'].forEach(slot=>{ const key=e[slot]; if(!key||!ACC[key]) return; const img=new Image(); img.className='acc '+slot; img.src=ACC[key]; container.appendChild(img); });
}
function partyBanner(){
  const wrap=$('#partyBanner'); if(!wrap) return;
  wrap.innerHTML='';
  if(S.user?.character?.img){
    const you=document.createElement('div'); you.className='card';
    const sp=document.createElement('div'); sp.className='sprite anim-walk';
    sp.appendChild(Object.assign(new Image(),{src:S.user.character.img,alt:'You'}));
    equipLayers(sp);
    you.appendChild(sp); you.appendChild(Object.assign(document.createElement('div'),{className:'name',textContent:'You'}));
    wrap.appendChild(you);
  }
  for(const id of (S.party.companions||[])){
    const c=CAT()[id]; if(!c) continue;
    const card=document.createElement('div'); card.className='card';
    card.innerHTML=`<div class="sprite anim-walk"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`;
    wrap.appendChild(card);
  }
}

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
    card.innerHTML=`<div class="sprite anim-walk"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`;
    card.onclick=()=>{ S.user.character={id:c.id,img:c.img,anim:'walk'}; save(); partyBanner(); hud(); location.hash='#companion'; };
    grid.appendChild(card);
  });
  on($('#uploadChar'),'click',()=> $('#charFile')?.click());
  on($('#charFile'),'change',e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ S.user.character={id:'custom',img:r.result,anim:'walk'}; save(); partyBanner(); hud(); location.hash='#companion'; }; r.readAsDataURL(f); });
}

function companion(){
  const grid=$('#compGrid'); if(!grid) return;
  const host=grid.parentElement;
  let bar=host.querySelector('.party-toolbar');
  if(!bar){ bar=document.createElement('div'); bar.className='party-toolbar'; bar.innerHTML=`
      <div><strong id="partyCount"></strong></div>
      <div style="display:flex;gap:8px;">
        <button id="btnDone" class="primary">Done</button>
        <button id="btnClear" class="secondary">Clear Party</button>
        <button id="btnAll" class="secondary">Select All</button>
      </div>`; host.insertBefore(bar, grid); }
  const C=CAT(); function refresh(){ const counter=$('#partyCount'); if(counter) counter.textContent='Party: '+(S.party.companions?.length||0); }
  refresh();
  grid.innerHTML='';
  Object.keys(C).forEach(id=>{
    const c=C[id]; const card=document.createElement('div');
    card.className='party-card'+(S.party.companions.includes(id)?' selected':'');
    card.innerHTML=`<div class="sprite anim-walk"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`;
    card.onclick=()=>{ const i=S.party.companions.indexOf(id); if(i>=0) S.party.companions.splice(i,1); else S.party.companions.push(id); S.party.companions=uniq(S.party.companions); save(); companion(); partyBanner(); hud(); };
    grid.appendChild(card);
  });
  on($('#btnDone'),'click',()=>{ save(); partyBanner(); hud(); location.hash='#home'; });
  on($('#btnClear'),'click',()=>{ S.party.companions=[]; save(); companion(); partyBanner(); hud(); });
  on($('#btnAll'),'click',()=>{ S.party.companions=uniq(Object.keys(C)); save(); companion(); partyBanner(); hud(); });
}

// tasks awarder
function tasks(){ const main=$('#panelMain'), side=$('#panelSide'), bonus=$('#panelBonus'); if(!main||!side||!bonus) return;
  if(!S.log.tasks?.length){ S.log.tasks=[{id:1,text:'Drink water',xp:5,gold:1,done:false},{id:2,text:'3-min stretch',xp:5,gold:1,done:false}]; }
  const fill=(wrap, arr)=>{ wrap.innerHTML=''; arr.forEach((t,i)=>{ const row=document.createElement('div'); row.className='row task-row';
    const box=document.createElement('button'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
    box.onclick=()=>{ t.done=!t.done; if(t.done){ S.economy.gold+=(t.gold||1); S.pet.xp+=(t.xp||5); play(audio.ding); play(audio.coin); levelCheck(); save(); hud(); } tasks(); };
    const label=document.createElement('div'); label.textContent=t.text;
    row.append(box,label); wrap.appendChild(row); }); };
  const all=S.log.tasks||[];
  fill(main, all.filter((_,i)=>i<2));
  fill(side, all.filter((_,i)=>i>=2 && i%3!==0));
  fill(bonus, all.filter((_,i)=>i>=2 && i%3===0));
  on($('#addTaskBtn'),'click',()=>{ const title=$('#newTaskTitle')?.value.trim(); if(!title) return; const t={id:Date.now(),text:title,xp:5,gold:1,done:false}; S.log.tasks.push(t); save(); tasks(); });
}

// MEALS
function meals(){ const grid=$('#mealGrid'); if(!grid) return;
  const DAYS=['SUN','MON','TUE','WED','THU','FRI','SAT'];
  if(!Array.isArray(S.meals) || S.meals.length!==7){ S.meals=Array.from({length:7},()=>({breakfast:'',lunch:'',dinner:''})); }
  grid.innerHTML='';
  const makeSlot=(d,slot)=>{ const wrap=document.createElement('div'); wrap.className='meal-slot cardish';
    const ta=document.createElement('textarea'); ta.placeholder=slot; ta.value=S.meals[d]?.[slot]||'';
    ta.addEventListener('input',()=>{ if(!S.meals[d]) S.meals[d]={breakfast:'',lunch:'',dinner:''}; S.meals[d][slot]=ta.value; save(); });
    wrap.appendChild(ta); return wrap; };
  ['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach((name,idx)=>{
    const col=document.createElement('div'); col.className='meal-day';
    const head=document.createElement('div'); head.className='meal-head'; head.textContent=name; col.appendChild(head);
    col.appendChild(makeSlot(idx,'breakfast'));
    col.appendChild(makeSlot(idx,'lunch'));
    col.appendChild(makeSlot(idx,'dinner'));
    grid.appendChild(col);
  });
}

// CLEANING interactions
function cleaning(){ const prog=$('#bossProg'), nameIn=$('#bossName'), setBtn=$('#bossNew'), tickBtn=$('#bossTick'), list=$('#bossList');
  if(!prog) return;

  function renderBoss(){
    const p=S.cleaning.weeklyBoss.progress||0;
    prog.style.width=Math.min(100,Math.max(0,Math.round(p)))+'%';
    if(list){ list.innerHTML=`Boss: ${S.cleaning.weeklyBoss.name||'—'}`; }
  }
  function award(amount=10){
    S.economy.gold+=amount; S.pet.xp+=amount; play(audio.ding); play(audio.coin); levelCheck(); hud();
    const r=prog.getBoundingClientRect(); confettiBurst(r.left+r.width/2, r.top-8);
  }
  function bump(delta){
    S.cleaning.weeklyBoss.progress=Math.min(100,(S.cleaning.weeklyBoss.progress||0)+delta);
    award(S.cleaning.weeklyBoss.progress>=100?30:5); save(); renderBoss();
  }
  on(tickBtn,'click',()=>bump(10));
  const bar=prog.parentElement; if(bar){ on(bar,'click',()=>bump(5)); }
  on(setBtn,'click',()=>{ const v=(nameIn?.value||'').trim(); if(v){ S.cleaning.weeklyBoss.name=v; save(); renderBoss(); } });
  renderBoss();

  // Monthly raid
  const rwrap=$('#raidInfo');
  if(rwrap){
    rwrap.innerHTML='';
    const title=document.createElement('input'); title.placeholder='Raid title'; title.value=S.cleaning.monthly.title||''; title.className='field-like';
    const week=document.createElement('input'); week.type='number'; week.min='1'; week.max='5'; week.value=S.cleaning.monthly.week||1; week.style.width='90px';
    const barOuter=document.createElement('div'); barOuter.className='xp-bar'; const barInner=document.createElement('div'); barInner.style.width=(S.cleaning.monthly.progress||0)+'%'; barOuter.appendChild(barInner);
    const plus=document.createElement('button'); plus.className='secondary'; plus.textContent='+10%';
    const saveBtn=document.createElement('button'); saveBtn.className='primary'; saveBtn.textContent='Save';
    const row1=document.createElement('div'); row1.className='row'; row1.append('Title:',title);
    const row2=document.createElement('div'); row2.className='row'; row2.append('Week:',week);
    const row3=document.createElement('div'); row3.className='row'; row3.append('Progress',barOuter,plus,saveBtn);
    rwrap.append(row1,row2,row3);
    const renderRaid=()=>{ barInner.style.width=(S.cleaning.monthly.progress||0)+'%'; };
    on(plus,'click',()=>{ S.cleaning.monthly.progress=Math.min(100,(S.cleaning.monthly.progress||0)+10); S.economy.gold+=8; S.pet.xp+=8; play(audio.ding); play(audio.coin); levelCheck(); save(); renderRaid(); });
    on(barOuter,'click',()=>{ S.cleaning.monthly.progress=Math.min(100,(S.cleaning.monthly.progress||0)+5); S.economy.gold+=4; S.pet.xp+=4; play(audio.ding); play(audio.coin); levelCheck(); save(); renderRaid(); });
    on(saveBtn,'click',()=>{ S.cleaning.monthly.title=title.value; S.cleaning.monthly.week=parseInt(week.value||'1',10); save(); play(audio.ding); });
  }
}

// CO‑OP / TODDLER MODE
function applyToddler(){
  document.body.classList.toggle('toddler', !!S.settings.toddler);
  $$('.toddler-only').forEach(el=> el.style.display = S.settings.toddler? '' : 'none');
  const week=$('#coopWeek'); if(week) week.textContent=S.settings.toddler ? 'Toddler Week' : 'Solo Week';
}
function coop(){
  applyToddler();
  const list=$('#sidekickList'); const collect=$('#coopCollect');
  if(!list||!collect) return;

  list.innerHTML=''; collect.innerHTML='';
  // SOLO WEEK – user-defined sidekicks
  if(!S.settings.toddler){
    // Render tasks
    (S.coop.solo.sidekicks||[]).forEach((t,idx)=>{
      const row=document.createElement('div'); row.className='row task-row';
      const box=document.createElement('button'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
      box.onclick=()=>{ t.done=!t.done; if(t.done){ S.economy.gold+=(t.gold||1); S.pet.xp+=(t.xp||5); play(audio.ding); play(audio.coin); levelCheck(); hud();
        const r=box.getBoundingClientRect(); confettiBurst(r.left+10,r.top); } save(); coop(); };
      const label=document.createElement('div'); label.textContent=t.text;
      const del=document.createElement('button'); del.className='secondary'; del.textContent='×'; del.onclick=()=>{ S.coop.solo.sidekicks.splice(idx,1); save(); coop(); };
      row.append(box,label,del); list.appendChild(row);
    });
    // Add button
    on($('#addSidekick'),'click',()=>{
      const i=$('#newSidekick'); const val=i?.value.trim(); if(!val) return;
      (S.coop.solo.sidekicks||=[]).push({id:Date.now(),text:val,done:false,xp:5,gold:1});
      i.value=''; save(); coop();
    });
  } else {
    // TODDLER WEEK – preset quests + reset button
    (S.coop.toddler.quests||[]).forEach(t=>{
      const row=document.createElement('div'); row.className='row task-row';
      const box=document.createElement('button'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
      box.onclick=()=>{ t.done=!t.done; if(t.done){ S.economy.gold+=t.gold||2; S.pet.xp+=t.xp||5; play(audio.ding); play(audio.coin); levelCheck(); hud();
        const r=box.getBoundingClientRect(); confettiBurst(r.left+10,r.top); } save(); coop(); };
      const label=document.createElement('div'); label.textContent=t.text;
      row.append(box,label); list.appendChild(row);
    });
    const mg=document.createElement('button'); mg.className='primary'; mg.textContent='Play Mini‑Quest'; mg.onclick=()=>{ location.hash='#minigames'; };
    const reset=document.createElement('button'); reset.className='secondary'; reset.textContent='Reset Toddler Quests';
    reset.onclick=()=>{ (S.coop.toddler.quests||[]).forEach(q=>q.done=false); save(); coop(); };
    const row=document.createElement('div'); row.className='row'; row.style.marginTop='6px'; row.append(mg,reset); list.appendChild(row);

    // Collectibles grid
    const items=S.coop.toddler.collect||[];
    items.forEach((name,i)=>{
      const on=((S.coop.toddler.collected||[]).includes(name));
      const b=document.createElement('div'); b.className='badge'+(on?' on':'');
      const cb=document.createElement('button'); cb.className='checkbox'+(on?' checked':''); cb.textContent=on?'✓':'';
      cb.onclick=()=>{ const arr=(S.coop.toddler.collected||[]); const j=arr.indexOf(name); if(j>=0){arr.splice(j,1);} else {arr.push(name); S.economy.gold+=1; play(audio.coin);} S.coop.toddler.collected=arr; save(); coop(); };
      b.append(cb, document.createElement('span')); b.lastChild.textContent=name;
      collect.appendChild(b);
    });
  }

  // Toggle week button
  on($('#toggleWeek'),'click',()=>{ S.settings.toddler=!S.settings.toddler; save(); applyToddler(); coop(); });
}

const map={home:'tpl-home',tasks:'tpl-tasks',clean:'tpl-clean',coop:'tpl-coop',budget:'tpl-budget',meals:'tpl-meals',calendar:'tpl-calendar',shop:'tpl-shop',characters:'tpl-characters',companion:'tpl-companion',breathe:'tpl-breathe',minigames:'tpl-minigames',journal:'tpl-journal',checkin:'tpl-checkin',rewards:'tpl-rewards',settings:'tpl-settings',pet:'tpl-pet'};
const alias={quests:'tasks',cleaning:'clean'};
let LAST='';
function routeName(){ const raw=(location.hash||'#home').slice(1)||'home'; return alias[raw]||raw; }
function render(){
  const name=routeName(); if(name===LAST) return; LAST=name;
  const tplId=map[name]; const tpl=document.getElementById(tplId); const view=$('#view'); if(!tpl||!view){ hud(); partyBanner(); return; }
  view.innerHTML=''; view.appendChild(tpl.content.cloneNode(true));
  hud(); partyBanner(); applyToddler();
  if(name==='home'){ $$('.tile[data-route]', view).forEach(t=> t.addEventListener('click',()=>{ location.hash='#'+t.getAttribute('data-route'); })); }
  if(name==='tasks'){ tasks(); }
  if(name==='characters'){ char(); }
  if(name==='companion'){ companion(); }
  if(name==='meals'){ meals(); }
  if(name==='clean'){ cleaning(); }
  if(name==='coop'){ coop(); }
  window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange', ()=>requestAnimationFrame(render));
$('.top-nav')?.addEventListener('click', e=>{ const b=e.target.closest('[data-route]'); if(!b) return; e.preventDefault(); location.hash='#'+b.dataset.route; });
hud(); render();
console.log('SootheBirb co‑op toddler hotfix: functional toggle + toddler quests/collectibles + solo sidekicks + rewards');