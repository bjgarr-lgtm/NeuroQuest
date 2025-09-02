/* SootheBirb Add-ons v263 — router shim + toddler/party/equip/minigame + FX/SFX
   SAFE: leaves your existing HTML/CSS and bundle logic alone.
   If this runs, you can read its version via window.SOOTHEBIRB_ADDONS_VERSION.
*/
(function(){
window.SOOTHEBIRB_ADDONS_VERSION = "v263";
const STORAGE_KEY = 'soothebirb.addons.v263';
function defaults(){ return {
  settings:{toddler:false,music:false},
  party:{companions:[]},
  economy:{gold:0,ownedAcc:['glasses']},
  equip:{head:null,face:null,back:null,hand:null},
  user:{character:{id:'witch',img:'assets/heroes/hero-bambi.png',anim:'walk',rig:null}},
  pet:{level:1,xp:0}, log:{tasks:[]}, streak:{cur:0,best:0}
};}
function deepMerge(a,b){ if(Array.isArray(a)) return Array.isArray(b)?b.slice():a.slice();
  if(a&&typeof a==='object'){ const o={...a}; for(const k of Object.keys(b||{})) o[k]=deepMerge(a[k],b[k]); return o;}
  return b===undefined?a:b;
}
function load(){ try{return deepMerge(defaults(),JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'));}catch{return defaults();}}
function save(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
let state=load();
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)); const on=(el,ev,fn)=>el&&el.addEventListener(ev,fn);

/* minimal styles (non-invasive) */
(function(){
  if(document.getElementById('addonStyles')) return;
  const st=document.createElement('style'); st.id='addonStyles'; st.textContent=`
  .sprite,.rig{position:relative;width:132px;height:132px}
  .sprite img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated}
  .rig .layer{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:132px;height:132px;object-fit:contain;image-rendering:pixelated}
  .rig .body{z-index:2}.rig .head{z-index:3;transform-origin:50% 70%}.rig .armL{z-index:4;transform-origin:45% 20%}.rig .armR{z-index:4;transform-origin:55% 20%}.rig .prop{z-index:5}
  .acc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none}
  .acc.head{z-index:6;transform-origin:50% 70%}.acc.face{z-index:6}.acc.back{z-index:1}.acc.hand{z-index:6}
  @keyframes step{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes headBob{0%,100%{transform:translate(-50%,-50%) rotate(0)}50%{transform:translate(-50%,-52%) rotate(-3deg)}}
  @keyframes armWave{0%,100%{transform:translate(-50%,-50%) rotate(0)}50%{transform:translate(-50%,-50%) rotate(28deg)}}
  .anim-walk img,.anim-walk .layer{animation:step .38s ease-in-out infinite}
  .anim-wave .head,.anim-wave img{animation:headBob 1.6s ease-in-out infinite}
  .anim-wave .armR{animation:armWave 1.1s ease-in-out infinite}
  body.toddler-on{background:radial-gradient(1200px 500px at 30% -10%,rgba(255,182,193,.12),transparent),#000}
  canvas.game{width:100%;background:#0a0a0a;border:2px solid rgba(255,255,255,.08);border-radius:10px}
  .is-hidden{display:none!important}`;
  document.head.appendChild(st);
})();

/* SFX / FX */
const audio={ ding:new Audio('assets/sfx/ding.wav'), coin:new Audio('assets/sfx/coin.wav'),
  level:new Audio('assets/sfx/level.wav'), bgm:new Audio('assets/sfx/bgm.wav') };
if(audio.bgm){ audio.bgm.loop=true; audio.bgm.volume=.35; }
const SFX={
  _p(a){ try{a.currentTime=0; a.play();}catch{} },
  ding(){ isFinite(audio.ding.duration)?SFX._p(audio.ding):null; },
  coin(){ isFinite(audio.coin.duration)?SFX._p(audio.coin):null; },
  level(){ isFinite(audio.level.duration)?SFX._p(audio.level):null; }
};
(function musicBtn(){ const b=document.getElementById('musicBtn'); if(!b) return;
  b.addEventListener('click',async()=>{ state.settings.music=!state.settings.music; save(); b.classList.toggle('on',state.settings.music);
    if(state.settings.music){ try{ await audio.bgm.play(); }catch{} } else { try{ audio.bgm.pause(); }catch{} }
  });
})();
const FX={
  layer:(()=>{ let d=document.getElementById('fxLayer'); if(!d){ d=document.createElement('div');
    d.id='fxLayer'; d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999'; document.body.appendChild(d);} return d; })(),
  confetti(n=180){ const f=document.createDocumentFragment();
    for(let i=0;i<n;i++){ const p=document.createElement('i');
      p.style.cssText=`position:fixed;left:${Math.random()*100}vw;top:-8px;width:8px;height:8px;background:hsl(${Math.random()*360} 90% 60%);opacity:.95;border-radius:2px;pointer-events:none;transform:translateY(0) rotate(${Math.random()*360}deg);transition:transform 1.2s ease-out,top 1.2s ease-out,opacity 1.2s ease-out`;
      f.appendChild(p); requestAnimationFrame(()=>{ p.style.top='110vh'; p.style.transform=`translateY(${50+Math.random()*60}vh) rotate(${360+Math.random()*360}deg)`; p.style.opacity='0'; });
      setTimeout(()=>p.remove(),1400);
    } this.layer.appendChild(f);
  },
  crown(){ const img=document.createElement('img'); img.src='assets/acc/crown.svg'; img.alt='crown';
    img.style.cssText='position:fixed;left:50%;top:-120px;transform:translateX(-50%);width:140px;filter:drop-shadow(0 0 8px rgba(255,210,0,.7))'; this.layer.appendChild(img);
    requestAnimationFrame(()=>{ img.style.transition='transform .9s cubic-bezier(.2,1,.2,1), top .9s cubic-bezier(.2,1,.2,1)'; img.style.top='25vh'; img.style.transform='translateX(-50%) rotate(4deg)'; });
    setTimeout(()=>{ img.style.top='110vh'; img.style.transform='translateX(-50%) rotate(28deg)'; },1200); setTimeout(()=>img.remove(),2100);
  }
};

/* cursor trail */
(function(){ const MAX=20, pts=[]; const c=document.createElement('canvas'); c.width=innerWidth;c.height=innerHeight;
  c.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9998'; document.body.appendChild(c);
  const g=c.getContext('2d'); addEventListener('resize',()=>{c.width=innerWidth;c.height=innerHeight});
  document.addEventListener('pointermove',e=>{ pts.push({x:e.clientX,y:e.clientY}); while(pts.length>MAX) pts.shift(); });
  (function loop(){ g.clearRect(0,0,c.width,c.height); for(let i=0;i<pts.length;i++){ const p=pts[i],a=(i+1)/pts.length;
    g.beginPath(); g.arc(p.x,p.y,2+4*a,0,Math.PI*2); g.fillStyle=`rgba(0,234,255,${0.12+0.25*a})`; g.fill(); } requestAnimationFrame(loop); })();
})();

/* companions + acc */
function catalog(){ return {
  molly:{name:'Molly',img:'assets/heroes/comp-molly.png',tasks:[{text:'Feed & water Molly',xp:6,gold:2},{text:'Walk Molly (10m)',xp:8,gold:3}]},
  odin:{name:'Odin',img:'assets/heroes/hero-odin.png',tasks:[{text:'Homework help',xp:7,gold:2},{text:'Snack prep',xp:5,gold:1}]},
  ash:{name:'Ash',img:'assets/heroes/hero-ash.png',tasks:[{text:'Jam session (10m)',xp:6,gold:2},{text:'Message Ash back',xp:4,gold:1}]},
  fox:{name:'Fox',img:'assets/heroes/hero-fox.png',tasks:[{text:'Nature walk (15m)',xp:8,gold:2},{text:'Tea & chill',xp:4,gold:1}]},
};}
const ACC={crown:'assets/acc/crown.svg',glasses:'assets/acc/glasses.svg',cape:'assets/acc/cape.svg',torch:'assets/acc/torch.svg'};

/* xp/level */
function xpFor(l){ return l*l*10; }
function maybeLevel(){ const need=xpFor(state.pet.level+1); if(state.pet.xp>=need){ state.pet.level++; SFX.level(); FX.confetti(260); FX.crown(); save(); renderHUD(); } }

/* HUD + party banner */
function renderHUD(){
  document.body.classList.toggle('toddler-on',!!state.settings.toddler);
  const g=$('#hudGold'); if(g) g.textContent=`🪙 ${state.economy.gold||0}`;
  const lv=$('#hudLevel'), bar=$('#hudXp'); if(lv&&bar){ const L=state.pet.level,x=state.pet.xp,n=xpFor(L+1),p=xpFor(L);
    lv.textContent=`Lv ${L}`; bar.style.width=clamp(Math.round(((x-p)/(n-p))*100),0,100)+'%'; }
  const tg=$('#toddlerToggle'); if(tg){ tg.checked=!!state.settings.toddler; tg.onchange=()=>{ state.settings.toddler=tg.checked; save(); renderHUD(); renderParty(); if($('#questList')) regen(); }; }
  const hudAv=$('#hudAvatars'); if(hudAv){ hudAv.innerHTML=''; hudAv.insertAdjacentHTML('beforeend',`<div class="avatar"><img src="${state.user.character.img}" alt="you"></div>`);
    (state.party.companions||[]).forEach(id=>{ const img=catalog()[id]?.img; if(img) hudAv.insertAdjacentHTML('beforeend',`<div class="avatar"><img src="${img}" alt="${id}"></div>`); }); }
}
function renderParty(){
  const wrap=$('#partyBanner'); if(!wrap) return; wrap.innerHTML='';
  const you=document.createElement('div'); you.className='card';
  const sp=document.createElement('div'); sp.className='sprite anim-walk'; sp.innerHTML=`<img src="${state.user.character.img}" alt="You">`; equip(sp);
  you.appendChild(sp); you.appendChild(Object.assign(document.createElement('div'),{className:'name',textContent:'You'})); wrap.appendChild(you);
  if(state.settings.toddler){ const pet=document.createElement('div'); pet.className='card'; pet.innerHTML=`<div class="sprite anim-wave"><svg viewBox="0 0 120 120" width="120" height="120"><defs><radialGradient id="g" cx=".5" cy=".35"><stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--accent-2)"/></radialGradient></defs><ellipse cx="60" cy="70" rx="40" ry="35" fill="url(#g)"/><circle cx="60" cy="52" r="18" fill="url(#g)"/></svg></div><div class="name">Pet</div>`; wrap.appendChild(pet); }
  (state.party.companions||[]).forEach(id=>{ const c=catalog()[id]; if(!c) return; const card=document.createElement('div'); card.className='card';
    card.innerHTML=`<div class="sprite anim-walk"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`; wrap.appendChild(card); });
}
function equip(container){ const e=state.equip||{}; const add=(slot,key)=>{ if(!key||!ACC[key]) return; const i=document.createElement('img'); i.className='acc '+slot; i.src=ACC[key]; container.appendChild(i); };
  add('back',e.back); add('head',e.head); add('face',e.face); add('hand',e.hand);
}

/* quests */
function base(){ const arr=[{text:'Drink water',xp:5,gold:1},{text:'3-min stretch',xp:5,gold:1}];
  const cat=catalog(); (state.party.companions||[]).forEach(id=>(cat[id]?.tasks||[]).forEach(t=>arr.push(t)));
  if(state.settings.toddler){ arr.push({text:'Read picture book',xp:8,gold:2},{text:'Outside play 10m',xp:8,gold:2},{text:'Mini-game time (pop 20)',xp:10,gold:3}); }
  return arr.map((t,i)=>({id:Date.now()+i,done:false,...t}));
}
function regen(){ state.log.tasks=base(); save(); renderTasks(); }
function renderTasks(){ const list=$('#questList'); if(!list) return; list.innerHTML='';
  state.log.tasks.forEach(t=>{ const row=document.createElement('div'); row.className='quest-row';
    const box=document.createElement('div'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
    box.onclick=()=>{ t.done=!t.done; if(t.done){ state.economy.gold=(state.economy.gold||0)+(t.gold||1); state.pet.xp+=t.xp||5; SFX.ding(); SFX.coin(); FX.confetti(120); if(Math.random()<.1) FX.crown(); maybeLevel(); save(); renderHUD(); } renderTasks(); };
    const label=document.createElement('div'); label.textContent=t.text; row.append(box,label); list.appendChild(row);
  });
}

/* shop + character */
function wireShop(){ $$('.buy').forEach(b=> on(b,'click',()=>{ const item=b.dataset.item; const cost={crown:30,glasses:12,cape:24,torch:10}[item]??10;
  if((state.economy.gold||0)<cost) return alert('Need more coins.'); state.economy.gold-=cost; state.economy.ownedAcc=Array.from(new Set([...(state.economy.ownedAcc||[]),item]));
  save(); renderHUD(); SFX.coin(); FX.confetti(120); alert('Purchased '+item+'! Equip it on the Character page.'); })); }
function wireChar(){
  $$('.equip').forEach(b=> on(b,'click',()=>{ const slot=b.dataset.slot, item=b.dataset.item; const owned=new Set(state.economy.ownedAcc||[]); if(!owned.has(item)) return alert('Buy it in the shop first.');
    state.equip[slot]=item; save(); renderHUD(); renderParty(); refreshChar(); }));
  on($('.unequip'),'click',()=>{ state.equip={head:null,face:null,back:null,hand:null}; save(); renderHUD(); renderParty(); refreshChar(); });
  on($('#uploadChar'),'click',()=> $('#charFile')?.click());
  on($('#charFile'),'change',e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ state.user.character={...state.user.character,id:'custom',img:r.result}; save(); renderHUD(); renderParty(); refreshChar(); }; r.readAsDataURL(f); });
  const sel=$('#charAnim'); if(sel){ sel.value=state.user.character.anim||'walk'; on(sel,'change',()=>{ state.user.character.anim=sel.value; save(); renderParty(); refreshChar(); }); }
  refreshChar();
}
function refreshChar(){ const p=$('#charPreview'); if(!p) return; p.innerHTML=''; const sp=document.createElement('div'); sp.className='sprite anim-walk'; sp.innerHTML=`<img src="${state.user.character.img}" alt="you">`; equip(sp); p.appendChild(sp); }

/* companion select */
function wireComp(){ const grid=$('#partyPick'); if(!grid) return; const cat=catalog(); grid.innerHTML='';
  Object.keys(cat).forEach(id=>{ const c=cat[id]; const el=document.createElement('div'); el.className='party-card'+(state.party.companions.includes(id)?' selected':'');
    el.innerHTML=`<img src="${c.img}" alt="${c.name}"><div class="name">${c.name}</div>`; el.onclick=()=>{ const i=state.party.companions.indexOf(id); if(i>=0) state.party.companions.splice(i,1); else state.party.companions.push(id); save(); wireComp(); renderHUD(); renderParty(); }; grid.appendChild(el); });
  on($('#saveParty'),'click',()=>{ alert('Party saved'); save(); renderParty(); if($('#questList')) regen(); });
}

/* toddler mini-game */
function mini(){ const c=$('#popGame'); if(!c) return; if(!state.settings.toddler){ location.hash='#home'; return; }
  const ctx=c.getContext('2d'), W=c.width, H=c.height; let bs=[],score=0,last=0; function add(){ bs.push({x:Math.random()*W,y:H+20,r:12+Math.random()*18,v:40+Math.random()*50}); }
  for(let i=0;i<8;i++) add();
  on(c,'click',e=>{ const r=c.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top; for(const b of bs){ if(Math.hypot(b.x-x,b.y-y)<b.r){ b.pop=true; score++; state.economy.gold++; SFX.coin(); save(); renderHUD(); break; } } });
  (function loop(t){ const dt=(t-last)||16; last=t; ctx.clearRect(0,0,W,H);
    for(const b of bs){ b.y-=b.v*dt/1000; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle='rgba(135,206,250,0.6)'; ctx.fill(); if(b.pop||b.y+b.r<-10){ Object.assign(b,{x:Math.random()*W,y:H+20,r:12+Math.random()*18,v:40+Math.random()*50,pop:false}); } }
    ctx.fillStyle='#fff'; ctx.fillText('Popped: '+score,12,20);
    if(score>=20){ state.pet.xp+=20; state.economy.gold+=5; save(); renderHUD(); FX.confetti(200); SFX.level(); ctx.fillText('Great job! +XP +Gold', W/2-80, H/2); return; }
    requestAnimationFrame(loop);
  })(0);
}

/* tile + top nav */
function tiles(){ $$('.tile[data-route]').forEach(t=> on(t,'click',()=>{ location.hash='#'+t.dataset.route; })); }
function topnav(){ const nav=document.querySelector('.top-nav'); if(!nav) return; nav.addEventListener('click',e=>{ const b=e.target.closest('[data-route]'); if(!b) return; e.preventDefault(); location.hash='#'+b.dataset.route; }); }

/* router shim — show a view even if the bundle’s router doesn’t */
const Router=(function(){ let views={}, order=[];
  function detect(){ views={}; order=[];
    const cand=new Set(); $$('a[href^="#"]').forEach(a=>{ const r=a.getAttribute('href').slice(1); if(r) cand.add(r); });
    $$('[data-route]').forEach(b=>{ const r=b.getAttribute('data-route'); if(r) cand.add(r); });
    ['home','dashboard','quests','cleaning','shop','characters','companion','minigames','journal','breathe','calendar','budget','meals','rewards','checkin','settings'].forEach(r=>cand.add(r));
    cand.forEach(r=>{ const el=document.getElementById(r) || document.querySelector(`[data-view="${r}"]`) || document.querySelector(`[data-screen="${r}"]`) || document.querySelector(`[data-route-target="${r}"]`); if(el){ views[r]=el; order.push(r);} });
    if(order.length===0){ document.querySelectorAll('main section,.view,.screen').forEach((el,i)=>{ const id=el.id||('view'+i); views[id]=el; order.push(id); }); }
  }
  function show(route){ if(!route) route=location.hash.slice(1); if(!route) route=views.home?'home':order[0];
    Object.values(views).forEach(el=>el.classList.add('is-hidden'));
    const tgt=views[route]||views.home||views[order[0]]; if(tgt) tgt.classList.remove('is-hidden');
    $$('[data-route], a[href^="#"]').forEach(el=>{ const r=el.getAttribute('data-route')||(el.getAttribute('href')||'').replace('#',''); if(r) el.classList.toggle('active',r===route); });
  }
  function init(){ detect(); show(); }
  return {init,show,detect};
})();

/* hash change */
function onHash(){ Router.show(location.hash.slice(1)); renderHUD(); renderParty();
  const name=(location.hash||'#home').slice(1);
  if(name==='home'||name==='dashboard') tiles();
  if(name==='tasks'||name==='quests'){ if(!state.log.tasks.length) regen(); renderTasks(); }
  if(name==='shop') wireShop();
  if(name==='characters') wireChar();
  if(name==='companion') wireComp();
  if(name==='minigames') mini();
}
addEventListener('hashchange',onHash);

/* boot */
(function boot(){ Router.init(); topnav(); renderHUD(); renderParty(); onHash();
  document.addEventListener('change',e=>{ if(e.target.matches('input[type="checkbox"]') && e.target.closest('#questList')){ SFX.ding(); SFX.coin(); FX.confetti(80); } });
})();
})();
