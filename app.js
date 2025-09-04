/* soothebirb app.js — fixed
   - Defines window.petPixelSVG & window.characterPixelSVG (no more ReferenceError)
   - Hash router with guard (no infinite retry loops)
   - Toddler mode, party companions, equip overlays, mini-game, FX/SFX
   - Safe to drop-in as full replacement for your current app.js
*/
(function(){
'use strict';

/* ---------- Hard guards to stop reload/render loops ---------- */
let __RENDER_TRIES = 0;
const __RENDER_TRIES_MAX = 2;
let __LAST_ROUTE = null;
const SAFE = (fn) => { try { return fn(); } catch(e){ console.error(e); } };

/* ---------- Fallback avatar/pet renderers (vector, cute neon) ---------- */
window.petPixelSVG = window.petPixelSVG || function(opts){
  opts = opts || {}; const sz = opts.size || 128;
  const a1 = opts.accent || '#00eaff', a2 = opts.accent2 || '#8a2be2';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${sz}" height="${sz}">
    <defs><radialGradient id="g" cx=".5" cy=".35"><stop offset="0%" stop-color="${a1}"/><stop offset="100%" stop-color="${a2}"/></radialGradient></defs>
    <ellipse cx="60" cy="70" rx="40" ry="35" fill="url(#g)" opacity="0.95"/>
    <circle cx="60" cy="48" r="18" fill="url(#g)" opacity="0.95"/>
    <circle cx="54" cy="44" r="3" fill="#000"/><circle cx="66" cy="44" r="3" fill="#000"/>
    <path d="M60 52 l8 5 -8 5 -8 -5z" fill="#ffd166"/>
  </svg>`;
};
window.characterPixelSVG = window.characterPixelSVG || function(opts){
  // same fallback as pet — you can swap for your sprite later
  return window.petPixelSVG(opts);
};

/* ---------- Storage ---------- */
const STORE_KEY = 'soothebirb.v2.5.0.fixed';
const defaults = () => ({
  settings:{ toddler:false, music:false },
  party:{ companions:[] },
  economy:{ gold:0, ownedAcc:['glasses'] },
  equip:{ head:null, face:null, back:null, hand:null },
  user:{ character:{ id:'hero', img:'assets/heroes/hero-bambi.png', anim:'walk' } },
  pet:{ level:1, xp:0 },
  log:{ tasks:[] }
});
function deep(a,b){ if(Array.isArray(a)) return Array.isArray(b)?b.slice():a.slice();
  if(a&&typeof a==='object'){ const o={...a}; for(const k of Object.keys(b||{})) o[k]=deep(a[k],b[k]); return o; }
  return b===undefined?a:b;
}
function load(){ try{ return deep(defaults(), JSON.parse(localStorage.getItem(STORE_KEY)||'{}')); }catch{ return defaults(); } }
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
let state = load();

/* ---------- DOM helpers ---------- */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
function on(el,ev,fn){ if(el) el.addEventListener(ev,fn); }

/* ---------- Minimal CSS injection (non-invasive) ---------- */
(function(){
  if ($('#fixStyles')) return;
  const st = document.createElement('style'); st.id='fixStyles';
  st.textContent = `
    .sprite{position:relative;width:132px;height:132px}
    .sprite img{width:100%;height:100%;object-fit:contain}
    .acc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none}
    .acc.head{z-index:6}.acc.face{z-index:6}.acc.back{z-index:1}.acc.hand{z-index:6}
    @keyframes step{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    .anim-walk img{animation:step .38s ease-in-out infinite}
    .is-hidden{display:none!important}
  `;
  document.head.appendChild(st);
})();

/* ---------- Sounds / FX ---------- */
const audio={ ding:new Audio('assets/sfx/ding.wav'), coin:new Audio('assets/sfx/coin.wav'),
  level:new Audio('assets/sfx/level.wav'), bgm:new Audio('assets/sfx/bgm.wav') };
if(!isNaN(audio.bgm.duration)){ audio.bgm.loop=true; audio.bgm.volume=.35; }
const FX={
  layer:(()=>{ let d=$('#fxLayer'); if(!d){ d=document.createElement('div'); d.id='fxLayer'; d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999'; document.body.appendChild(d);} return d; })(),
  confetti(n=160){ const frag=document.createDocumentFragment();
    for(let i=0;i<n;i++){ const p=document.createElement('i');
      p.style.cssText=`position:fixed;left:${Math.random()*100}vw;top:-8px;width:8px;height:8px;background:hsl(${Math.random()*360} 90% 60%);opacity:.95;border-radius:2px;pointer-events:none;transform:translateY(0) rotate(${Math.random()*360}deg);transition:transform 1.2s ease-out, top 1.2s ease-out, opacity 1.2s ease-out`;
      frag.appendChild(p);
      requestAnimationFrame(()=>{ p.style.top='110vh'; p.style.transform=`translateY(${50+Math.random()*60}vh) rotate(${360+Math.random()*360}deg)`; p.style.opacity='0'; });
      setTimeout(()=>p.remove(),1400);
    } this.layer.appendChild(frag);
  },
  crown(){ const img=document.createElement('img'); img.src='assets/acc/crown.svg'; img.alt='crown';
    img.style.cssText='position:fixed;left:50%;top:-120px;transform:translateX(-50%);width:140px;filter:drop-shadow(0 0 8px rgba(255,210,0,.7))'; this.layer.appendChild(img);
    requestAnimationFrame(()=>{ img.style.transition='transform .9s cubic-bezier(.2,1,.2,1), top .9s cubic-bezier(.2,1,.2,1)'; img.style.top='25vh'; img.style.transform='translateX(-50%) rotate(4deg)'; });
    setTimeout(()=>{ img.style.top='110vh'; img.style.transform='translateX(-50%) rotate(28deg)'; }, 1200);
    setTimeout(()=> img.remove(), 2100);
  }
};
function sfx(name){ const a=audio[name]; if(a && !isNaN(a.duration)){ try{ a.currentTime=0; a.play(); }catch(e){} }}

/* ---------- XP/HUD ---------- */
function xpFor(l){ return l*l*10; }
function maybeLevelUp(){ const need=xpFor(state.pet.level+1); if(state.pet.xp>=need){ state.pet.level++; sfx('level'); FX.confetti(260); FX.crown(); save(); renderHUD(); } }
function renderHUD(){
  const gold=$('#hudGold'); if(gold) gold.textContent=`🪙 ${state.economy.gold||0}`;
  const lvl=$('#hudLevel'), bar=$('#hudXp'); if(lvl&&bar){ const L=state.pet.level, X=state.pet.xp, N=xpFor(L+1), P=xpFor(L); bar.style.width=clamp(Math.round(((X-P)/(N-P))*100),0,100)+'%'; lvl.textContent=`Lv ${L}`; }
  const t=$('#toddlerToggle'); if(t){ t.checked=!!state.settings.toddler; t.onchange=()=>{ state.settings.toddler=t.checked; save(); renderHUD(); if($('#questList')) regenerateQuests(); }; }
}

/* ---------- Equip / Party ---------- */
const ACC={ crown:'assets/acc/crown.svg', glasses:'assets/acc/glasses.svg', cape:'assets/acc/cape.svg', torch:'assets/acc/torch.svg' };
function applyEquip(container){ const eq=state.equip||{}; ['back','head','face','hand'].forEach(slot=>{ const key=eq[slot]; if(!key||!ACC[key]) return; const img=document.createElement('img'); img.className='acc '+slot; img.src=ACC[key]; container.appendChild(img); }); }
function renderParty(){
  const wrap=$('#partyBanner'); if(!wrap) return; wrap.innerHTML='';
  const you=document.createElement('div'); you.className='card'; const sp=document.createElement('div'); sp.className='sprite anim-walk';
  sp.innerHTML=`<img src="${state.user.character.img}" alt="You">`; applyEquip(sp); you.appendChild(sp);
  you.appendChild(Object.assign(document.createElement('div'),{className:'name',textContent:'You'})); wrap.appendChild(you);
  (state.party.companions||[]).forEach(id=>{ const cat=catalog()[id]; if(!cat) return; const card=document.createElement('div'); card.className='card';
    card.innerHTML=`<div class="sprite anim-walk"><img src="${cat.img}" alt="${cat.name}"></div><div class="name">${cat.name}</div>`; wrap.appendChild(card);
  });
}

/* ---------- Quests ---------- */
function catalog(){ return {
  molly:{ name:'Molly', img:'assets/heroes/comp-molly.png', tasks:[{text:'Feed & water Molly',xp:6,gold:2},{text:'Walk Molly (10m)',xp:8,gold:3}]},
  odin:{ name:'Odin',  img:'assets/heroes/hero-odin.png',  tasks:[{text:'Homework help',xp:7,gold:2},{text:'Snack prep',xp:5,gold:1}]},
  ash:{  name:'Ash',   img:'assets/heroes/hero-ash.png',   tasks:[{text:'Jam session (10m)',xp:6,gold:2},{text:'Message Ash back',xp:4,gold:1}]},
  fox:{  name:'Fox',   img:'assets/heroes/hero-fox.png',   tasks:[{text:'Nature walk (15m)',xp:8,gold:2},{text:'Tea & chill',xp:4,gold:1}]},
};}
function baseQuests(){ const arr=[{text:'Drink water',xp:5,gold:1},{text:'3-min stretch',xp:5,gold:1}];
  (state.party.companions||[]).forEach(id=> (catalog()[id]?.tasks||[]).forEach(t=>arr.push(t)));
  if(state.settings.toddler) arr.push({text:'Read picture book',xp:8,gold:2},{text:'Outside play 10m',xp:8,gold:2});
  return arr.map((t,i)=>({id:(Date.now()+i),done:false,...t}));
}
function regenerateQuests(){ state.log.tasks = baseQuests(); save(); renderTasks(); }
function renderTasks(){
  const list=$('#questList'); if(!list) return; list.innerHTML='';
  state.log.tasks.forEach(t=>{
    const row=document.createElement('div'); row.className='quest-row';
    const box=document.createElement('div'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
    box.onclick=()=>{ t.done=!t.done;
      if(t.done){ state.economy.gold=(state.economy.gold||0)+(t.gold||1); state.pet.xp+=t.xp||5; save(); renderHUD(); sfx('ding'); sfx('coin'); FX.confetti(120); if(Math.random()<.1) FX.crown(); maybeLevelUp(); }
      renderTasks();
    };
    const label=document.createElement('div'); label.textContent=t.text;
    row.append(box,label); list.appendChild(row);
  });
}

/* ---------- Pages wiring ---------- */
function wireShop(){ $$('.buy').forEach(b=> on(b,'click',()=>{
  const item=b.dataset.item; const cost={crown:30,glasses:12,cape:24,torch:10}[item]??10;
  if((state.economy.gold||0)<cost) return alert('Need more coins.');
  state.economy.gold -= cost;
  state.economy.ownedAcc = Array.from(new Set([...(state.economy.ownedAcc||[]), item]));
  save(); renderHUD(); sfx('coin'); FX.confetti(120); alert('Purchased '+item+'! Equip it on the Character page.');
})); }
function wireCharacter(){
  $$('.equip').forEach(btn=> on(btn,'click',()=>{
    const slot=btn.dataset.slot, item=btn.dataset.item;
    if(!(new Set(state.economy.ownedAcc||[])).has(item)) return alert('Buy it in the shop first.');
    state.equip[slot]=item; save(); renderHUD(); renderParty(); refreshCharacterPreview();
  }));
  on($('.unequip'),'click',()=>{ state.equip={head:null,face:null,back:null,hand:null}; save(); renderHUD(); renderParty(); refreshCharacterPreview(); });
  on($('#uploadChar'),'click',()=> $('#charFile')?.click());
  on($('#charFile'),'change', e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ state.user.character={...state.user.character,id:'custom',img:r.result}; save(); renderHUD(); renderParty(); refreshCharacterPreview(); }; r.readAsDataURL(f); });
  refreshCharacterPreview();
}
function refreshCharacterPreview(){
  const p=$('#charPreview'); if(!p) return; p.innerHTML='';
  const sp=document.createElement('div'); sp.className='sprite anim-walk'; sp.innerHTML=`<img src="${state.user.character.img}" alt="you">`;
  applyEquip(sp); p.appendChild(sp);
}
function wireCompanion(){
  const grid=$('#partyPick'); if(!grid) return; grid.innerHTML='';
  const cat=catalog(); Object.keys(cat).forEach(id=>{
    const c=cat[id]; const el=document.createElement('div'); el.className='party-card'+(state.party.companions.includes(id)?' selected':'');
    el.innerHTML=`<img src="${c.img}" alt="${c.name}"><div class="name">${c.name}</div>`;
    el.onclick=()=>{ const i=state.party.companions.indexOf(id); if(i>=0) state.party.companions.splice(i,1); else state.party.companions.push(id); save(); wireCompanion(); renderHUD(); renderParty(); };
    grid.appendChild(el);
  });
  on($('#saveParty'),'click',()=>{ alert('Party saved'); save(); renderParty(); if($('#questList')) regenerateQuests(); });
}

/* ---------- Mini-game (Toddler) ---------- */
function initMiniGame(){
  const c=$('#popGame'); if(!c) return;
  if(!state.settings.toddler){ location.hash='#home'; return; }
  const ctx=c.getContext('2d'), W=c.width, H=c.height; let bubbles=[],score=0,last=0;
  function add(){ bubbles.push({x:Math.random()*W,y:H+20,r:12+Math.random()*18,v:40+Math.random()*50}); } for(let i=0;i<8;i++) add();
  on(c,'click',e=>{ const r=c.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top;
    for(const b of bubbles){ if(Math.hypot(b.x-x,b.y-y)<b.r){ b.pop=true; score++; state.economy.gold++; save(); renderHUD(); sfx('coin'); break; } }
  });
  (function loop(t){ const dt=(t-last)||16; last=t; ctx.clearRect(0,0,W,H);
    for(const b of bubbles){ b.y -= b.v*dt/1000; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle='rgba(135,206,250,0.6)'; ctx.fill();
      if(b.pop||b.y+b.r<-10){ Object.assign(b,{x:Math.random()*W,y:H+20,r:12+Math.random()*18,v:40+Math.random()*50,pop:false}); } }
    ctx.fillStyle='#fff'; ctx.fillText('Popped: '+score, 12, 20);
    if(score>=20){ state.pet.xp+=20; state.economy.gold+=5; save(); renderHUD(); FX.confetti(200); sfx('level'); ctx.fillText('Great job! +XP +Gold', W/2-80, H/2); return; }
    requestAnimationFrame(loop);
  })(0);
}

/* ---------- Router ---------- */
const routes = new Set(['home','dashboard','quests','tasks','cleaning','shop','characters','companion','minigames','journal','breathe','calendar','budget','meals','rewards','checkin','settings']);
window.renderRoute = function(route){
  try{
    const name = (route||'').replace('#','') || (location.hash||'#home').slice(1) || 'home';
    if (__LAST_ROUTE !== name) { __RENDER_TRIES = 0; __LAST_ROUTE = name; } else { __RENDER_TRIES++; }
    if (__RENDER_TRIES > __RENDER_TRIES_MAX) { console.warn('[guard] too many render tries for', name, '→ showing home'); return window.renderRoute('home'); }

    // Hide/show views by id or data attributes
    const viewEls = $$('main section, .view, .screen, [data-view]');
    if (viewEls.length) { viewEls.forEach(el=> el.classList.add('is-hidden')); }
    const target = document.getElementById(name) || document.querySelector(`[data-view="${name}"]`) || document.querySelector(`[data-screen="${name}"]`) || document.querySelector(`[data-route-target="${name}"]`);
    if (target) target.classList.remove('is-hidden');

    // Page-specific wiring
    renderHUD(); renderParty();
    if (name==='home' || name==='dashboard'){ $$('.tile[data-route]').forEach(t=> on(t,'click',()=> location.hash = '#'+t.dataset.route)); }
    if (name==='quests' || name==='tasks'){ if(!state.log.tasks.length) regenerateQuests(); renderTasks(); }
    if (name==='shop'){ wireShop(); }
    if (name==='characters'){ wireCharacter(); }
    if (name==='companion'){ wireCompanion(); }
    if (name==='minigames'){ initMiniGame(); }
  }catch(err){
    console.error('renderRoute error', err);
  }
};
window.addEventListener('hashchange', ()=> window.renderRoute());
function boot(){ renderHUD(); renderParty(); window.renderRoute(); }
boot();

})(); // end IIFE