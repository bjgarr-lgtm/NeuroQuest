'use strict';
/* SootheBirb v2.5+ — Toddler Mode, 8 Minigames, Wardrobe, Pet split, Calendar embed
   Drop-in replacement for app.js
*/

// ---------- State ----------
const KEY='sb.v2.5.plus';
const defaults=()=>({settings:{toddler:false,music:false,font:'press2p',theme:'retro',gcalEmbed:''},
  user:{character:null}, party:{companions:[]},
  pet:{level:1,xp:0},
  toddler:{profile:{level:1,xp:0,coins:0},
           games:{pop:{best:0,plays:0},match:{best:0,plays:0},catch:{best:0,plays:0},color:{best:0,plays:0},balloon:{best:0,plays:0},simon:{best:0,plays:0},whack:{best:0,plays:0},shape:{best:0,plays:0}},
           collected:[], questsDone:[]},
  economy:{gold:0, charOwned:[], petOwned:[],},
  equipChar:{head:null,face:null,back:null,hand:null,body:null},
  equipPet:{head:null,face:null,back:null,hand:null},
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
let S; try{ S=deep(defaults(), JSON.parse(localStorage.getItem(KEY)||'{}')); }catch{ S=defaults(); }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch{} }

// ---------- Utils ----------
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const on=(el,ev,fn)=>el&&el.addEventListener(ev,fn,{passive:true});
const uniq=a=>Array.from(new Set(a||[]));
const clamp=(v,min,max)=>v<min?min:v>max?max:v;

// ---------- Audio ----------
const audio={ding:new Audio('assets/sfx/ding.wav'),coin:new Audio('assets/sfx/coin.wav'),level:new Audio('assets/sfx/level.wav')};
function play(a){ if(!a||!a.play) return; try{ a.currentTime=0; a.play(); }catch{} }

// ---------- HUD ----------
const xpNeed = l => l*l*10;
function hud(){
  const gold=$('#hudGold'); if(gold) gold.textContent=`🪙 ${S.economy.gold||0}`;
  const lvl=$('#hudLevel'), bar=$('#hudXp'); if(lvl&&bar){
    const L=S.pet.level,X=S.pet.xp,prev=xpNeed(L),need=xpNeed(L+1);
    const pct=Math.max(0,Math.min(100,Math.round(((X-prev)/(need-prev))*100))); bar.style.width=pct+'%'; lvl.textContent=`Lv ${L}`;
  }
  hudAvatars();
}
function levelCheck(){ const need=xpNeed(S.pet.level+1); if(S.pet.xp>=need){ S.pet.level++; play(audio.level); save(); hud(); } }

function CAT(){ return { molly:{name:'Molly',img:'assets/heroes/comp-molly.png'}, odin:{name:'Odin',img:'assets/heroes/hero-odin.png'}, ash:{name:'Ash',img:'assets/heroes/hero-ash.png'}, fox:{name:'Fox',img:'assets/heroes/hero-fox.png'} }; }
function hudAvatars(){
  const hud=$('#hudStrip'); if(!hud) return;
  let wrap=$('#hudAvatars'); if(!wrap){ wrap=document.createElement('div'); wrap.className='avatars'; wrap.id='hudAvatars'; hud.insertBefore(wrap, hud.firstChild); }
  wrap.innerHTML='';
  function add(img,cls,title){ const i=new Image(); i.src=img; i.alt=title||''; i.className='hud-ava '+(cls||''); wrap.appendChild(i); }
  if(S.user?.character?.img) add(S.user.character.img,'you','You');
  for(const id of (S.party.companions||[])){ const c=CAT()[id]; if(c) add(c.img,'',c.name); }
  wrap.title='Click to edit party'; wrap.style.cursor='pointer'; wrap.onclick=()=>{ location.hash='#companion'; };
}

// ---------- Toddler UI ----------
const toddlerNeed = l => 15+Math.round(l*l*6);
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
  $$('.toddler-only').forEach(el=> el.style.display = S.settings.toddler? '' : 'none');
  const tag=$('#coopWeek'); if(tag) tag.textContent = S.settings.toddler ? 'Toddler Week' : 'Solo Week';
  toddlerHud();
}
function toddlerReward(xp=3, coins=1, at=null){
  const P=S.toddler.profile; P.xp+=xp; P.coins+=coins; play(audio.ding); play(audio.coin); save();
  if(P.xp>=toddlerNeed(P.level+1)){ P.level++; play(audio.level); }
  toddlerHud();
  if(at){ const r=at.getBoundingClientRect(); confettiBurst(r.left+r.width/2, r.top, 120); }
}

