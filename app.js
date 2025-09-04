
/* SootheBirb v2.5.0 hotfix — Party controls (Clear/Select All/Done), HUD edit, banner contrast */
'use strict';

const KEY='sb.v2.5.0.stable';
const defaults=()=>({settings:{toddler:false,music:false},party:{companions:[]},economy:{gold:0,ownedAcc:['glasses']},equip:{head:null,face:null,back:null,hand:null},user:{character:{id:'bambi',img:'assets/heroes/hero-bambi.png',anim:'walk'}},pet:{level:1,xp:0},log:{tasks:[]},budget:{goal:1000,txn:[]},meals:[],calendar:[],moods:[],journal:[]});
function deep(a,b){ if(Array.isArray(a)) return Array.isArray(b)?b.slice():a.slice(); if(a&&typeof a==='object'){const o={...a}; for(const k of Object.keys(b||{})) o[k]=deep(a[k],b[k]); return o;} return b===undefined?a:b; }
let S; try{S=deep(defaults(), JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{S=defaults()}
function save(){ localStorage.setItem(KEY, JSON.stringify(S)); }

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function on(el,ev,fn){ if(el) el.addEventListener(ev,fn); }
const uniq = (arr)=>Array.from(new Set(arr||[]));

// Inject minimal styles for banner contrast + HUD avatars + selection affordance
(function(){ const id='sbPartyStyle'; if($('#'+id)) return; const st=document.createElement('style'); st.id=id; st.textContent=`
.party-banner,.party-banner .party-label,.party-members .name{color:#111!important;text-shadow:none!important}
.hud .avatars{display:flex;gap:6px;align-items:center;margin-right:12px}
.hud .avatars .hud-ava{width:28px;height:28px;border-radius:6px;image-rendering:pixelated;box-shadow:0 0 0 2px rgba(255,255,255,.08) inset, 0 0 6px rgba(0,255,255,.25)}
.hud .avatars .hud-ava.you{box-shadow:0 0 0 2px rgba(255,215,0,.45) inset, 0 0 8px rgba(255,215,0,.25)}
.party-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px}
.party-card{cursor:pointer;position:relative}
.party-card.selected::after{content:"✓";position:absolute;right:6px;top:6px;background:#0f0;color:#000;font-weight:700;border-radius:50%;width:18px;height:18px;display:grid;place-items:center;box-shadow:0 0 6px #0f0}
`;
document.head.appendChild(st); })();

// ---- Sounds / FX (same as prior hotfix)
const audio={ding:new Audio('assets/sfx/ding.wav'),coin:new Audio('assets/sfx/coin.wav'),level:new Audio('assets/sfx/level.wav'),bgm:new Audio('assets/sfx/bgm.wav')};
try{audio.bgm.loop=true; audio.bgm.volume=.35;}catch{}
function play(a){ if(a && !isNaN(a.duration)) { try{ a.currentTime=0; a.play(); }catch{} } }
const FX={layer:(()=>{let d=$('#fxLayer'); if(!d){d=document.createElement('div'); d.id='fxLayer'; d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999'; document.body.appendChild(d);} return d;})(),
  confetti(n=180){ const f=document.createDocumentFragment(); for(let i=0;i<n;i++){ const p=document.createElement('i'); p.style.cssText=`position:fixed;left:${Math.random()*100}vw;top:-8px;width:8px;height:8px;background:hsl(${Math.random()*360} 90% 60%);opacity:.95;border-radius:2px;pointer-events:none;transform:translateY(0) rotate(${Math.random()*360}deg);transition:transform 1.2s ease-out,top 1.2s ease-out,opacity 1.2s ease-out`; f.appendChild(p); requestAnimationFrame(()=>{p.style.top='110vh';p.style.transform=`translateY(${50+Math.random()*60}vh) rotate(${360+Math.random()*360}deg)`;p.style.opacity='0'}); setTimeout(()=>p.remove(),1400);} this.layer.appendChild(f)},
  crown(){ const img=document.createElement('img'); img.src='assets/acc/crown.svg'; img.alt='crown'; img.style.cssText='position:fixed;left:50%;top:-120px;transform:translateX(-50%);width:140px;filter:drop-shadow(0 0 8px rgba(255,210,0,.7))'; this.layer.appendChild(img);
    requestAnimationFrame(()=>{img.style.transition='transform .9s cubic-bezier(.2,1,.2,1), top .9s cubic-bezier(.2,1,.2,1)'; img.style.top='25vh'; img.style.transform='translateX(-50%) rotate(4deg)'});
    setTimeout(()=>{img.style.top='110vh'; img.style.transform='translateX(-50%) rotate(28deg)'},1200); setTimeout(()=>img.remove(),2100); }
};
// Cursor sparkle trail
(function(){ const MAX=20, pts=[]; const c=document.createElement('canvas'); c.width=innerWidth; c.height=innerHeight; c.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9998'; document.body.appendChild(c);
 const g=c.getContext('2d'); addEventListener('resize',()=>{c.width=innerWidth; c.height=innerHeight}); document.addEventListener('pointermove',e=>{pts.push({x:e.clientX,y:e.clientY}); while(pts.length>MAX) pts.shift();});
 (function loop(){ g.clearRect(0,0,c.width,c.height); for(let i=0;i<pts.length;i++){ const p=pts[i],a=(i+1)/pts.length; g.beginPath(); g.arc(p.x,p.y,2+4*a,0,Math.PI*2); g.fillStyle=`rgba(0,234,255,${0.12+0.25*a})`; g.fill(); } requestAnimationFrame(loop); })();
})();

// ---- XP / HUD
function xpFor(l){ return l*l*10 }
function levelCheck(){ const need=xpFor(S.pet.level+1); if(S.pet.xp>=need){ S.pet.level++; play(audio.level); FX.confetti(260); FX.crown(); save(); hud(); } }

function hudAvatars(){
  const wrap = $('#hudAvatars'); if(!wrap) return;
  wrap.innerHTML = '';
  function add(img, cls, title){
    const i=document.createElement('img'); i.src=img; i.alt=title||''; i.className='hud-ava '+(cls||''); wrap.appendChild(i);
  }
  if(S.user?.character?.img) add(S.user.character.img, 'you', 'You');
  for(const id of (S.party.companions||[])){ const c=CAT()[id]; if(c) add(c.img, '', c.name); }
  wrap.title = 'Click to edit party'; wrap.style.cursor='pointer';
  wrap.onclick = ()=>{ location.hash = '#companion'; };
}

function hud(){
  document.body.classList.toggle('toddler-on', !!S.settings.toddler);
  const gold=$('#hudGold'); if(gold) gold.textContent=`🪙 ${S.economy.gold||0}`;
  const lvl=$('#hudLevel'), bar=$('#hudXp'); if(lvl && bar){ const L=S.pet.level,X=S.pet.xp,N=xpFor(L+1),P=xpFor(L); lvl.textContent=`Lv ${L}`; bar.style.width=Math.max(0,Math.min(100,Math.round(((X-P)/(N-P))*100)))+'%' }
  const music=$('#musicBtn'); if(music){ music.onclick=async()=>{ S.settings.music=!S.settings.music; save(); if(S.settings.music){ try{ await audio.bgm.play(); }catch{} } else { try{ audio.bgm.pause(); }catch{} } } }
  hudAvatars();
}

// ---- Equipment
const ACC={crown:'assets/acc/crown.svg',glasses:'assets/acc/glasses.svg',cape:'assets/acc/cape.svg',torch:'assets/acc/torch.svg'};
function equipLayers(container){ const e=S.equip||{}; ['back','head','face','hand'].forEach(slot=>{ const key=e[slot]; if(!key||!ACC[key]) return; const img=document.createElement('img'); img.className='acc '+slot; img.src=ACC[key]; container.appendChild(img); }); }
function partyBanner(){ const wrap=$('#partyBanner'); if(!wrap) return; wrap.innerHTML=''; const you=document.createElement('div'); you.className='card'; const sp=document.createElement('div'); sp.className='sprite anim-walk'; sp.innerHTML=`<img src="${S.user.character.img}" alt="You">`; equipLayers(sp); you.appendChild(sp); you.appendChild(Object.assign(document.createElement('div'),{className:'name',textContent:'You'})); wrap.appendChild(you);
  for(const id of S.party.companions||[]){ const c=CAT()[id]; if(!c) continue; const card=document.createElement('div'); card.className='card'; card.innerHTML=`<div class="sprite anim-walk"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`; wrap.appendChild(card); } }

// ---- Catalog
function CAT(){ return {
  molly:{name:'Molly',img:'assets/heroes/comp-molly.png',tasks:[{text:'Feed & water Molly',xp:6,gold:2},{text:'Walk Molly (10m)',xp:8,gold:3}]},
  odin:{name:'Odin',img:'assets/heroes/hero-odin.png',tasks:[{text:'Homework help',xp:7,gold:2},{text:'Snack prep',xp:5,gold:1}]},
  ash:{name:'Ash',img:'assets/heroes/hero-ash.png',tasks:[{text:'Jam session (10m)',xp:6,gold:2},{text:'Message Ash back',xp:4,gold:1}]},
  fox:{name:'Fox',img:'assets/heroes/hero-fox.png',tasks:[{text:'Nature walk (15m)',xp:8,gold:2},{text:'Tea & chill',xp:4,gold:1}]}
};}

// ---- Quests
function baseQuests(){ const arr=[{text:'Drink water',xp:5,gold:1},{text:'3-min stretch',xp:5,gold:1}]; for(const id of (S.party.companions||[])){ (CAT()[id]?.tasks||[]).forEach(t=>arr.push(t)); } if(S.settings.toddler){arr.push({text:'Read picture book',xp:8,gold:2},{text:'Outside play 10m',xp:8,gold:2})} return arr.map((t,i)=>({id:Date.now()+i,done:false,...t})) }
function regen(){ S.log.tasks=baseQuests(); save(); tasks(); }
function tasks(){ const main=$('#panelMain'), side=$('#panelSide'), bonus=$('#panelBonus'); if(!main) return;
  main.innerHTML=''; side.innerHTML=''; bonus.innerHTML='';
  S.log.tasks.forEach((t,i)=>{
    const row=document.createElement('div'); row.className='row task-row';
    const box=document.createElement('button'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
    box.onclick=()=>{ t.done=!t.done; if(t.done){ S.economy.gold+=t.gold||1; S.pet.xp+=(t.xp||5); play(audio.ding); play(audio.coin); FX.confetti(120); if(Math.random()<.12) FX.crown(); levelCheck(); save(); hud(); } tasks(); };
    const label=document.createElement('div'); label.textContent=t.text;
    row.append(box,label);
    (i<2?main:(i%3==0?bonus:side)).appendChild(row);
  });
  on($('#addTaskBtn'),'click',()=>{ const title=$('#newTaskTitle').value.trim(); if(!title) return; const tier=$('#newTaskTier').value; const t={id:Date.now(),text:title,xp:5,gold:1,done:false}; S.log.tasks.push(t); save(); tasks(); });
}

// ---- Shop
function shop(){ const list=$('#shopList'); if(!list) return; list.innerHTML='';
  const items=[{id:'glasses',label:'Neon Glasses',cost:12},{id:'cape',label:'Mystic Cape',cost:24},{id:'torch',label:'Adventure Torch',cost:10},{id:'crown',label:'Crown',cost:30}];
  for(const it of items){ const row=document.createElement('div'); row.className='row';
    const btn=document.createElement('button'); btn.className='buy primary'; btn.textContent=`Buy (${it.cost}g)`;
    btn.onclick=()=>{ if((S.economy.gold||0)<it.cost) return alert('Need more coins.'); S.economy.gold-=it.cost; S.economy.ownedAcc=uniq([...(S.economy.ownedAcc||[]), it.id]); save(); hud(); play(audio.coin); FX.confetti(120); alert('Purchased '+it.label+'! Equip it on the Character page.'); };
    const span=document.createElement('div'); span.textContent=it.label;
    row.append(span,btn); list.appendChild(row);
  }
}

// ---- Character (advance to companion select)
function char(){ const grid=$('#charGrid'); if(!grid) return; const choices=[
  {id:'bambi',img:'assets/heroes/hero-bambi.png',name:'Bambi'},
  {id:'ash',img:'assets/heroes/hero-ash.png',name:'Ash'},
  {id:'odin',img:'assets/heroes/hero-odin.png',name:'Odin'},
  {id:'fox',img:'assets/heroes/hero-fox.png',name:'Fox'},
];
  grid.innerHTML=''; choices.forEach(c=>{ const card=document.createElement('div'); card.className='char-card'; card.innerHTML=`<div class="sprite anim-walk"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`; card.onclick=()=>{
      S.user.character={id:c.id,img:c.img,anim:'walk'}; save(); partyBanner(); hud(); FX.confetti(100); location.hash = '#companion';
  }; grid.appendChild(card); });
  on($('#uploadChar'),'click',()=> $('#charFile')?.click()); on($('#charFile'),'change',e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ S.user.character={id:'custom',img:r.result,anim:'walk'}; save(); partyBanner(); hud(); location.hash='#companion'; }; r.readAsDataURL(f); });
}

// ---- Companion (multi-select party + toolbar)
function companion(){
  const grid=$('#compGrid'); if(!grid) return;
  // inject toolbar
  const host=grid.parentElement;
  let bar=host.querySelector('.party-toolbar');
  if(!bar){ bar=document.createElement('div'); bar.className='party-toolbar'; bar.innerHTML=`
      <div><strong id="partyCount"></strong></div>
      <div style="display:flex; gap:8px;">
        <button id="btnDone" class="primary">Done</button>
        <button id="btnClear" class="secondary">Clear Party</button>
        <button id="btnAll" class="secondary">Select All</button>
      </div>`;
      host.insertBefore(bar, grid);
  }
  function refreshCount(){ const c = $('#partyCount'); if(c) c.textContent = 'Party: '+(S.party.companions?.length||0); }
  refreshCount();

  const C=CAT(); grid.innerHTML='';
  Object.keys(C).forEach(id=>{
    const c=C[id];
    const card=document.createElement('div');
    card.className='party-card'+(S.party.companions.includes(id)?' selected':'');
    card.innerHTML=`<div class="sprite anim-walk"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`;
    card.onclick=()=>{
      const i=S.party.companions.indexOf(id);
      if(i>=0) S.party.companions.splice(i,1);
      else S.party.companions.push(id);
      S.party.companions = uniq(S.party.companions);
      save(); companion(); partyBanner(); hud();
    };
    grid.appendChild(card);
  });

  // toolbar events
  on($('#btnDone'),'click',()=>{ save(); partyBanner(); hud(); location.hash='#home'; });
  on($('#btnClear'),'click',()=>{ S.party.companions=[]; save(); companion(); partyBanner(); hud(); });
  on($('#btnAll'),'click',()=>{ S.party.companions = uniq(Object.keys(C)); save(); companion(); partyBanner(); hud(); });
}

// ---- Pet (inline svg)
function pet(){ const stage=$('#petStage'); if(!stage) return; stage.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="128" height="128"><defs><radialGradient id="g" cx=".5" cy=".35"><stop offset="0%" stop-color="#00eaff"/><stop offset="100%" stop-color="#8a2be2"/></radialGradient></defs><ellipse cx="60" cy="70" rx="40" ry="35" fill="url(#g)" opacity="0.95"/><circle cx="60" cy="48" r="18" fill="url(#g)" opacity="0.95"/><circle cx="54" cy="44" r="3" fill="#000"/><circle cx="66" cy="44" r="3" fill="#000"/><path d="M60 52 l8 5 -8 5 -8 -5z" fill="#ffd166"/></svg>`; }

// ---- Minigame (toddler)
function minigame(){ const c=$('#popGame'); if(!c) return; if(!S.settings.toddler){ location.hash='#home'; return; } const ctx=c.getContext('2d'), W=c.width,H=c.height; let bs=[],score=0,last=0; function add(){ bs.push({x:Math.random()*W,y:H+20,r:12+Math.random()*18,v:40+Math.random()*50}) } for(let i=0;i<8;i++) add();
  c.onclick=(e)=>{ const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top; for(const b of bs){ if(Math.hypot(b.x-x,b.y-y)<b.r){ b.pop=true; score++; S.economy.gold++; save(); hud(); play(audio.coin); break; } } };
  (function loop(t){ const dt=(t-last)||16; last=t; ctx.clearRect(0,0,W,H); for(const b of bs){ b.y -= b.v*dt/1000; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle='rgba(135,206,250,0.6)'; ctx.fill(); if(b.pop||b.y+b.r<-10){ Object.assign(b,{x:Math.random()*W,y:H+20,r:12+Math.random()*18,v:40+Math.random()*50,pop:false}); } } ctx.fillStyle='#fff'; ctx.fillText('Popped: '+score,12,20); if(score>=20){ S.pet.xp+=20; S.economy.gold+=5; save(); hud(); FX.confetti(200); play(audio.level); ctx.fillText('Great job! +XP +Gold', W/2-80, H/2); return; } requestAnimationFrame(loop); })(0);
}

// ---- Router
const map = {home:'tpl-home',tasks:'tpl-tasks',clean:'tpl-clean',coop:'tpl-coop',budget:'tpl-budget',meals:'tpl-meals',calendar:'tpl-calendar',shop:'tpl-shop',characters:'tpl-characters',companion:'tpl-companion',breathe:'tpl-breathe',minigames:'tpl-minigames',journal:'tpl-journal',checkin:'tpl-checkin',rewards:'tpl-rewards',settings:'tpl-settings'};
const alias = {quests:'tasks',cleaning:'clean',pet:'companion'};
let LAST='';
function routeName(){ const raw=(location.hash||'#home').slice(1)||'home'; return alias[raw]||raw; }
function render(){
  const name=routeName(); if(name===LAST){ return; } LAST=name;
  const tplId=map[name]; const tpl=document.getElementById(tplId); const view=$('#view'); if(!tpl||!view){ console.error('view/tpl missing', name, tplId); return; }
  view.innerHTML=''; view.appendChild(tpl.content.cloneNode(true));
  hud(); partyBanner();
  if(name==='home'){ $$('.tile[data-route]', view).forEach(t=> t.addEventListener('click',()=>{ location.hash='#'+t.getAttribute('data-route'); })); }
  if(name==='tasks'){ if(!S.log.tasks.length) regen(); tasks(); }
  if(name==='shop'){ shop(); }
  if(name==='characters'){ char(); }
  if(name==='companion'){ companion(); }
  if(name==='pet'){ pet(); }
  if(name==='minigames'){ minigame(); }
  $$('.top-nav [data-route]').forEach(el=> el.classList.toggle('active', (alias[el.dataset.route]||el.dataset.route)===name));
}
window.addEventListener('hashchange', ()=>requestAnimationFrame(render));
$('.top-nav')?.addEventListener('click', e=>{ const b=e.target.closest('[data-route]'); if(!b) return; e.preventDefault(); location.hash='#'+b.dataset.route; });

hud(); render();
console.log('SootheBirb hotfix party controls loaded');

/* injected sizing */
(function(){const s=document.createElement('style');s.textContent=`
/* === hard sizing + layout fixes for character/companion art === */
.char-grid, .comp-grid { 
  display: grid !important; 
  grid-template-columns: repeat(auto-fit, minmax(120px,1fr)) !important; 
  gap: 16px !important; 
  align-items: start !important;
}
/* Cards */
.char-card, .party-card { display:grid; place-items:center; padding:8px; }
/* Sprites */
.sprite, .char-card .sprite, .party-card .sprite, .party-members .card .sprite {
  width: 96px !important; height: 96px !important;
}
.sprite img, .char-card .sprite img, .party-card .sprite img, .party-members .card .sprite img {
  width: 100% !important; height: 100% !important; object-fit: contain !important;
  image-rendering: auto !important; /* don't pixelate watercolor heroes */
}
/* Banner readability */
.party-banner, .party-banner .party-label, .party-members .name { color:#111 !important; text-shadow:none !important; }
@media (max-width: 700px){
  .sprite, .char-card .sprite, .party-card .sprite, .party-members .card .sprite {
    width: 80px !important; height: 80px !important;
  }
}
`;document.head.appendChild(s);})();
