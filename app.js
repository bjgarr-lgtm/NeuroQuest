
/* SootheBirb merge HUD + party controls
   - Safe on any index.html: if a template isn't present, we skip it (no errors).
   - Keeps all existing pages/layouts from repo commit.
*/
'use strict';

// -------- persistence
const KEY='sb.v2.5.0.stable';
const defaults=()=>({settings:{toddler:false,music:false},party:{companions:[]},economy:{gold:0,ownedAcc:[]},equip:{head:null,face:null,back:null,hand:null},user:{character:null},pet:{level:1,xp:0},log:{tasks:[]}});
function deep(a,b){ if(Array.isArray(a)) return Array.isArray(b)?b.slice():a.slice(); if(a&&typeof a==='object'){const o={...a}; for(const k of Object.keys(b||{})) o[k]=deep(a[k],b[k]); return o;} return b===undefined?a:b; }
let S; try{S=deep(defaults(), JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{S=defaults()}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch{} }

// -------- tiny utils
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const uniq=(arr)=>Array.from(new Set(arr||[]));
function on(el,ev,fn){ if(el) el.addEventListener(ev,fn); }

// -------- fx & audio (minimal keep)
const audio={ding:new Audio('assets/sfx/ding.wav'),coin:new Audio('assets/sfx/coin.wav'),level:new Audio('assets/sfx/level.wav')};
function play(a){ if(a&&a.play){ try{a.currentTime=0;a.play();}catch{} } }
function xpFor(l){ return l*l*10 }
function levelCheck(){ const need=xpFor(S.pet.level+1); if(S.pet.xp>=need){ S.pet.level++; play(audio.level); save(); hud(); } }

// -------- style: enforce sane sprite sizing + grid tidy (won over theme)
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
`; document.head.appendChild(st); })();

// -------- catalog for companions (names + images you provided)
function CAT(){ return {
  molly:{name:'Molly',img:'assets/heroes/comp-molly.png'},
  odin:{name:'Odin',img:'assets/heroes/hero-odin.png'},
  ash:{name:'Ash',img:'assets/heroes/hero-ash.png'},
  fox:{name:'Fox',img:'assets/heroes/hero-fox.png'}
};}

// -------- HUD
function hudAvatars(){
  const wrap=$('#hudAvatars') || (function(){
    // if the HUD strip doesn't have avatars, add them non-destructively
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

// -------- party banner (dashboard), only if container exists
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

// -------- character select (only if template exists)
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

// -------- companion select (multi-select)
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

// -------- tasks logic (only wires if panels exist; keeps your original content)
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

// -------- router (non‑destructive, only acts if a template exists)
const map={home:'tpl-home',tasks:'tpl-tasks',clean:'tpl-clean',coop:'tpl-coop',budget:'tpl-budget',meals:'tpl-meals',calendar:'tpl-calendar',shop:'tpl-shop',characters:'tpl-characters',companion:'tpl-companion',breathe:'tpl-breathe',minigames:'tpl-minigames',journal:'tpl-journal',checkin:'tpl-checkin',rewards:'tpl-rewards',settings:'tpl-settings'};
const alias={quests:'tasks',cleaning:'clean',pet:'companion'};
let LAST='';
function routeName(){ const raw=(location.hash||'#home').slice(1)||'home'; return alias[raw]||raw; }
function render(){
  const name=routeName(); if(name===LAST) return; LAST=name;
  const tplId=map[name]; const tpl=document.getElementById(tplId); const view=$('#view'); if(!tpl||!view){ hud(); partyBanner(); return; }
  view.innerHTML=''; view.appendChild(tpl.content.cloneNode(true));
  hud(); partyBanner();
  if(name==='home'){ $$('.tile[data-route]', view).forEach(t=> t.addEventListener('click',()=>{ location.hash='#'+t.getAttribute('data-route'); })); }
  if(name==='tasks'){ tasks(); }
  if(name==='characters'){ char(); }
  if(name==='companion'){ companion(); }
  window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange', ()=>requestAnimationFrame(render));
$('.top-nav')?.addEventListener('click', e=>{ const b=e.target.closest('[data-route]'); if(!b) return; e.preventDefault(); location.hash='#'+b.dataset.route; });

// boot
hud(); render();
console.log('SootheBirb HUD/party merged on existing pages');
