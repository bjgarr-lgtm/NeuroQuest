// SootheBirb v2.5.0+ — Adds: Toddler Mode, Party companions, Character equip (paper-doll), Mini-game,
// confetti + crown drop, sounds, and keeps the neon/pixel UI.
const STORAGE_KEY = 'soothebirb.v250p';

function defaultState(){
  return {
    settings: { toddler:false, music:false },
    user: {
      name: '',
      character: { id:'witch', img:'assets/heroes/hero-bambi.png', anim:'walk', rig:null }
    },
    party: { companions: [] },
    economy: { gold: 0, ownedAcc: ['glasses'] },
    equip: { head:null, face:null, back:null, hand:null },
    pet: { level:1, xp:0 },     // used for XP bar
    log: { tasks: [] },
    streak: { cur:0, best:0 }
  };
}
function load(){ try{ return Object.assign(defaultState(), JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')); }catch(e){ return defaultState(); } }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

let state = load();

/* --------------------------- SOUND FX --------------------------- */
const SFX = {
  ding(){
    try{ const a=new AudioContext(); const o=a.createOscillator(); const g=a.createGain();
      o.type='square'; o.frequency.value=880; o.connect(g); g.connect(a.destination);
      const T=a.currentTime; g.gain.setValueAtTime(.0001,T); g.gain.linearRampToValueAtTime(.06,T+.01);
      g.gain.exponentialRampToValueAtTime(.0001,T+.12); o.start(T); o.stop(T+.13);
    }catch(e){}
  },
  coin(){
    try{ const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(); const g=a.createGain();
      o.type='triangle'; o.frequency.setValueAtTime(600,a.currentTime); g.gain.value=.06; o.connect(g); g.connect(a.destination);
      o.frequency.exponentialRampToValueAtTime(1200,a.currentTime+.08); g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.2);
      o.start(); o.stop(a.currentTime+.22);
    }catch(e){}
  },
  level(){
    try{ const a=new AudioContext(); const o=a.createOscillator(); const g=a.createGain();
      o.type='sawtooth'; o.frequency.value=220; g.gain.value=.05; o.connect(g); g.connect(a.destination);
      const T=a.currentTime; o.frequency.exponentialRampToValueAtTime(1760,T+.6); g.gain.exponentialRampToValueAtTime(.0001,T+.65);
      o.start(T); o.stop(T+.66);
    }catch(e){}
  }
};

/* --------------------------- FX (confetti + crown) --------------------------- */
function confettiBurst(count=180){
  const layer = document.getElementById('fxLayer');
  const frag = document.createDocumentFragment();
  for(let i=0;i<count;i++){
    const p=document.createElement('i');
    p.style.cssText=`position:fixed;left:${Math.random()*100}vw;top:-10px;width:8px;height:8px;background:hsl(${Math.random()*360} 90% 60%);transform:rotate(${Math.random()*360}deg);opacity:.9;border-radius:2px;pointer-events:none;transition:transform 1.2s ease-out, top 1.2s ease-out, opacity 1.2s ease-out`;
    frag.appendChild(p);
    requestAnimationFrame(()=>{ p.style.top='110vh'; p.style.transform=`translateY(${50+Math.random()*60}vh) rotate(${360+Math.random()*360}deg)`; p.style.opacity='0'; });
    setTimeout(()=>p.remove(),1400);
  }
  layer.appendChild(frag);
}
function crownDrop(){
  const layer = document.getElementById('fxLayer');
  const crown = document.createElement('img');
  crown.src = 'assets/acc/crown.svg';
  crown.style.cssText='position:fixed;left:50%;top:-120px;width:140px;height:auto;transform:translateX(-50%);filter:drop-shadow(0 0 8px rgba(255,210,0,.7));pointer-events:none';
  layer.appendChild(crown);
  requestAnimationFrame(()=>{
    crown.style.transition='transform .9s cubic-bezier(.2,1,.2,1), top .9s cubic-bezier(.2,1,.2,1)';
    crown.style.top='25vh'; crown.style.transform='translateX(-50%) rotate(4deg)';
  });
  setTimeout(()=>{ crown.style.top='110vh'; crown.style.transform='translateX(-50%) rotate(28deg)'; }, 1200);
  setTimeout(()=> crown.remove(), 2100);
}

/* --------------------------- ROUTER --------------------------- */
const $=s=>document.querySelector(s);
function okRoute(n){ const ok=['home','tasks','clean','coop','budget','meals','calendar','shop','characters','companion','minigames','breathe','journal','checkin','rewards','settings']; return ok.includes(n)?n:'home'; }
function routeTo(n){ location.hash='#'+n; }
function setActive(name){
  const nav=$('.top-nav'); [...nav.querySelectorAll('.nav-btn')].forEach(b=>b.classList.toggle('active', b.dataset.route===name));
  const hi=$('#navHi'); const btn=nav.querySelector(`.nav-btn[data-route="${name}"]`); if(btn){ const r=btn.getBoundingClientRect(), nr=nav.getBoundingClientRect(); hi.style.transform=`translateX(${r.left-nr.left}px)`; hi.style.width=r.width+'px'; }
}
function onHash(){
  const name = okRoute((location.hash||'#home').slice(1));
  setActive(name);
  const v=$('#view'); v.innerHTML='';
  const tpl=$('#tpl-'+name);
  if(!tpl){ v.textContent='Not found'; return; }
  v.appendChild(tpl.content.cloneNode(true));
  initPage(name);
}
window.addEventListener('hashchange', onHash);

/* --------------------------- HUD + XP --------------------------- */
function xpFor(l){ return l*l*10; }
function renderHUD(){
  document.body.classList.toggle('toddler-on', !!state.settings.toddler);
  document.querySelectorAll('.toddlerOnly').forEach(el=> el.style.display = state.settings.toddler ? '' : 'none');
  $('#hudGold').textContent = `🪙 ${state.economy.gold||0}`;
  const lvl=state.pet.level, xp=state.pet.xp, next=xpFor(lvl+1), prev=xpFor(lvl); const pct=Math.round(((xp-prev)/(next-prev))*100);
  $('#hudLevel').textContent=`Lv ${lvl}`; $('#hudXp').style.width = Math.max(0,Math.min(100,pct))+'%';

  // Portraits in HUD
  const av=$('#hudAvatars'); av.innerHTML='';
  av.insertAdjacentHTML('beforeend', `<div class="avatar"><img src="${state.user.character.img}" alt="you"></div>`);
  (state.party.companions||[]).forEach(id=>{
    const img = companionCatalog()[id]?.img;
    if(img) av.insertAdjacentHTML('beforeend', `<div class="avatar"><img src="${img}" alt="${id}"></div>`);
  });

  const toggle = $('#toddlerToggle');
  if(toggle){ toggle.checked = !!state.settings.toddler; toggle.onchange = ()=>{ state.settings.toddler = toggle.checked; save(); renderHUD(); renderParty(); if(location.hash.includes('#tasks')) regenQuests(); }; }
}
function renderParty(){
  const wrap = $('#partyBanner'); if(!wrap) return; wrap.innerHTML='';
  // Character
  wrap.appendChild(partyCard(state.user.character, 'You'));
  // Pet only in toddler mode
  if(state.settings.toddler){
    const pet=document.createElement('div'); pet.className='card';
    pet.innerHTML = `<div class="sprite anim-dance">
      <svg viewBox="0 0 120 120" width="120" height="120"><defs><radialGradient id="g" cx=".5" cy=".35"><stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--accent-2)"/></radialGradient></defs>
      <ellipse cx="60" cy="70" rx="40" ry="35" fill="url(#g)"/><circle cx="60" cy="52" r="18" fill="url(#g)"/></svg></div><div class="name">Pet</div>`;
    wrap.appendChild(pet);
  }
  // Companions
  (state.party.companions||[]).forEach(id=>{
    const c = companionCatalog()[id]; if(!c) return;
    const card=document.createElement('div'); card.className='card';
    card.innerHTML=`<div class="sprite anim-walk"><img src="${c.img}" alt="${c.name}"></div><div class="name">${c.name}</div>`;
    wrap.appendChild(card);
  });
}
function partyCard(character,label){
  const div=document.createElement('div'); div.className='card';
  const anim = character.anim || 'walk';
  const sprite=document.createElement('div'); sprite.className='sprite '+animClass(anim);
  sprite.innerHTML = `<img src="${character.img}" alt="char">`;
  applyEquipLayers(sprite);
  div.appendChild(sprite);
  div.appendChild(Object.assign(document.createElement('div'),{className:'name',textContent:label}));
  return div;
}
function animClass(m){ return m==='walk'?'anim-walk':m==='wave'?'anim-wave':m==='dance'?'anim-dance':'anim-walk'; }

/* --------------------------- CATALOGS --------------------------- */
function companionCatalog(){
  return {
    molly:{ name:'Molly', img:'assets/heroes/comp-molly.png', tasks:[{text:'Feed & water Molly', xp:6, gold:2},{text:'Walk Molly (10m)', xp:8, gold:3}]},
    odin:{  name:'Odin',  img:'assets/heroes/hero-odin.png',  tasks:[{text:'Homework help', xp:7, gold:2},{text:'Snack prep', xp:5, gold:1}]},
    ash:{   name:'Ash',   img:'assets/heroes/hero-ash.png',   tasks:[{text:'Jam session (10m)', xp:6, gold:2},{text:'Message Ash back', xp:4, gold:1}]},
    fox:{   name:'Fox',   img:'assets/heroes/hero-fox.png',   tasks:[{text:'Nature walk (15m)', xp:8, gold:2},{text:'Tea & chill', xp:4, gold:1}]},
  };
}
const ACC_SRC = {
  crown:   'assets/acc/crown.svg',
  glasses: 'assets/acc/glasses.svg',
  cape:    'assets/acc/cape.svg',
  torch:   'assets/acc/torch.svg'
};
function applyEquipLayers(container){
  const eq = state.equip || {};
  const mk=(slot,item)=>{ if(!item||!ACC_SRC[item]) return; const img=document.createElement('img'); img.className='acc '+slot; img.src=ACC_SRC[item]; container.appendChild(img); };
  mk('back',eq.back); mk('head',eq.head); mk('face',eq.face); mk('hand',eq.hand);
}

/* --------------------------- TASKS / QUESTS --------------------------- */
function dailyQuests(){
  const base = [
    { text:'Drink water', xp:5, gold:1 },
    { text:'3-min stretch', xp:5, gold:1 }
  ];
  // Party tasks
  const cat = companionCatalog();
  (state.party.companions || []).forEach(id => (cat[id]?.tasks||[]).forEach(t=> base.push(t)));
  // Toddler overlay
  if(state.settings.toddler){
    base.push({text:'Read picture book together', xp:8, gold:2});
    base.push({text:'Outside play 10 min', xp:8, gold:2});
    base.push({text:'Mini-game time (pop 20)', xp:10, gold:3});
  }
  return base.map((t,i)=> ({id:Date.now()+i, done:false, ...t}));
}
function regenQuests(){ state.log.tasks = dailyQuests(); save(); renderTasks(); }
function renderTasks(){
  const list=$('#questList'); if(!list) return; list.innerHTML='';
  state.log.tasks.forEach(t=>{
    const row=document.createElement('div'); row.className='quest-row';
    const box=document.createElement('div'); box.className='checkbox'+(t.done?' checked':''); box.textContent=t.done?'✓':'';
    box.onclick=()=>{ t.done=!t.done; if(t.done){ state.pet.xp += t.xp||5; state.economy.gold=(state.economy.gold||0)+(t.gold||1); SFX.ding(); SFX.coin(); confettiBurst(120); if(Math.random()<0.1) crownDrop(); maybeLevelUp(); save(); renderHUD(); } renderTasks(); };
    const label=document.createElement('div'); label.textContent=t.text;
    row.append(box,label); list.appendChild(row);
  });
}
function maybeLevelUp(){
  const lvl=state.pet.level, xp=state.pet.xp;
  if(xp >= xpFor(lvl+1)){ state.pet.level++; SFX.level(); confettiBurst(240); crownDrop(); }
}

/* --------------------------- PAGES --------------------------- */
function wireTiles(){ document.querySelectorAll('.tile[data-route]').forEach(t=> t.addEventListener('click', ()=>{ routeTo(t.dataset.route); onHash(); })); }

function initCompanion(){
  const grid=$('#partyPick'); if(!grid) return; grid.innerHTML='';
  const cat = companionCatalog();
  Object.keys(cat).forEach(id=>{
    const c=cat[id]; const el=document.createElement('div');
    el.className='party-card'+(state.party.companions.includes(id)?' selected':'');
    el.innerHTML = `<img src="${c.img}" alt="${c.name}"><div class="name">${c.name}</div>`;
    el.onclick=()=>{ const i=state.party.companions.indexOf(id); if(i>=0) state.party.companions.splice(i,1); else state.party.companions.push(id);
      save(); initCompanion(); renderHUD(); renderParty(); };
    grid.appendChild(el);
  });
  $('#saveParty')?.addEventListener('click', ()=>{ alert('Party saved for today'); save(); renderParty(); });
}

function initCharacters(){
  const grid=$('#charGrid'); if(!grid) return;
  const cards=[{id:'witch',label:'Witch',img:'assets/heroes/hero-bambi.png'},{id:'fox',label:'Fox',img:'assets/heroes/hero-fox.png'},{id:'bard',label:'Bard',img:'assets/heroes/hero-ash.png'}];
  grid.innerHTML=''; cards.forEach(c=>{ const card=document.createElement('div'); card.className='hero'; card.innerHTML=`<img src="${c.img}"/><div class="name">${c.label}</div>`;
    card.onclick=()=>{ state.user.character={...state.user.character,id:c.id,img:c.img}; save(); renderHUD(); preview(); }; grid.appendChild(card); });

  $('#uploadChar')?.addEventListener('click', ()=> $('#charFile').click());
  $('#charFile')?.addEventListener('change', async e=>{ const url=await fileToUrl(e.target); if(!url) return; state.user.character={...state.user.character,id:'custom',img:url}; save(); renderHUD(); preview(); });

  const enable=$('#charRigEnable'), form=$('#charRigForm'); if(enable && form){ form.style.display='none'; enable.onchange=()=> form.style.display = enable.checked?'block':'none'; }
  $('#charRigSave')?.addEventListener('click', async ()=>{
    const rig={...(state.user.character.rig||{})};
    rig.body = await fileToUrl($('#charRigBody')) || rig.body;
    rig.head = await fileToUrl($('#charRigHead')) || rig.head;
    rig.larm = await fileToUrl($('#charRigLArm')) || rig.larm;
    rig.rarm = await fileToUrl($('#charRigRArm')) || rig.rarm;
    rig.prop = await fileToUrl($('#charRigProp')) || rig.prop;
    state.user.character.rig = rig; save(); preview(); renderParty();
  });

  const sel=$('#charAnim'); if(sel){ sel.value=state.user.character.anim||'walk'; sel.onchange=()=>{ state.user.character.anim=sel.value; save(); preview(); renderParty(); }; }

  document.querySelectorAll('.equip').forEach(btn=>{
    btn.onclick = ()=>{ const slot=btn.dataset.slot, item=btn.dataset.item;
      const owned = new Set(state.economy.ownedAcc||[]);
      if(!owned.has(item)) return alert('Buy it in the shop first!');
      state.equip[slot]=item; save(); preview(); renderParty();
    };
  });
  $('.unequip')?.addEventListener('click', ()=>{ state.equip={head:null,face:null,back:null,hand:null}; save(); preview(); renderParty(); });

  function preview(){ const p=$('#charPreview'); p.innerHTML=''; p.appendChild(partyCard(state.user.character,'You')); }
  preview();
}
async function fileToUrl(input){ return await new Promise(res=>{ const f=input?.files?.[0]; if(!f) return res(null); const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(f); }); }

function initShop(){
  document.querySelectorAll('.buy').forEach(b=> b.onclick = ()=>{
    const item=b.dataset.item; const cost={crown:30,glasses:12,cape:24,torch:10}[item];
    if((state.economy.gold||0) < cost) return alert('Need more coins.');
    state.economy.gold -= cost;
    state.economy.ownedAcc = Array.from(new Set([...(state.economy.ownedAcc||[]), item]));
    save(); renderHUD(); confettiBurst(120); SFX.coin(); alert('Purchased '+item+'! Equip it on the Character page.');
  });
}
function initTasks(){ $('#tasksHint').textContent = state.settings.toddler ? 'Toddler mode: kid-quests + mini-games.' : 'Solo mode: adult quests.'; if(!state.log.tasks.length) regenQuests(); renderTasks(); }
function initMiniGames(){ if(!state.settings.toddler){ routeTo('home'); return; } const c=$('#popGame'); if(!c) return; const ctx=c.getContext('2d'), W=c.width,H=c.height; let bubbles=[],score=0,last=0;
  function add(){ bubbles.push({x:Math.random()*W, y:H+20, r:12+Math.random()*18, v:40+Math.random()*50}); } for(let i=0;i<8;i++) add();
  c.onclick=e=>{ const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top; for(const b of bubbles){ if(Math.hypot(b.x-x,b.y-y)<b.r){ b.pop=true; score++; state.economy.gold++; SFX.coin(); save(); renderHUD(); break; } } };
  (function loop(t){ const dt=(t-last)||16; last=t; ctx.clearRect(0,0,W,H);
    for(const b of bubbles){ b.y -= b.v*dt/1000; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle='rgba(135,206,250,0.6)'; ctx.fill(); if(b.pop||b.y+b.r<-10){ Object.assign(b,{x:Math.random()*W,y:H+20,r:12+Math.random()*18,v:40+Math.random()*50,pop:false}); } }
    ctx.fillStyle='#fff'; ctx.fillText('Popped: '+score, 12, 20);
    if(score>=20){ state.pet.xp+=20; state.economy.gold+=5; confettiBurst(180); SFX.level(); save(); renderHUD(); ctx.fillText('Great job! +XP +Gold', W/2-80, H/2); return; }
    requestAnimationFrame(loop);
  })(0);
}
function initPage(name){
  if(name==='home'){ wireTiles(); renderParty(); }
  if(name==='tasks'){ initTasks(); }
  if(name==='characters'){ initCharacters(); }
  if(name==='companion'){ initCompanion(); }
  if(name==='shop'){ initShop(); }
  if(name==='minigames'){ initMiniGames(); }
}

/* --------------------------- BOOT --------------------------- */
function boot(){
  if(!location.hash) location.hash='#home';
  $('#musicBtn')?.addEventListener('click',()=>{ state.settings.music=!state.settings.music; save(); });
  renderHUD(); onHash();
}
boot();