// ---------- CSS tiny overrides ----------
(function(){
  const st=document.createElement('style'); st.textContent=`
  .char-grid, .comp-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:16px }
  .sprite{ width:96px; height:96px } .sprite img{ width:100%; height:100%; object-fit:contain; image-rendering:auto }
  @media (max-width:700px){ .sprite{width:80px;height:80px} }
  .hud .avatars{display:flex;gap:6px;align-items:center;margin-right:12px}
  .hud .avatars .hud-ava{width:28px;height:28px;border-radius:6px;image-rendering:pixelated;box-shadow:0 0 0 2px rgba(255,255,255,.1) inset,0 0 6px rgba(0,255,255,.25)}
  .hud .avatars .hud-ava.you{box-shadow:0 0 0 2px rgba(255,215,0,.5) inset, 0 0 8px rgba(255,215,0,.3)}
  /* toddler theme */
  body.toddler .app-header{box-shadow:0 0 0 2px rgba(255,255,255,.05) inset, 0 0 24px #ff9de6}
  body.toddler .top-nav .nav-btn{animation:tBob 2s ease-in-out infinite alternate}
  #todBadge{margin-left:10px;padding:6px 10px;border-radius:999px;background:linear-gradient(90deg,#ff9de6,#9ad7ff,#b9ff9c);color:#111;font-weight:800;box-shadow:0 2px 10px rgba(0,0,0,.3)}
  @keyframes tBob{from{transform:translateY(0)}to{transform:translateY(-2px)}}
  /* wardrobe */
  .ward-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
  .ward-card{padding:12px;border-radius:12px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);display:grid;gap:8px}
  .ward-card .price{opacity:.85}
  .slot-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
  .slot{padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.06)}
  /* calendar embed */
  .cal-embed{width:100%;min-height:600px;border:0;border-radius:12px;box-shadow:0 0 0 1px rgba(255,255,255,.08) inset}
  /* minigame hub */
  .mg-menu{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
  .mg-card{border-radius:14px;padding:16px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);display:grid;gap:8px}
  canvas.game{touch-action:none;background:rgba(255,255,255,.02);border-radius:12px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
  .match-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:420px}
  .mm-card{height:88px;display:grid;place-items:center;border-radius:10px;background:rgba(255,255,255,.06);font-size:34px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);cursor:pointer}
  .mm-card.on{background:rgba(255,255,255,.12)}
  /* color match */
  .cm-grid{display:grid;grid-template-columns:repeat(4,70px);gap:10px;margin:10px 0}
  .cm-swatch{width:70px;height:70px;border-radius:8px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.25);cursor:pointer}
  /* whack */
  .whack-grid{display:grid;grid-template-columns:repeat(4,70px);gap:12px;margin:8px 0}
  .hole{width:70px;height:70px;border-radius:8px;background:rgba(0,0,0,.25);display:grid;place-items:center;font-size:34px;cursor:pointer;user-select:none}
  /* shape match */
  .shape-row{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}
  .shape-btn{padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.06);cursor:pointer}
  .shape-target{width:90px;height:90px;border-radius:10px;background:rgba(255,255,255,.06);display:grid;place-items:center;font-size:28px}
  `; document.head.appendChild(st);
})();

