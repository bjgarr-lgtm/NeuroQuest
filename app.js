'use strict';
/* SootheBirb — 8 Games + Character Gear + Toddler‑only Pet (drop-in for v2.5.0)
   WHAT'S IN HERE
   - 8 toddler minigames, tuned slower: pop, match, catch, color tap, whack, shape sort, hop runner, balloon rise
   - Toddler‑only Pet/Birb with accessories & shop (shown only when toddler week is ON)
   - Adult Character customization (gear slots, shop, procedural items) — gold/XP driven
   - Retains party HUD, meals, cleaning rewards, quests → gold/xp + confetti + sfx
   - All UI changes are injected CSS; HTML templates remain the same as your base

   NOTE: This file assumes the same templates from 2.5.0 exist (tpl-... ids).
*/

/* ---------------- State & helpers ---------------- */
const KEY='sb.v2.5.0.state';
const defaults=()=>({settings:{toddler:false,music:false},
  economy:{gold:0,ownedAcc:[]}, equip:{head:null,face:null,body:null,back:null,hand:null},
  user:{character:null}, party:{companions:[]},
  // adult xp track (kept from previous)
  pet:{level:1,xp:0},
  // toddler domain
  toddler:{
    profile:{level:1,xp:0,coins:0},
    games:{pop:{best:0,plays:0},match:{best:0,plays:0},catch:{best:0,plays:0},color:{best:0,plays:0},whack:{best:0,plays:0},shape:{best:0,plays:0},hop:{best:0,plays:0},balloon:{best:0,plays:0}},
    collected:[],
    questsDone:[],
    pet:{name:'Birb',species:'birb',acc:{hat:null,face:null,back:null}}
  },
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
function deep(a,b){ if(Array.isArray(a)) return (b??a).slice(); if(a&&typeof a==='object'){const o={...a}; for(const k of Object.keys(b||{})) o[k]=deep(a[k],b[k]); return o;} return b===undefined?a:b; }
let S; try{ S=deep(defaults(), JSON.parse(localStorage.getItem(KEY)||'{}')) } catch{ S=defaults(); }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch{} }

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const on=(el,ev,fn)=>el&&el.addEventListener(ev,fn,{passive:true});
const uniq=a=>Array.from(new Set(a||[]));

// Audio (graceful degradation)
const audio={ ding:new Audio('assets/sfx/ding.wav'), coin:new Audio('assets/sfx/coin.wav'), level:new Audio('assets/sfx/level.wav') };
function play(a){ if(!a||!a.play) return; try{ a.currentTime=0; a.play(); }catch{} }

const xpNeed = l => l*l*10;
const toddlerNeed = l => 15+Math.round(l*l*6);
function confettiBurst(x,y,count=120){
  const fx=$('#fxLayer'); if(!fx) return;
  const colors=['#00e5ff','#7cfb9a','#ffd166','#ff77e9','#9aa4ff','#ffadad','#caffbf'];
  for(let i=0;i<count;i++){
    const p=document.createElement('div'); p.style.position='fixed'; p.style.left=x+'px'; p.style.top=y+'px';
    p.style.width=p.style.height=(4+Math.random()*6)+'px';
    p.style.background=colors[(Math.random()*colors.length)|0]; p.style.borderRadius='2px';
    const ang=Math.random()*2*Math.PI, speed=1+Math.random()*5, dur=700+Math.random()*900;
    const dx=Math.cos(ang)*speed, dy=Math.sin(ang)*speed;
    p.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx*40}px,${dy*40}px)`,opacity:0}],{duration:dur,easing:'ease-out'});
    setTimeout(()=>p.remove(), dur+60); fx.appendChild(p);
  }
}

/* ---------------- Cosmetic CSS (injected) ---------------- */
(function(){
  const st=document.createElement('style'); st.textContent=`
    .sprite{width:92px;height:92px;position:relative}
    .sprite img{width:100%;height:100%;object-fit:contain;image-rendering:auto}
    @media (max-width:700px){ .sprite{width:76px;height:76px} }
    .hud .avatars{display:flex;gap:6px;align-items:center;margin-right:12px}
    .hud .avatars .hud-ava{width:28px;height:28px;border-radius:6px;image-rendering:pixelated;box-shadow:0 0 0 2px rgba(255,255,255,.08) inset,0 0 6px rgba(0,255,255,.25)}
    .hud .avatars .hud-ava.you{box-shadow:0 0 0 2px rgba(255,215,0,.5) inset,0 0 8px rgba(255,215,0,.3)}
    /* toddler theme */
    body.toddler .app-header{box-shadow:0 0 0 2px rgba(255,255,255,.05) inset, 0 0 24px #ff9de6}
    body.toddler .top-nav .nav-btn{animation: tod-bob 2.2s ease-in-out infinite alternate}
    #todBadge{margin-left:10px;padding:6px 10px;border-radius:999px;background:linear-gradient(90deg,#ff9de6,#9ad7ff,#b9ff9c); color:#111;font-weight:800; box-shadow:0 2px 10px rgba(0,0,0,.3)}
    .tod-xp{height:8px;background:#0006;border-radius:8px;overflow:hidden}
    .tod-xp>div{height:100%;background:linear-gradient(90deg,#8ef3ff,#ffd166,#ffa3ff)}
    @keyframes tod-bob{from{transform:translateY(0)}to{transform:translateY(-2px)}}
    /* meals */
    .meal-grid{display:grid;grid-template-columns:repeat(7,minmax(160px,1fr));gap:16px}
    .meal-day{display:grid;grid-template-rows:auto 1fr 1fr 1fr;gap:10px}
    .meal-head{display:flex;align-items:center;justify-content:center;padding:8px;border-radius:12px;background:rgba(255,255,255,.05)}
    .meal-slot{border-radius:12px;overflow:hidden}
    .meal-slot textarea{width:100%;min-height:90px;border:none;background:transparent;color:inherit;padding:12px;resize:vertical}
    /* minigames hub */
    .mg-menu{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
    .mg-card{border-radius:14px;padding:16px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);display:grid;gap:8px}
    canvas.game{touch-action:none;background:rgba(255,255,255,.02);border-radius:12px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
    .match-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:420px}
    .mm-card{height:88px;display:grid;place-items:center;border-radius:10px;background:rgba(255,255,255,.06);font-size:34px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);cursor:pointer}
    .mm-card.on{background:rgba(255,255,255,.12)}
    /* party banner text contrast */
    .party-banner .name{color:#000;filter:drop-shadow(0 1px 0 #fff3)}
    /* gear chips */
    .chip{display:inline-flex;gap:6px;align-items:center;border-radius:999px;padding:6px 10px;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}
    .gear-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
    .gear-card{padding:10px;border-radius:12px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);display:grid;gap:6px}
    .sprite .equip{position:absolute;pointer-events:none;filter:drop-shadow(0 1px 0 rgba(0,0,0,.3))}
    .equip.head{top:-12px;left:18px;width:48px;height:32px}
    .equip.face{top:26px;left:34px;width:30px;height:18px}
    .equip.back{top:18px;left:12px;width:76px;height:76px;opacity:.85}
    .equip.hand{top:42px;left:58px;width:22px;height:22px}
    .equip.body{top:36px;left:22px;width:56px;height:50px;opacity:.9}
  `; document.head.appendChild(st);
})();

/* ---------------- HUD & party ---------------- */
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

/* ---------------- Toddler UI & toggle behavior ---------------- */
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
  // hide PET route button when not toddler (pet is for toddler only)
  const petBtn=$('.top-nav [data-route="pet"]'); if(petBtn) petBtn.style.display = S.settings.toddler? '' : 'none';
  const tag=$('#coopWeek'); if(tag) tag.textContent = S.settings.toddler ? 'Toddler Week' : 'Solo Week';
  toddlerHud();
}
function toddlerReward(xp=3,coins=1,at=null){
  const P=S.toddler.profile; P.xp+=xp; P.coins+=coins; play(audio.ding); play(audio.coin); save();
  const need=toddlerNeed(P.level+1), prev=toddlerNeed(P.level); if(P.xp>=need){ P.level++; play(audio.level); }
  toddlerHud();
  if(at){ const r=at.getBoundingClientRect(); confettiBurst(r.left+r.width/2, r.top, 120); }
}

/* ---------------- Party banner (shows gear overlays for the hero) ---------------- */
function partyBanner(){
  const wrap=$('#partyBanner'); if(!wrap) return;
  wrap.innerHTML='';
  function tile(img, name, equip=null){ const d=document.createElement('div'); d.className='card'; const s=document.createElement('div'); s.className='sprite'; const im=new Image(); im.src=img; s.appendChild(im);
    // overlay equipped
    if(equip){ for(const slot of Object.keys(equip)){ const it=equip[slot]; if(!it) continue; const ov=document.createElement('div'); ov.className='equip '+slot; ov.innerHTML=itemArt(it); s.appendChild(ov); } }
    const n=document.createElement('div'); n.className='name'; n.textContent=name; d.append(s,n); return d; }
  if(S.user?.character?.img) wrap.appendChild(tile(S.user.character.img, 'You', S.equip));
  for(const id of (S.party.companions||[])){ const c=CAT()[id]; if(c) wrap.appendChild(tile(c.img,c.name)); }
}

/* ---------------- Characters & Companions ---------------- */
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
    card.onclick=()=>{ S.user.character={id:c.id,img:c.img,anim:'idle'}; save(); partyBanner(); hud(); /* Stay here to manage gear */ };
    grid.appendChild(card);
  });
  // uploader
  on($('#uploadChar'),'click',()=> $('#charFile')?.click());
  on($('#charFile'),'change',e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ S.user.character={id:'custom',img:r.result,anim:'idle'}; save(); partyBanner(); hud(); }; r.readAsDataURL(f); });

  // Append Gear section (adult only)
  const host=grid.closest('section');
  const gear=document.createElement('section'); gear.className='cardish'; gear.innerHTML=`
    <h3>Character Gear</h3>
    <div class="row"><div class="sprite" id="gearSprite"></div><div id="gearStats"></div></div>
    <h4>Owned</h4><div class="gear-grid" id="ownedGrid"></div>
    <h4>Shop</h4><div class="gear-grid" id="gearShop"></div>
    <div class="row"><button id="btnGen" class="secondary">✨ Generate Random Item</button></div>`;
  host.after(gear);
  renderGear();
}
function itemArt(it){
  // Tiny inline SVGs for items. Simple shapes keep this self‑contained.
  const color = (it.color||'#ffd166');
  if(it.slot==='head')  return `<svg viewBox="0 0 64 32"><rect x="6" y="4" rx="6" ry="6" width="52" height="22" fill="${color}" stroke="#0006"/></svg>`;
  if(it.slot==='face')  return `<svg viewBox="0 0 64 24"><circle cx="18" cy="12" r="6" fill="${color}"/><circle cx="46" cy="12" r="6" fill="${color}"/></svg>`;
  if(it.slot==='back')  return `<svg viewBox="0 0 80 80"><rect x="6" y="6" width="68" height="68" rx="12" fill="${color}" opacity=".85"/></svg>`;
  if(it.slot==='hand')  return `<svg viewBox="0 0 32 32"><rect x="6" y="6" width="20" height="20" rx="4" fill="${color}"/></svg>`;
  if(it.slot==='body')  return `<svg viewBox="0 0 60 50"><rect x="2" y="2" width="56" height="46" rx="10" fill="${color}" opacity=".9"/></svg>`;
  return `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="${color}"/></svg>`;
}
const baseShop=[
  {id:'cap_gold',name:'Gold Cap',slot:'head',cost:30,color:'#ffd166',rarity:'uncommon'},
  {id:'mask_neon',name:'Neon Visor',slot:'face',cost:40,color:'#7cfb9a',rarity:'uncommon'},
  {id:'cloak_purp',name:'Mage Cloak',slot:'back',cost:80,color:'#b98bff',rarity:'rare'},
  {id:'glove_dark',name:'Dark Glove',slot:'hand',cost:25,color:'#aab4ff',rarity:'common'},
  {id:'armor_teal',name:'Teal Armor',slot:'body',cost:70,color:'#66ffd1',rarity:'rare'}
];
function renderGear(){
  const spr=$('#gearSprite'); if(!spr) return;
  spr.innerHTML='';
  if(S.user?.character?.img){ const base=new Image(); base.src=S.user.character.img; spr.appendChild(base); }
  for(const slot of Object.keys(S.equip)){ const it=S.equip[slot]; if(!it) continue; const ov=document.createElement('div'); ov.className='equip '+slot; ov.innerHTML=itemArt(it); spr.appendChild(ov); }
  const owned=$('#ownedGrid'); if(owned){ owned.innerHTML=''; (S.economy.ownedAcc||[]).forEach(it=>{
    const c=document.createElement('div'); c.className='gear-card';
    c.innerHTML=`<div class="chip">🧩 ${it.name} · <small>${it.slot}</small> · <em>${it.rarity||'common'}</em></div><div class="sprite small">${itemArt(it)}</div>`;
    const row=document.createElement('div'); row.className='row';
    const eq=document.createElement('button'); eq.className='primary'; eq.textContent='Equip'; eq.onclick=()=>{ S.equip[it.slot]=it; save(); partyBanner(); renderGear(); };
    const de=document.createElement('button'); de.className='secondary'; de.textContent='Unequip'; de.onclick=()=>{ if(S.equip[it.slot]?.id===it.id) S.equip[it.slot]=null; save(); partyBanner(); renderGear(); };
    row.append(eq,de); c.appendChild(row); owned.appendChild(c);
  }); }
  const shop=$('#gearShop'); if(shop){ shop.innerHTML=''; baseShop.concat(procGen(3)).forEach(it=>{
    const c=document.createElement('div'); c.className='gear-card'; c.innerHTML=`<div class="chip">💰 ${it.cost}</div><strong>${it.name}</strong><div class="sprite small">${itemArt(it)}</div><small>${it.slot} · ${it.rarity||'common'}</small>`;
    const b=document.createElement('button'); b.className='primary'; b.textContent='Buy'; b.onclick=()=>{
      if((S.economy.gold||0)<it.cost){ alert('Not enough gold!'); return; }
      S.economy.gold-=it.cost; (S.economy.ownedAcc=S.economy.ownedAcc||[]).push(it); save(); hud(); renderGear(); play(audio.coin);
    };
    c.appendChild(b); shop.appendChild(c);
  }); }
  const stats=$('#gearStats'); if(stats){ const total=(S.economy.ownedAcc||[]).length; stats.innerHTML=`<div class="chip">🪙 ${S.economy.gold||0}</div> <div class="chip">Items: ${total}</div>`; }
  on($('#btnGen'),'click',()=>{ const it=procGen(1)[0]; (S.economy.ownedAcc=S.economy.ownedAcc||[]).push(it); save(); renderGear(); play(audio.ding); });
}
function procGen(n=1){
  const slots=['head','face','back','hand','body']; const colors=['#ffd166','#ff77e9','#9aa4ff','#7cfb9a','#66ffd1','#ffadad','#b98bff'];
  const names=['Spark','Shadow','Comet','Rune','Nova','Drift','Echo','Hex','Pulse','Glimmer'];
  const rar=['common','uncommon','rare','epic']; const arr=[];
  for(let i=0;i<n;i++){ const slot=slots[(Math.random()*slots.length)|0]; const color=colors[(Math.random()*colors.length)|0];
    const r=rar[(Math.random()*rar.length)|0]; const cost={common:20,uncommon:40,rare:70,epic:110}[r];
    arr.push({id:'gen_'+Date.now()+'_'+i, name:`${names[(Math.random()*names.length)|0]} ${slot}`, slot, color, cost, rarity:r});
  } return arr;
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

/* ---------------- Adult Tasks / Meals / Cleaning (with rewards) ---------------- */
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
function meals(){ const grid=$('#mealGrid'); if(!grid) return;
  if(!Array.isArray(S.meals)||S.meals.length!==7) S.meals=Array.from({length:7},()=>({breakfast:'',lunch:'',dinner:''}));
  grid.innerHTML='';
  const mk=(d,slot)=>{ const wrap=document.createElement('div'); wrap.className='meal-slot cardish'; const ta=document.createElement('textarea'); ta.placeholder=slot; ta.value=S.meals[d]?.[slot]||''; ta.oninput=()=>{ if(!S.meals[d]) S.meals[d]={breakfast:'',lunch:'',dinner:''}; S.meals[d][slot]=ta.value; save(); }; wrap.appendChild(ta); return wrap; };
  ['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach((name,idx)=>{ const col=document.createElement('div'); col.className='meal-day';
    const head=document.createElement('div'); head.className='meal-head'; head.textContent=name; col.appendChild(head);
    col.appendChild(mk(idx,'breakfast')); col.appendChild(mk(idx,'lunch')); col.appendChild(mk(idx,'dinner')); grid.appendChild(col);
  });
}
function cleaning(){
  const prog=$('#bossProg'); if(!prog) return;
  const nameIn=$('#bossName'); const plus=$('#bossTick'); const set=$('#bossNew');
  const render=()=>{ prog.style.width=Math.min(100,Math.max(0,Math.round(S.cleaning.weeklyBoss.progress||0)))+'%'; $('#bossList').textContent='Boss: '+(S.cleaning.weeklyBoss.name||'—'); };
  const reward=(amt=10)=>{ S.economy.gold+=amt; S.pet.xp+=amt; play(audio.ding); play(audio.coin); levelCheck(); hud(); const r=prog.getBoundingClientRect(); confettiBurst(r.left+r.width/2, r.top-8); save(); };
  const bump=d=>{ S.cleaning.weeklyBoss.progress=Math.min(100,(S.cleaning.weeklyBoss.progress||0)+d); reward(S.cleaning.weeklyBoss.progress>=100?30:5); render(); };
  on(plus,'click',()=>bump(10)); on(prog.parentElement,'click',()=>bump(5)); on(set,'click',()=>{ const v=(nameIn?.value||'').trim(); if(v){ S.cleaning.weeklyBoss.name=v; save(); render(); } }); render();
  const wrap=$('#raidInfo'); if(wrap){ wrap.innerHTML=''; const t=input('Raid title',S.cleaning.monthly.title||''); const w=inputNum('Week',S.cleaning.monthly.week||1);
    const barOut=bar(S.cleaning.monthly.progress||0); const plus=document.createElement('button'); plus.className='secondary'; plus.textContent='+10%';
    const saveBtn=document.createElement('button'); saveBtn.className='primary'; saveBtn.textContent='Save';
    wrap.append(row(t.el),row(w.el),row(document.createTextNode('Progress'),barOut.out,plus,saveBtn));
    const renderM=()=> barOut.in.style.width=(S.cleaning.monthly.progress||0)+'%';
    on(plus,'click',()=>{ S.cleaning.monthly.progress=Math.min(100,(S.cleaning.monthly.progress||0)+10); S.economy.gold+=8; S.pet.xp+=8; play(audio.ding); play(audio.coin); levelCheck(); save(); renderM(); });
    on(barOut.out,'click',()=>{ S.cleaning.monthly.progress=Math.min(100,(S.cleaning.monthly.progress||0)+5); S.economy.gold+=4; S.pet.xp+=4; play(audio.ding); play(audio.coin); levelCheck(); save(); renderM(); });
    on(saveBtn,'click',()=>{ S.cleaning.monthly.title=t.get(); S.cleaning.monthly.week=w.get(); save(); play(audio.ding); });
  }
  function input(ph,val){ const el=document.createElement('input'); el.placeholder=ph; el.value=val; return {el,get:()=>el.value}; }
  function inputNum(ph,val){ const el=document.createElement('input'); el.type='number'; el.min='1'; el.max='5'; el.value=val; return {el,get:()=>parseInt(el.value||'1',10)}; }
  function bar(p){ const out=document.createElement('div'); out.className='xp-bar'; const inn=document.createElement('div'); inn.style.width=p+'%'; out.appendChild(inn); return {out,in:inn}; }
  function row(...nodes){ const r=document.createElement('div'); r.className='row'; nodes.forEach(n=>r.append(n)); return r; }
}

/* ---------------- Co‑Op / Toddler Week & Toddler Pet ---------------- */
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
    const rowBtn=document.createElement('div'); rowBtn.className='row';
    const mg=document.createElement('button'); mg.className='primary'; mg.textContent='Open Minigames Hub'; mg.onclick=()=>{ location.hash='#minigames'; };
    rowBtn.append(mg); list.appendChild(rowBtn);
    // collectibles
    const items=S.coop.toddler.collect||[]; items.forEach(name=>{
      const on=(S.toddler.collected||[]).includes(name);
      const b=document.createElement('div'); b.className='badge'+(on?' on':''); const cb=document.createElement('button'); cb.className='checkbox'+(on?' checked':''); cb.textContent=on?'✓':'';
      cb.onclick=()=>{ const arr=S.toddler.collected||[]; const i=arr.indexOf(name); if(i>=0){arr.splice(i,1);} else {arr.push(name); toddlerReward(2,1,cb);} S.toddler.collected=arr; save(); coop(); };
      const label=document.createElement('span'); label.textContent=name; b.append(cb,label); col.appendChild(b);
    });
  }
  on($('#toggleWeek'),'click',()=>{ S.settings.toddler=!S.settings.toddler; save(); applyToddler(); coop(); });
}
function petPage(){
  // toddler‑only birb
  const stage=$('#petStage'); const stats=$('#petStats'); const form=$('#petForm'), title=$('#petTitle');
  if(!stage) return;
  if(!S.settings.toddler){
    // adults: show hint
    title.textContent='Companion — (Toddler Only)';
    stage.innerHTML='<div class="cardish">The pet/birb is available in Toddler Week. Adults customize gear on the Character page.</div>';
    if(stats) stats.textContent=''; if(form) form.style.display='none';
    return;
  }
  title.textContent='Your Birb';
  if(form) form.style.display='';
  stage.innerHTML=''; stats.innerHTML='';
  const birb=document.createElement('div'); birb.className='sprite'; birb.style.width='128px'; birb.style.height='128px';
  const base=document.createElement('div'); base.className='equip body'; base.innerHTML='<svg viewBox="0 0 60 50"><ellipse cx="30" cy="30" rx="26" ry="18" fill="#ffd166"/><circle cx="22" cy="22" r="4" fill="#000"/></svg>';
  birb.appendChild(base);
  const slots=['hat','face','back'];
  slots.forEach(slot=>{ const it=S.toddler.pet.acc[slot]; if(it){ const ov=document.createElement('div'); ov.className='equip '+(slot==='hat'?'head':slot); ov.innerHTML=itemArt(it); birb.appendChild(ov); } });
  stage.appendChild(birb);
  // accessories store for toddler (simple/cheap)
  const accList=$('#accList'); const store=$('#accStore'); if(accList) accList.innerHTML=''; if(store) store.innerHTML='';
  const todShop=[
    {id:'t_hat',name:'Tiny Hat',slot:'hat',color:'#ff77e9',cost:3},
    {id:'t_glasses',name:'Silly Glasses',slot:'face',color:'#9aa4ff',cost:3},
    {id:'t_cape',name:'Cape',slot:'back',color:'#7cfb9a',cost:5}
  ];
  todShop.forEach(it=>{
    const c=document.createElement('div'); c.className='row'; c.innerHTML=`<div class="chip">🪙 ${it.cost}</div><div>${it.name}</div>`;
    const b=document.createElement('button'); b.textContent='Buy'; b.className='primary';
    b.onclick=()=>{ if(S.toddler.profile.coins<it.cost){ alert('Need more toddler coins!'); return; } S.toddler.profile.coins-=it.cost; S.toddler.pet.acc[it.slot]=it; save(); petPage(); toddlerHud(); play(audio.coin); };
    c.appendChild(b); store.appendChild(c);
  });
  // name/species form
  const nm=$('#petName'), sp=$('#petSpecies'); if(nm) nm.value=S.toddler.pet.name||'Birb'; if(sp) sp.value=S.toddler.pet.species||'birb';
  on($('#savePet'),'click',()=>{ const nmv=nm?.value||'Birb'; const spv=sp?.value||'birb'; S.toddler.pet.name=nmv; S.toddler.pet.species=spv; save(); play(audio.ding); });
}

/* ---------------- Minigames hub (8 games, slower) ---------------- */
function minigames(){
  applyToddler();
  const view=$('#view'); if(!view) return;
  view.innerHTML='';
  const sec=document.createElement('section'); sec.className='cardish'; sec.innerHTML='<h2 class=\"dash\">Toddler Minigames</h2>'; view.appendChild(sec);
  const P=S.toddler.profile; const prev=toddlerNeed(P.level), need=toddlerNeed(P.level+1); const pct=Math.max(0,Math.min(100,Math.round(((P.xp-prev)/(need-prev))*100)));
  const hdr=document.createElement('div'); hdr.innerHTML=`<strong>🧸 Player</strong> Lv ${P.level} • Coins: ${P.coins}<div class="tod-xp" style="width:200px"><div style="width:${pct}%"></div></div>`; sec.appendChild(hdr);
  const menu=document.createElement('section'); menu.className='mg-menu'; view.appendChild(menu);
  const cards=[
    {key:'pop',   title:'Bubble Pop',   desc:'Tap floating bubbles (30s).',     play:gamePop},
    {key:'match', title:'Memory Match', desc:'Flip cards to find all pairs.',    play:gameMatch},
    {key:'catch', title:'Star Catch',   desc:'Move to catch falling stars.',     play:gameCatch},
    {key:'color', title:'Color Tap',    desc:'Tap circles matching the color.',  play:gameColor},
    {key:'whack', title:'Whack‑a‑Slime',desc:'Bonk slimes that pop up.',         play:gameWhack},
    {key:'shape', title:'Shape Sort',   desc:'Drag shapes to their slots.',      play:gameShape},
    {key:'hop',   title:'Hop Runner',   desc:'Tap to hop over blocks.',          play:gameHop},
    {key:'balloon',title:'Balloon Rise',desc:'Hold to float, dodge walls.',      play:gameBalloon}
  ];
  cards.forEach(c=>{
    const card=document.createElement('div'); card.className='mg-card';
    const best=S.toddler.games?.[c.key]?.best||0, plays=S.toddler.games?.[c.key]?.plays||0;
    card.innerHTML=`<div><strong>${c.title}</strong></div><div>${c.desc}</div><small>Best: ${best} • Plays: ${plays}</small>`;
    const btn=document.createElement('button'); btn.className='primary'; btn.textContent='Play'; btn.onclick=()=>c.play(); card.appendChild(btn);
    menu.appendChild(card);
  });
  function back(){ const b=document.createElement('button'); b.className='secondary'; b.textContent='← Back to games'; b.onclick=()=>minigames(); return b; }

  /* ---- GAME 1: Bubble Pop (slower) ---- */
  function gamePop(){
    view.innerHTML=''; const s=secWrap('Bubble Pop'); const c=canvas(s); s.appendChild(back());
    const ctx=c.getContext('2d'); let bubbles=[], score=0, running=true; const end=Date.now()+30000;
    function spawn(){ bubbles.push({x:Math.random()*c.width,y:c.height+20,r:10+Math.random()*16,vy:-0.4-Math.random()*0.6,ttl:4+Math.random()*2}); }
    for(let i=0;i<18;i++) spawn();
    function draw(){ ctx.clearRect(0,0,c.width,c.height); bg(ctx,c);
      bubbles.forEach(b=>{ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle='rgba(173,216,230,.6)'; ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.lineWidth=2; ctx.stroke(); });
      hudT(ctx,c,score,end);
    }
    function tick(){ if(!running) return; bubbles.forEach(b=>{ b.y+=b.vy*5; b.ttl-=1/60; }); bubbles=bubbles.filter(b=>b.y+b.r>-10 && b.ttl>0); if(bubbles.length<24) spawn(); draw(); if(Date.now()>=end){ running=false; finish(); return; } requestAnimationFrame(tick); }
    function boom(x,y){ score++; toddlerReward(1,1,c); play(audio.ding); confettiBurst(x,y,24); }
    c.addEventListener('pointerdown', e=>{ const r=c.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; bubbles.forEach(b=>{ const dx=b.x-x,dy=b.y-y; if(dx*dx+dy*dy<b.r*b.r){ b.ttl=0; boom(b.x+r.left,b.y+r.top); } }); });
    function finish(){ upd('pop',score); msg(s,`Round over! Score ${score}. (+${score} XP / +${Math.ceil(score/2)} coins)`); toddlerReward(score,Math.ceil(score/2),c); }
    tick();
  }

  /* ---- GAME 2: Memory Match ---- */
  function gameMatch(){
    view.innerHTML=''; const s=secWrap('Memory Match'); const em=['🦊','🐶','🐱','🐯','🐼','🐰','🐹','🦄']; const deck=shuffle([...em.slice(0,4),...em.slice(0,4)]);
    const grid=document.createElement('div'); grid.className='match-grid'; s.appendChild(grid); s.appendChild(back());
    let first=null, lock=false, matched=0, moves=0, start=Date.now();
    deck.forEach(v=>{ const d=document.createElement('div'); d.className='mm-card'; d.dataset.v=v; d.textContent='?'; d.onclick=()=>{
      if(lock||d.classList.contains('on')) return; d.classList.add('on'); d.textContent=v; if(!first){first=d; return;}
      moves++; if(first.dataset.v===v){ matched+=2; toddlerReward(2,1,d); first=null; if(matched===deck.length) done(); }
      else{ lock=true; setTimeout(()=>{ d.classList.remove('on'); d.textContent='?'; first.classList.remove('on'); first.textContent='?'; first=null; lock=false; },600); }
    }; grid.appendChild(d); });
    function done(){ const secTime=Math.round((Date.now()-start)/1000); const score=Math.max(1, 100-(secTime+moves*5)); upd('match',score); msg(s,`Nice! Time ${secTime}s, Moves ${moves}. Score ${score}. (+10 XP / +5 coins)`); toddlerReward(10,5,grid); }
  }

  /* ---- GAME 3: Star Catch (slower) ---- */
  function gameCatch(){
    view.innerHTML=''; const s=secWrap('Star Catch'); const c=canvas(s); s.appendChild(back());
    const ctx=c.getContext('2d'); let x=c.width/2, score=0, t=0, running=true; const stars=[], clouds=[];
    function addStar(){ stars.push({x:Math.random()*c.width,y:-10,vy:0.8+Math.random()*1.1}); }
    function addCloud(){ clouds.push({x:Math.random()*c.width,y:-20,vy:1.1+Math.random()*1.0}); }
    for(let i=0;i<5;i++) addStar(); for(let j=0;j<2;j++) addCloud();
    function draw(){ ctx.clearRect(0,0,c.width,c.height); bg(ctx,c); ctx.fillStyle='#ffdd57'; ctx.fillRect(x-12,c.height-20,24,10); ctx.fillStyle='#fff'; ctx.fillRect(x-8,c.height-28,16,8);
      ctx.fillStyle='#ffe680'; stars.forEach(s=>{ ctx.beginPath(); ctx.arc(s.x,s.y,4,0,Math.PI*2); ctx.fill(); });
      ctx.fillStyle='rgba(200,200,255,.6)'; clouds.forEach(cl=>{ ctx.beginPath(); ctx.arc(cl.x,cl.y,8,0,Math.PI*2); ctx.fill(); });
      ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18);
    }
    function tick(){ if(!running) return; t++; stars.forEach(s=>{ s.y+=s.vy; if(s.y>c.height+10){ s.y=-10; s.x=Math.random()*c.width; } if(Math.abs(s.x-x)<12 && s.y>c.height-28){ s.y=-10; s.x=Math.random()*c.width; score++; toddlerReward(1,1,c); } });
      clouds.forEach(cl=>{ cl.y+=cl.vy; if(cl.y>c.height+10){ cl.y=-10; cl.x=Math.random()*c.width; } if(Math.abs(cl.x-x)<12 && cl.y>c.height-28){ running=false; finish(); } });
      if(t%60===0) addStar(); if(t%160===0) addCloud(); draw(); requestAnimationFrame(tick); }
    function finish(){ upd('catch',score); msg(s,`Game over • Score ${score}. (+${score} XP / +${Math.ceil(score/2)} coins)`); toddlerReward(score,Math.ceil(score/2),c); }
    c.addEventListener('pointermove', e=>{ const r=c.getBoundingClientRect(); x=e.clientX-r.left; });
    c.addEventListener('pointerdown', e=>{ const r=c.getBoundingClientRect(); x=e.clientX-r.left; });
    tick();
  }

  /* ---- GAME 4: Color Tap ---- */
  function gameColor(){
    view.innerHTML=''; const s=secWrap('Color Tap'); s.appendChild(back());
    const colors=['RED','GREEN','BLUE','YELLOW','PINK','CYAN']; const map={RED:'#ff6b6b',GREEN:'#7cfb9a',BLUE:'#7aa2ff',YELLOW:'#ffd166',PINK:'#ff77e9',CYAN:'#66ffd1'};
    let target=colors[0], score=0, end=Date.now()+30000;
    const prompt=document.createElement('div'); prompt.style.margin='8px 0'; s.appendChild(prompt);
    const grid=document.createElement('div'); grid.style.display='grid'; grid.style.gridTemplateColumns='repeat(3,120px)'; grid.style.gap='10px'; s.appendChild(grid);
    function refresh(){ prompt.innerHTML=`Tap: <strong style="color:${map[target]}">${target}</strong>`; grid.innerHTML=''; const pool=[...colors].sort(()=>Math.random()-.5).slice(0,6);
      pool.forEach(c=>{ const b=document.createElement('button'); b.textContent=c; b.style.background='rgba(255,255,255,.06)'; b.onclick=()=>{ if(c===target){ score++; toddlerReward(1,1,b); } else score=Math.max(0,score-1); newTarget(); }; grid.appendChild(b); });
    }
    function newTarget(){ target=colors[(Math.random()*colors.length)|0]; refresh(); }
    newTarget();
    const timer=setInterval(()=>{ if(Date.now()>=end){ clearInterval(timer); upd('color',score); msg(s,`Score ${score}. (+${score} XP / +${Math.ceil(score/2)} coins)`); toddlerReward(score,Math.ceil(score/2),grid); } },500);
  }

  /* ---- GAME 5: Whack‑a‑Slime ---- */
  function gameWhack(){
    view.innerHTML=''; const s=secWrap('Whack‑a‑Slime'); const c=canvas(s,360,220); s.appendChild(back());
    const ctx=c.getContext('2d'); const holes=[]; for(let i=0;i<6;i++) holes.push({x:60+i%3*120,y:60+Math.floor(i/3)*80, up:false,t:0});
    let score=0, t=0; function draw(){ ctx.clearRect(0,0,c.width,c.height); bg(ctx,c);
      holes.forEach(h=>{ ctx.fillStyle='rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(h.x,h.y,28,0,Math.PI*2); ctx.fill();
        if(h.up){ ctx.fillStyle='#9aa4ff'; ctx.beginPath(); ctx.arc(h.x,h.y-12,16,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#000'; ctx.fillRect(h.x-8,h.y-14,4,4); ctx.fillRect(h.x+4,h.y-14,4,4); }
      });
      ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18);
    }
    function tick(){ t++; holes.forEach(h=>{ if(!h.up && Math.random()<0.012) {h.up=true; h.t=0;} if(h.up){h.t++; if(h.t>70) h.up=false;} }); draw(); requestAnimationFrame(tick); }
    c.addEventListener('pointerdown', e=>{ const r=c.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; holes.forEach(h=>{ if(h.up && ((x-h.x)**2+(y-h.y)**2)<28*28){ h.up=false; score++; toddlerReward(1,1,c); } }); });
    setTimeout(()=>{ upd('whack',score); msg(s,`Score ${score}. (+${score} XP / +${Math.ceil(score/2)} coins)`); toddlerReward(score,Math.ceil(score/2),c); }, 30000);
    tick();
  }

  /* ---- GAME 6: Shape Sort (drag to slots) ---- */
  function gameShape(){
    view.innerHTML=''; const s=secWrap('Shape Sort'); const c=canvas(s,420,260); s.appendChild(back());
    const ctx=c.getContext('2d'); const slots=[{x:90,y:80,t:'circle'},{x:210,y:80,t:'square'},{x:330,y:80,t:'triangle'}];
    const shapes=[{x:60,y:200,t:'circle'},{x:210,y:200,t:'square'},{x:360,y:200,t:'triangle'}];
    let drag=null, score=0;
    function draw(){ ctx.clearRect(0,0,c.width,c.height); bg(ctx,c);
      slots.forEach(s=>{ ctx.strokeStyle='#aaa'; ctx.lineWidth=2;
        if(s.t==='circle'){ ctx.beginPath(); ctx.arc(s.x,s.y,22,0,Math.PI*2); ctx.stroke(); }
        if(s.t==='square'){ ctx.strokeRect(s.x-22,s.y-22,44,44); }
        if(s.t==='triangle'){ ctx.beginPath(); ctx.moveTo(s.x,s.y-24); ctx.lineTo(s.x-22,s.y+22); ctx.lineTo(s.x+22,s.y+22); ctx.closePath(); ctx.stroke(); }
      });
      shapes.forEach(s=>{ ctx.fillStyle='#7aa2ff'; if(s.t==='circle'){ ctx.beginPath(); ctx.arc(s.x,s.y,18,0,Math.PI*2); ctx.fill(); }
        if(s.t==='square'){ ctx.fillRect(s.x-18,s.y-18,36,36); }
        if(s.t==='triangle'){ ctx.beginPath(); ctx.moveTo(s.x,s.y-20); ctx.lineTo(s.x-18,s.y+18); ctx.lineTo(s.x+18,s.y+18); ctx.closePath(); ctx.fill(); }
      });
      ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18);
    }
    function hit(s,x,y){ if(s.t==='circle') return (x-s.x)**2+(y-s.y)**2<20*20; if(s.t==='square') return x>s.x-20&&x<s.x+20&&y>s.y-20&&y<s.y+20;
      if(s.t==='triangle') return y>s.y-22&&y<s.y+20&&Math.abs(x-s.x)<(y-(s.y-22)); }
    c.addEventListener('pointerdown', e=>{ const r=c.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; for(const s of shapes){ if(hit(s,x,y)){ drag=s; break; } } });
    c.addEventListener('pointermove', e=>{ if(!drag) return; const r=c.getBoundingClientRect(); drag.x=e.clientX-r.left; drag.y=e.clientY-r.top; draw(); });
    c.addEventListener('pointerup', e=>{ if(!drag) return; const r=c.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; const slot=slots.find(sl=>hit(sl,x,y) && sl.t===drag.t); if(slot){ drag.x=slot.x; drag.y=slot.y; score++; toddlerReward(2,1,c); } drag=null; draw(); if(score>=3){ upd('shape',score*10); msg(s,`Sorted! (+${score*10} XP / +${score*5} coins)`); toddlerReward(score*10,score*5,c); } });
    draw();
  }

  /* ---- GAME 7: Hop Runner (tap to hop over blocks) ---- */
  function gameHop(){
    view.innerHTML=''; const s=secWrap('Hop Runner'); const c=canvas(s,420,220); s.appendChild(back());
    const ctx=c.getContext('2d'); let y=160, vy=0, t=0, score=0, alive=true; const blocks=[];
    function add(){ const w=16,h=16, x=c.width+10, y=168; blocks.push({x,y,w,h}); }
    function draw(){ ctx.clearRect(0,0,c.width,c.height); bg(ctx,c); ctx.fillStyle='#7cfb9a'; ctx.fillRect(20,y-12,16,12);
      ctx.fillStyle='#ffd166'; blocks.forEach(b=>ctx.fillRect(b.x,b.y-b.h,b.w,b.h)); ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18); }
    function tick(){ if(!alive) return; t++; vy+=0.35; y+=vy; if(y>160){ y=160; vy=0; } blocks.forEach(b=>{ b.x-=2.2; if(b.x<-20) {b.x=c.width+Math.random()*120; score++; toddlerReward(1,0,c);} }); if(t%80===0) add();
      blocks.forEach(b=>{ if(20<b.x+16 && 36>b.x && y> b.y-12) { alive=false; finish(); } }); draw(); requestAnimationFrame(tick); }
    c.addEventListener('pointerdown', ()=>{ if(y>=160) vy=-6.5; });
    add(); tick();
    function finish(){ upd('hop',score); msg(s,`Bonk! Score ${score}. (+${score} XP / +${Math.ceil(score/2)} coins)`); toddlerReward(score,Math.ceil(score/2),c); }
  }

  /* ---- GAME 8: Balloon Rise (hold to float) ---- */
  function gameBalloon(){
    view.innerHTML=''; const s=secWrap('Balloon Rise'); const c=canvas(s,420,220); s.appendChild(back());
    const ctx=c.getContext('2d'); let y=110, vy=0, hold=false, t=0, score=0, alive=true; const gaps=[];
    function addGap(){ const gap=60, top=20+Math.random()*100; gaps.push({x:c.width+20, top:top, gap:gap}); }
    function draw(){ ctx.clearRect(0,0,c.width,c.height); bg(ctx,c); ctx.fillStyle='#ff77e9'; ctx.beginPath(); ctx.arc(60,y,10,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#fff'; gaps.forEach(g=>{ ctx.beginPath(); ctx.moveTo(g.x,0); ctx.lineTo(g.x,g.top); ctx.moveTo(g.x,g.top+g.gap); ctx.lineTo(g.x,c.height); ctx.stroke(); });
      ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18); }
    function tick(){ if(!alive) return; t++; vy += hold? -0.15 : 0.18; y += vy; vy *= 0.98; gaps.forEach(g=>{ g.x-=2; if(g.x<-10){ g.x=c.width+Math.random()*140; score++; toddlerReward(1,0,c);} if(Math.abs(g.x-60)<4){ if(y<g.top+10 || y>g.top+g.gap-10){ alive=false; finish(); } } }); if(t%100===0) addGap(); draw(); requestAnimationFrame(tick); }
    c.addEventListener('pointerdown', ()=> hold=true); c.addEventListener('pointerup', ()=> hold=false); addGap(); tick();
    function finish(){ upd('balloon',score); msg(s,`Oops! Score ${score}. (+${score} XP / +${Math.ceil(score/2)} coins)`); toddlerReward(score,Math.ceil(score/2),c); }
  }

  /* helpers for minigames */
  function secWrap(title){ const s=document.createElement('section'); s.className='cardish'; s.innerHTML=`<h2 class="dash">${title}</h2>`; view.innerHTML=''; view.appendChild(s); return s; }
  function canvas(s,w=420,h=260){ const c=document.createElement('canvas'); c.width=w; c.height=h; c.className='game'; s.appendChild(c); return c; }
  function bg(ctx,c){ ctx.fillStyle='rgba(255,255,255,.03)'; ctx.fillRect(0,0,c.width,c.height); }
  function hudT(ctx,c,score,end){ ctx.fillStyle='#fff'; ctx.fillText('Score: '+score,10,18); const left=Math.max(0,Math.ceil((end-Date.now())/1000)); ctx.fillText('Time: '+left+'s',c.width-70,18); }
  function upd(key,score){ const g=S.toddler.games[key]; g.best=Math.max(g.best||0,score); g.plays=(g.plays||0)+1; save(); }
  function msg(s,html){ const m=document.createElement('div'); m.style.marginTop='8px'; m.innerHTML=html; s.appendChild(m); }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }
}

/* ---------------- Router ---------------- */
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
  if(name==='pet') petPage();
  window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange',()=>requestAnimationFrame(render));
$('.top-nav')?.addEventListener('click',e=>{ const b=e.target.closest('[data-route]'); if(!b) return; e.preventDefault(); location.hash='#'+b.dataset.route; });

// boot
hud(); toddlerHud(); render();
console.log('SootheBirb — 8 games pack + gear + toddler pet loaded');