// ---------- FX ----------
function confettiBurst(x,y,count=120){
  const fx=$('#fxLayer'); if(!fx) return;
  const colors=['#00e5ff','#7cfb9a','#ffd166','#ff77e9','#9aa4ff','#ffadad','#caffbf'];
  for(let i=0;i<count;i++){
    const p=document.createElement('div'); p.style.position='fixed'; p.style.left=x+'px'; p.style.top=y+'px';
    const size=4+Math.random()*6; p.style.width=p.style.height=size+'px';
    p.style.background=colors[(Math.random()*colors.length)|0]; p.style.borderRadius='2px';
    const ang=Math.random()*2*Math.PI, speed=1.5+Math.random()*6, dur=600+Math.random()*800;
    const dx=Math.cos(ang)*speed, dy=Math.sin(ang)*speed;
    p.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx*40}px,${dy*40}px)`,opacity:0}],{duration:dur,easing:'ease-out'});
    setTimeout(()=>p.remove(), dur+60); fx.appendChild(p);
  }
}

// ---------- Character / Companion ----------
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
    card.onclick=()=>{ S.user.character={id:c.id,img:c.img,anim:'walk'}; save(); partyBanner(); hud(); renderWardrobe(); };
    grid.appendChild(card);
  });
  on($('#uploadChar'),'click',()=> $('#charFile')?.click());
  on($('#charFile'),'change',e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ S.user.character={id:'custom',img:r.result,anim:'walk'}; save(); partyBanner(); hud(); renderWardrobe(); }; r.readAsDataURL(f); });
  renderWardrobe();
}
const CHAR_ITEMS={
  head:[{id:'crown',name:'Crown',price:30,src:'assets/acc/crown.svg'},{id:'band',name:'Headband',price:15,src:'assets/acc/band.svg'}],
  face:[{id:'glasses',name:'Glasses',price:20,src:'assets/acc/glasses.svg'}],
  back:[{id:'cape',name:'Cape',price:25,src:'assets/acc/cape.svg'}],
  hand:[{id:'torch',name:'Torch',price:18,src:'assets/acc/torch.svg'}],
  body:[{id:'armor',name:'Leather Armor',price:35,src:'assets/acc/armor.svg'}],
};
function renderWardrobe(){
  const grid=$('#charGrid'); if(!grid) return;
  const wrap=document.createElement('section'); wrap.className='cardish'; wrap.innerHTML='<h3>Wardrobe</h3>';
  const slots=document.createElement('div'); slots.className='slot-row';
  Object.keys(S.equipChar).forEach(slot=>{ const v=S.equipChar[slot]; const s=document.createElement('div'); s.className='slot'; s.textContent=`${slot}: ${v||'—'}`; slots.appendChild(s); });
  wrap.appendChild(slots);
  const store=document.createElement('div'); store.className='ward-grid'; wrap.appendChild(store);
  const owned=new Set(S.economy.charOwned||[]);
  Object.entries(CHAR_ITEMS).forEach(([slot,arr])=>{
    arr.forEach(it=>{
      const card=document.createElement('div'); card.className='ward-card';
      card.innerHTML=`<div><strong>${it.name}</strong> <small class="price">🪙 ${it.price}</small></div>`;
      const btn=document.createElement('button'); const have=owned.has(it.id);
      btn.textContent= have ? `Equip to ${slot}` : `Buy for ${it.price}`;
      btn.className= have ? 'secondary' : 'primary';
      btn.onclick=()=>{
        if(!have){
          if((S.economy.gold||0) < it.price) return alert('Not enough gold');
          S.economy.gold-=it.price; owned.add(it.id); S.economy.charOwned=Array.from(owned); play(audio.coin);
        }
        S.equipChar[slot]=it.id; save(); hud(); partyBanner(); render(); // rerender to apply overlays
      };
      card.appendChild(btn); store.appendChild(card);
    });
  });
  grid.parentElement.appendChild(wrap);
}
function equipCharLayers(container){
  const map={...Object.fromEntries(Object.entries(CHAR_ITEMS).flatMap(([slot,arr])=>arr.map(it=>[it.id,it.src]))) };
  Object.entries(S.equipChar||{}).forEach(([slot,key])=>{
    if(!key||!map[key]) return; const img=new Image(); img.src=map[key]; img.className='acc '+slot; container.appendChild(img);
  });
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
function partyBanner(){
  const wrap=$('#partyBanner'); if(!wrap) return;
  wrap.innerHTML='';
  function tile(img, name){ const d=document.createElement('div'); d.className='card'; const s=document.createElement('div'); s.className='sprite'; const im=new Image(); im.src=img; s.appendChild(im); equipCharLayers(s); const n=document.createElement('div'); n.className='name'; n.textContent=name; d.append(s,n); return d; }
  if(S.user?.character?.img) wrap.appendChild(tile(S.user.character.img,'You'));
  for(const id of (S.party.companions||[])){ const c=CAT()[id]; if(c) wrap.appendChild(tile(c.img,c.name)); }
}

// ---------- Tasks (Quests) ----------
function tasks(){
  const main=$('#panelMain'), side=$('#panelSide'), bonus=$('#panelBonus'); if(!main||!side||!bonus) return;
  const all=S.log?.tasks||[{id:1,text:'Drink water',xp:5,gold:1,done:false},{id:2,text:'3‑min stretch',xp:5,gold:1,done:false}];
  const fill=(wrap,arr)=>{ wrap.innerHTML=''; arr.forEach(t=>{
    const row=document.createElement('div'); row.className='row task-row';
    const box=document.createElement('button'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
    box.onclick=()=>{ t.done=!t.done; if(t.done){ S.economy.gold+=(t.gold||1); S.pet.xp+=(t.xp||5); play(audio.ding); play(audio.coin); levelCheck(); hud(); const r=box.getBoundingClientRect(); confettiBurst(r.left+10,r.top); } save(); tasks(); };
    const label=document.createElement('div'); label.textContent=t.text; row.append(box,label); wrap.appendChild(row);
  }); };
  fill(main, all.filter((_,i)=>i<2)); fill(side, all.filter((_,i)=>i>=2 && i%3!==0)); fill(bonus, all.filter((_,i)=>i>=2 && i%3===0));
  on($('#addTaskBtn'),'click',()=>{ const title=$('#newTaskTitle')?.value.trim(); if(!title) return; S.log.tasks.push({id:Date.now(),text:title,xp:5,gold:1,done:false}); save(); tasks(); });
}

// ---------- Meals ----------
function meals(){ const grid=$('#mealGrid'); if(!grid) return;
  if(!Array.isArray(S.meals)||S.meals.length!==7) S.meals=Array.from({length:7},()=>({breakfast:'',lunch:'',dinner:''}));
  grid.innerHTML='';
  const make=(d,slot)=>{ const wrap=document.createElement('div'); wrap.className='meal-slot cardish'; const ta=document.createElement('textarea'); ta.placeholder=slot; ta.value=S.meals[d]?.[slot]||''; ta.oninput=()=>{ if(!S.meals[d]) S.meals[d]={breakfast:'',lunch:'',dinner:''}; S.meals[d][slot]=ta.value; save(); }; wrap.appendChild(ta); return wrap; };
  ['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach((name,idx)=>{ const col=document.createElement('div'); col.className='meal-day'; const head=document.createElement('div'); head.className='meal-head'; head.textContent=name; col.appendChild(head); col.appendChild(make(idx,'breakfast')); col.appendChild(make(idx,'lunch')); col.appendChild(make(idx,'dinner')); grid.appendChild(col); });
}

// ---------- Cleaning ----------
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
    const plus=document.createElement('button'); plus.className='secondary'; plus.textContent='+10%'; const saveBtn=document.createElement('button'); saveBtn.className='primary'; saveBtn.textContent='Save';
    const r1=document.createElement('div'); r1.className='row'; r1.append('Title:',t); const r2=document.createElement('div'); r2.className='row'; r2.append('Week:',w); const r3=document.createElement('div'); r3.className='row'; r3.append('Progress',barOut,plus,saveBtn);
    wrap.append(r1,r2,r3);
    const renderM=()=> barIn.style.width=(S.cleaning.monthly.progress||0)+'%';
    on(plus,'click',()=>{ S.cleaning.monthly.progress=Math.min(100,(S.cleaning.monthly.progress||0)+10); S.economy.gold+=8; S.pet.xp+=8; play(audio.ding); play(audio.coin); levelCheck(); save(); renderM(); });
    on(barOut,'click',()=>{ S.cleaning.monthly.progress=Math.min(100,(S.cleaning.monthly.progress||0)+5); S.economy.gold+=4; S.pet.xp+=4; play(audio.ding); play(audio.coin); levelCheck(); save(); renderM(); });
    on(saveBtn,'click',()=>{ S.cleaning.monthly.title=t.value; S.cleaning.monthly.week=parseInt(w.value||'1',10); save(); play(audio.ding); });
  }
}

// ---------- Co-Op (Toddler / Solo) ----------
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
      const onb=(S.toddler.collected||[]).includes(name);
      const b=document.createElement('div'); b.className='badge'+(onb?' on':''); const cb=document.createElement('button'); cb.className='checkbox'+(onb?' checked':''); cb.textContent=onb?'✓':'';
      cb.onclick=()=>{ const arr=S.toddler.collected||[]; const i=arr.indexOf(name); if(i>=0){arr.splice(i,1);} else {arr.push(name); toddlerReward(2,1,cb);} S.toddler.collected=arr; save(); coop(); };
      const label=document.createElement('span'); label.textContent=name; b.append(cb,label); col.appendChild(b);
    });
  }
  on($('#toggleWeek'),'click',()=>{ S.settings.toddler=!S.settings.toddler; save(); applyToddler(); coop(); });
}

// ---------- Calendar (with optional Google Calendar embed) ----------
function calendar(){
  const wrap=$('.calendar'); if(!wrap) return;
  wrap.querySelector('.row')?.remove(); // we'll add a config row under the header
  const cfg=document.createElement('div'); cfg.className='row';
  const inp=document.createElement('input'); inp.placeholder='Paste Google Calendar embed URL (optional)'; inp.value=S.settings.gcalEmbed||'';
  const saveBtn=document.createElement('button'); saveBtn.className='secondary'; saveBtn.textContent='Use Embed';
  cfg.append(inp,saveBtn); wrap.insertBefore(cfg, wrap.firstChild.nextSibling);
  on(saveBtn,'click',()=>{ S.settings.gcalEmbed=inp.value.trim(); save(); calendar(); });

  const grid=$('#weekGrid'); grid.innerHTML='';
  if(S.settings.gcalEmbed){
    const ifr=document.createElement('iframe'); ifr.className='cal-embed'; ifr.src=S.settings.gcalEmbed; grid.appendChild(ifr);
    const note=document.createElement('small'); note.textContent='Tip: Use Google Calendar’s “Settings → Integrate → Public URL to this calendar → Embed link”.'; grid.parentElement.appendChild(note);
    return;
  }
  // fallback: local weekly grid (simple)
  ['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach((name,idx)=>{
    const col=document.createElement('div'); col.className='cardish'; col.innerHTML=`<h3>${name}</h3>`;
    const list=document.createElement('div'); list.className='list'; list.id='calList'+idx; col.appendChild(list);
    grid.appendChild(col);
  });
  const addRow=document.createElement('div'); addRow.className='row';
  const t=$('#calText')||document.createElement('input'); t.id='calText'; t.placeholder='Add event…';
  const d=$('#calDay')||Object.assign(document.createElement('input'),{type:'number',min:'0',max:'6',value:'0'});
  const btn=$('#addCal')||Object.assign(document.createElement('button'),{textContent:'Add',className:'primary',id:'addCal'});
  addRow.append(t,d,btn); grid.parentElement.appendChild(addRow);
  on(btn,'click',()=>{ const txt=t.value.trim(); const day=parseInt(d.value||'0',10); if(!txt||isNaN(day)) return;
    const item=document.createElement('div'); item.className='row'; item.textContent=txt; $('#calList'+day).appendChild(item); t.value=''; play(audio.ding);
  });
}

// ---------- Pet (Toddler-only Birb) ----------
const PET_ACC=[
  {id:'bow',name:'Bow',slot:'head',price:5,src:'assets/acc/bow.svg'},
  {id:'hat',name:'Party Hat',slot:'head',price:8,src:'assets/acc/hat.svg'},
  {id:'sung',name:'Sunglasses',slot:'face',price:8,src:'assets/acc/glasses.svg'},
  {id:'cape',name:'Cape',slot:'back',price:10,src:'assets/acc/cape.svg'},
];
function pet(){
  const stage=$('#petStage'); if(!stage) return;
  const title=$('#petTitle');
  if(!S.settings.toddler){
    if(stage) stage.innerHTML='<p class="muted">The companion pet is <strong>Toddler Week</strong> only. Toggle toddler mode to play with Birb.</p>';
    if(title) title.textContent='Companion (Toddler-only)';
    return;
  }
  if(title) title.textContent='Your Companion Birb';
  stage.innerHTML='';
  const birb=document.createElement('div'); birb.className='sprite'; const img=new Image(); img.src='assets/pet/birb.png'; birb.appendChild(img);
  // overlay equipped
  const map=Object.fromEntries(PET_ACC.map(a=>[a.id,a.src]));
  Object.entries(S.equipPet||{}).forEach(([slot,id])=>{ if(!id||!map[id]) return; const ai=new Image(); ai.src=map[id]; ai.className='acc '+slot; birb.appendChild(ai); });
  stage.appendChild(birb);
  // store
  const store=$('#accStore'); if(store){ store.innerHTML=''; PET_ACC.forEach(a=>{
    const row=document.createElement('div'); row.className='row';
    const b=document.createElement('button'); const owned=(S.economy.petOwned||[]).includes(a.id); b.textContent= owned? `Equip ${a.name}` : `Buy ${a.name} • 🪙${a.price}`;
    b.onclick=()=>{ if(!owned){ if((S.toddler.profile.coins||0)<a.price) return alert('Not enough toddler coins'); S.toddler.profile.coins-=a.price; (S.economy.petOwned||=[]).push(a.id); S.economy.petOwned=uniq(S.economy.petOwned); play(audio.coin); }
      S.equipPet[a.slot]=a.id; save(); pet();
    };
    row.append(b, document.createTextNode(a.slot)); store.appendChild(row);
  });}
}

// ---------- Minigames (8 total) ----------
function minigames(){
  applyToddler();
  const view=$('#view'); if(!view) return;
  view.innerHTML='';
  const sec=document.createElement('section'); sec.className='cardish'; sec.innerHTML='<h2 class="dash">Toddler Minigames</h2>'; view.appendChild(sec);
  const P=S.toddler.profile; const prev=toddlerNeed(P.level), need=toddlerNeed(P.level+1); const pct=Math.max(0,Math.min(100,Math.round(((P.xp-prev)/(need-prev))*100)));
  const hdr=document.createElement('div'); hdr.innerHTML=`<strong>🧸 Player</strong> Lv ${P.level} • Coins: ${P.coins}<div class="tod-xp" style="width:200px"><div style="width:${pct}%"></div></div>`; sec.appendChild(hdr);
  const menu=document.createElement('section'); menu.className='mg-menu'; view.appendChild(menu);
  const games=[
    {key:'pop',   title:'Bubble Pop',   desc:'Tap bubbles (30s).',            play:gamePop},
    {key:'match', title:'Memory Match', desc:'Flip pairs.',                   play:gameMatch},
    {key:'catch', title:'Star Catch',   desc:'Catch falling stars.',          play:gameCatch},
    {key:'color', title:'Color Match',  desc:'Tap the named color!',          play:gameColor},
    {key:'balloon',title:'Balloon Float',desc:'Keep the balloon in the gap.', play:gameBalloon},
    {key:'simon', title:'Simon Lights', desc:'Repeat the sequence.',          play:gameSimon},
    {key:'whack', title:'Sticker Pop',  desc:'Tap slimes fast!',              play:gameWhack},
    {key:'shape', title:'Shape Match',  desc:'Match shapes and colors.',      play:gameShape},
  ];
  games.forEach(c=>{
    const card=document.createElement('div'); card.className='mg-card';
    const best=S.toddler.games?.[c.key]?.best||0, plays=S.toddler.games?.[c.key]?.plays||0;
    card.innerHTML=`<div><strong>${c.title}</strong></div><div>${c.desc}</div><small>Best: ${best} • Plays: ${plays}</small>`;
    const btn=document.createElement('button'); btn.className='primary'; btn.textContent='Play'; btn.onclick=()=>c.play(); card.appendChild(btn);
    menu.appendChild(card);
  });
  function back(){ const b=document.createElement('button'); b.className='secondary'; b.textContent='← Back to games'; b.onclick=()=>minigames(); return b; }

  // --- 1) Bubble Pop (slower) ---
  function gamePop(){
    view.innerHTML=''; const s=cardWrap('Bubble Pop'); const c=mkCanvas(s); s.appendChild(back());
    const ctx=c.getContext('2d'); let bubbles=[], score=0, end=Date.now()+30000, running=true;
    function spawn(){ bubbles.push({x:Math.random()*c.width,y:c.height+20,r:10+Math.random()*18,vy:-0.4-Math.random()*0.6}); }
    for(let i=0;i<20;i++) spawn();
    c.addEventListener('pointerdown', e=>{ const r=c.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top;
      bubbles.forEach(b=>{ const dx=b.x-x, dy=b.y-y; if(dx*dx+dy*dy<b.r*b.r){ b.y=-99; score++; toddlerReward(1,1,c); play(audio.ding); confettiBurst(e.clientX,e.clientY,24); } });
    });
    tick(()=>{
      bubbles.forEach(b=>{ b.y+=b.vy*5; }); bubbles=bubbles.filter(b=>b.y>-20); if(bubbles.length<24) spawn();
      ctx.clearRect(0,0,c.width,c.height); fillBg(ctx,c); bubbles.forEach(b=>{ drawBubble(ctx,b); }); drawHUD(ctx,c,score,end);
      if(Date.now()>=end){ running=false; finish('pop',score, Math.ceil(score/2)); return false; } return running;
    });
  }

  // --- 2) Memory Match ---
  function gameMatch(){
    view.innerHTML=''; const s=cardWrap('Memory Match'); const grid=document.createElement('div'); grid.className='match-grid'; s.appendChild(grid); s.appendChild(back());
    const em=['🦊','🐶','🐱','🐯','🐼','🐰','🐹','🦄']; const deck=shuffle([...em.slice(0,4),...em.slice(0,4)]);
    let first=null, lock=false, matched=0, moves=0, start=Date.now();
    deck.forEach(v=>{ const d=document.createElement('div'); d.className='mm-card'; d.dataset.v=v; d.textContent='?'; d.onclick=()=>{
      if(lock||d.classList.contains('on')) return; d.classList.add('on'); d.textContent=v; if(!first){ first=d; return; }
      moves++; if(first.dataset.v===v){ matched+=2; toddlerReward(2,1,d); first=null; if(matched===deck.length) done(); }
      else{ lock=true; setTimeout(()=>{ d.classList.remove('on'); d.textContent='?'; first.classList.remove('on'); first.textContent='?'; first=null; lock=false; },600); }
    }; grid.appendChild(d); });
    function done(){ const sec=Math.round((Date.now()-start)/1000); const score=Math.max(1,100-(sec+moves*5)); endGame('match', score, 5); }
  }

  // --- 3) Star Catch (slower) ---
  function gameCatch(){
    view.innerHTML=''; const s=cardWrap('Star Catch'); const c=mkCanvas(s); s.appendChild(back());
    const ctx=c.getContext('2d'); let x=c.width/2, score=0, t=0, running=true; const stars=[], clouds=[];
    function addStar(){ stars.push({x:Math.random()*c.width,y:-10,vy:1.0+Math.random()*1.2}); }
    function addCloud(){ clouds.push({x:Math.random()*c.width,y:-20,vy:1.2+Math.random()*1.1}); }
    for(let i=0;i<5;i++) addStar(); for(let j=0;j<2;j++) addCloud();
    c.addEventListener('pointermove', e=>{ const r=c.getBoundingClientRect(); x=e.clientX-r.left; });
    tick(()=>{
      t++; stars.forEach(s=>{ s.y+=s.vy; if(s.y>c.height+10){ s.y=-10; s.x=Math.random()*c.width; } if(Math.abs(s.x-x)<12 && s.y>c.height-28){ s.y=-10; s.x=Math.random()*c.width; score++; toddlerReward(1,1,c); } });
      clouds.forEach(cl=>{ cl.y+=cl.vy; if(cl.y>c.height+10){ cl.y=-10; cl.x=Math.random()*c.width; } if(Math.abs(cl.x-x)<12 && cl.y>c.height-28){ endGame('catch', score, Math.ceil(score/2)); return false; } });
      if(t%50===0) addStar(); if(t%140===0) addCloud();
      ctx.clearRect(0,0,c.width,c.height); fillBg(ctx,c); drawPaddle(ctx,c,x); drawStars(ctx,stars); drawClouds(ctx,clouds); drawScore(ctx,score);
      return true;
    });
  }

  // --- 4) Color Match (fix: explicit colors) ---
  function gameColor(){
    view.innerHTML=''; const s=cardWrap('Color Match'); const grid=document.createElement('div'); grid.className='cm-grid'; s.appendChild(grid); s.appendChild(back());
    const COLORS=[['Red','#ff4d4d'],['Blue','#4da3ff'],['Green','#5de27a'],['Yellow','#ffd84d'],['Purple','#c08cff'],['Orange','#ff9f4d'],['Pink','#ffa3d1'],['Teal','#4dffd8']];
    let score=0, end=Date.now()+25000; let target=null;
    function pick(){ target=COLORS[(Math.random()*COLORS.length)|0]; $('#cmPrompt').textContent='Tap: '+target[0]; grid.innerHTML='';
      const picks=shuffle([target, ...shuffle(COLORS.filter(c=>c!==target)).slice(0,3)]);
      picks.forEach(([name,hex])=>{ const sw=document.createElement('div'); sw.className='cm-swatch'; sw.style.background=hex; sw.onclick=()=>{
        if(name===target[0]){ score++; toddlerReward(1,1,sw); pick(); } else { sw.style.opacity='.4'; }
      }; grid.appendChild(sw); });
    }
    const p=document.createElement('div'); p.id='cmPrompt'; p.style.marginTop='6px'; s.appendChild(p); pick();
    const t=document.createElement('div'); t.style.marginTop='6px'; s.appendChild(t);
    const timer=setInterval(()=>{ const left=Math.max(0,Math.ceil((end-Date.now())/1000)); t.textContent='Time: '+left+'s'; if(left<=0){ clearInterval(timer); endGame('color', score, Math.ceil(score/2)); } },500);
  }

  // --- 5) Balloon Float (easier) ---
  function gameBalloon(){
    view.innerHTML=''; const s=cardWrap('Balloon Float'); const c=mkCanvas(s); s.appendChild(back());
    const ctx=c.getContext('2d'); let y=c.height*0.7, vy=0, score=0, running=true; const gaps=[]; let t=0;
    c.addEventListener('pointerdown', ()=>{ vy-=1.6; }); c.addEventListener('pointerup', ()=>{});
    tick(()=>{
      t++;
      if(t%70===0) gaps.push({x:c.width+20,y:40+Math.random()*(c.height-120),w:26,gap:80}); // slower spawn, wider gap
      y+=vy; vy+=0.08; if(y<10) { y=10; vy=0; } if(y>c.height-10){ endGame('balloon', score, Math.ceil(score/2)); return false; }
      gaps.forEach(g=>{ g.x-=1.2; if(g.x< -40) score++; });
      if(hitPipe()) { endGame('balloon', score, Math.ceil(score/2)); return false; }
      ctx.clearRect(0,0,c.width,c.height); fillBg(ctx,c);
      // pipes
      ctx.fillStyle='rgba(255,255,255,.15)'; gaps.forEach(g=>{ ctx.fillRect(g.x,0,g.w,g.y); ctx.fillRect(g.x,g.y+g.gap,g.w,c.height-(g.y+g.gap)); });
      // balloon
      ctx.fillStyle='#ff6fa3'; ctx.beginPath(); ctx.arc(30,y,12,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(28,y+12,4,10);
      drawScore(ctx,score);
      return true;
    });
    function hitPipe(){ return gaps.some(g=> (30+12>g.x && 30-12<g.x+g.w) && (y-12<g.y || y+12>g.y+g.gap)); }
  }

  // --- 6) Simon Lights ---
  function gameSimon(){
    view.innerHTML=''; const s=cardWrap('Simon Lights');
    const pads=[['#ff6b6b'],['#4dabf7'],['#51cf66'],['#ffd43b']].map((c,i)=>{ const d=document.createElement('div'); d.style.width='120px'; d.style.height='120px'; d.style.borderRadius='16px'; d.style.margin='8px'; d.style.background=c[0]; d.style.opacity='.7'; d.style.display='inline-block'; d.dataset.idx=i; s.appendChild(d); return d; });
    s.appendChild(back());
    let seq=[], step=0, playing=false, score=0;
    function flash(i){ pads[i].animate([{opacity:.7},{opacity:1},{opacity:.7}],{duration:300}); play(audio.ding); }
    function round(){ playing=true; seq.push((Math.random()*pads.length)|0); step=0; show(0); }
    function show(i){ if(i>=seq.length){ playing=false; return; } flash(seq[i]); setTimeout(()=>show(i+1), 420); }
    pads.forEach(p=> p.onclick=()=>{ if(playing) return; const i=parseInt(p.dataset.idx,10); flash(i); if(i===seq[step]){ step++; if(step===seq.length){ score++; toddlerReward(2,1,p); setTimeout(round, 500); } } else { endGame('simon', score, 3+score); } });
    round();
  }

  // --- 7) Sticker Pop (Whack-a-Slime) ---
  function gameWhack(){
    view.innerHTML=''; const s=cardWrap('Sticker Pop'); const grid=document.createElement('div'); grid.className='whack-grid'; s.appendChild(grid); s.appendChild(back());
    const holes=Array.from({length:12},()=>{ const h=document.createElement('div'); h.className='hole'; h.textContent=' '; grid.appendChild(h); return h; });
    let score=0, end=Date.now()+20000;
    const timer=setInterval(()=>{
      holes.forEach(h=> h.textContent=' ');
      const idx=(Math.random()*holes.length)|0; const h=holes[idx]; h.textContent='🟢';
      const kill=()=>{ if(h.textContent==='🟢'){ h.textContent='✨'; score++; toddlerReward(1,1,h); } };
      h.onclick=kill;
      if(Date.now()>=end){ clearInterval(timer); endGame('whack', score, Math.ceil(score/2)); }
    }, 650);
  }

  // --- 8) Shape Match ---
  function gameShape(){
    view.innerHTML=''; const s=cardWrap('Shape Match'); const row=document.createElement('div'); row.className='shape-row'; s.appendChild(row);
    const shapes=[['▲','Triangle'],['■','Square'],['●','Circle'],['★','Star']]; const targets=document.createElement('div'); targets.className='shape-row'; s.appendChild(targets); s.appendChild(back());
    let score=0; const picks=shuffle(shapes.slice()); picks.forEach(([sym,name])=>{ const b=document.createElement('div'); b.className='shape-btn'; b.textContent=sym+' '+name; b.dataset.name=name; row.appendChild(b); });
    const wants=shuffle(shapes.slice()); wants.forEach(([sym,name])=>{ const t=document.createElement('div'); t.className='shape-target'; t.textContent=sym; t.dataset.name=name; targets.appendChild(t); });
    let selected=null;
    row.addEventListener('click', e=>{ const b=e.target.closest('.shape-btn'); if(!b) return; selected=b; row.querySelectorAll('.shape-btn').forEach(x=>x.style.outline=''); b.style.outline='2px solid #fff'; });
    targets.addEventListener('click', e=>{ const t=e.target.closest('.shape-target'); if(!t||!selected) return;
      if(t.dataset.name===selected.dataset.name){ score++; toddlerReward(2,1,t); t.style.background='rgba(255,255,255,.2)'; selected.remove(); selected=null; if(row.children.length===0){ endGame('shape', score, 4); } }
      else{ t.animate([{transform:'scale(1)'},{transform:'scale(.95)'},{transform:'scale(1)'}],{duration:220}); }
    });
  }

  // ---- helpers for games ----
  function cardWrap(title){ const s=document.createElement('section'); s.className='cardish'; s.innerHTML=`<h2 class="dash">${title}</h2>`; view.appendChild(s); return s; }
  function mkCanvas(sec){ const c=document.createElement('canvas'); c.width=420; c.height=260; c.className='game'; sec.appendChild(c); return c; }
  function tick(step){ function loop(){ if(step()!==false) requestAnimationFrame(loop); } loop(); }
  function endGame(key,score,coins){ const g=S.toddler.games[key]; g.best=Math.max(g.best||0,score); g.plays=(g.plays||0)+1; save(); const m=document.createElement('div'); m.style.marginTop='8px'; m.innerHTML=`Score ${score}. (+${coins} coins)`; $('#view').appendChild(m); toddlerReward(Math.max(2,Math.ceil(score/2)), coins, m); }
  function fillBg(ctx,c){ ctx.fillStyle='rgba(255,255,255,.03)'; ctx.fillRect(0,0,c.width,c.height); }
  function drawHUD(ctx,c,score,endAt){ ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18); const left=Math.max(0,Math.ceil((endAt-Date.now())/1000)); ctx.fillText('Time: '+left+'s',c.width-70,18); }
  function drawBubble(ctx,b){ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle='rgba(173,216,230,.6)'; ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.lineWidth=2; ctx.stroke(); }
  function drawPaddle(ctx,c,x){ ctx.fillStyle='#ffdd57'; ctx.fillRect(x-12,c.height-20,24,10); ctx.fillStyle='#fff'; ctx.fillRect(x-8,c.height-28,16,8); }
  function drawStars(ctx,stars){ ctx.fillStyle='#ffe680'; stars.forEach(s=>{ ctx.beginPath(); ctx.arc(s.x,s.y,4,0,Math.PI*2); ctx.fill(); }); }
  function drawClouds(ctx,clouds){ ctx.fillStyle='rgba(200,200,255,.6)'; clouds.forEach(cl=>{ ctx.beginPath(); ctx.arc(cl.x,cl.y,8,0,Math.PI*2); ctx.fill(); }); }
  function drawScore(ctx,score){ ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18); }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j]]=[a[j],a[i]][1]; } return a; } // silly swap to shrink line length
}

// ---------- Router ----------
const map={home:'tpl-home',tasks:'tpl-tasks',clean:'tpl-clean',coop:'tpl-coop',budget:'tpl-budget',meals:'tpl-meals',calendar:'tpl-calendar',shop:'tpl-shop',characters:'tpl-characters',companion:'tpl-companion',breathe:'tpl-breathe',minigames:'tpl-minigames',journal:'tpl-journal',checkin:'tpl-checkin',rewards:'tpl-rewards',settings:'tpl-settings',pet:'tpl-pet'};
const alias={quests:'tasks',cleaning:'clean'};
let LAST='';
function route(){ const raw=(location.hash||'#home').slice(1)||'home'; return alias[raw]||raw; }
function render(){
  const name=route(); if(name===LAST) return; LAST=name;
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
  if(name==='calendar') calendar();
  if(name==='pet') pet();
  window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange', ()=>requestAnimationFrame(render));
$('.top-nav')?.addEventListener('click', e=>{ const b=e.target.closest('[data-route]'); if(!b) return; e.preventDefault(); location.hash='#'+b.dataset.route; });

// ---------- Boot ----------
hud(); toddlerHud(); render();
console.log('SootheBirb v2.5+ loaded');